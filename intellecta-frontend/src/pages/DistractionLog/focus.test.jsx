import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import PerformanceDashboard from "./focus";

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));
jest.mock("../../services/api", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));
jest.mock("../../utils/auth", () => ({
  getUserId: () => 1,
}));
jest.mock("../../components/dashboard/Navbar", () => () => null);
jest.mock("../../components/dashboard/StudentSidebar", () => () => null);

import api from "../../services/api";

const todayAt = (hour, minute = 0) => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
};

const daysAgoAt = (daysAgo, hour, minute = 0) => {
  const d = todayAt(hour, minute);
  d.setDate(d.getDate() - daysAgo);
  return d;
};

const session = (startTime, extra = {}) => ({
  id: 1,
  subject: "Math",
  startTime: startTime.toISOString(),
  endTime: new Date(startTime.getTime() + 30 * 60000).toISOString(),
  durationMinutes: 30,
  deepWork: false,
  ...extra,
});

const distraction = (loggedAt, extra = {}) => ({
  id: 1,
  reason: "Phone notification",
  loggedAt: loggedAt.toISOString(),
  ...extra,
});

beforeEach(() => {
  api.get.mockReset();
});

afterEach(cleanup);

describe("Cognitive Behavioral Audit (Bugs 1.1.1 - 1.1.4)", () => {
  test("1.1.4: with no sessions, audit shows empty state instead of fabricated cards", async () => {
    api.get.mockImplementation(() => Promise.resolve({ data: [] }));

    render(<PerformanceDashboard />);

    expect(await screen.findByText("No study data available yet.")).toBeInTheDocument();
    expect(
      screen.getByText("Complete a focus session to unlock this audit.")
    ).toBeInTheDocument();
  });

  test("1.1.2/1.1.3: sessions older than the 7-day window still feed Circadian Rhythm but not the Prime Slot", async () => {
    const oldSession = session(daysAgoAt(20, 10)); // 10:00-10:30, 20 days ago
    api.get.mockImplementation((url) => {
      if (url.includes("/distractions/")) return Promise.resolve({ data: [] });
      if (url.includes("/quizzes/")) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [oldSession] });
    });

    render(<PerformanceDashboard />);

    // Audit card exists (sessions.length > 0) and is fed by ALL sessions -> 10:00-12:00
    expect(await screen.findByText("10:00 — 12:00")).toBeInTheDocument();
    // Prime Slot is scoped to the past 7 days only -> no data, no fabricated window
    expect(screen.getByText("No data yet")).toBeInTheDocument();
  });

  test("1.1.2: sessions in the past 7 days yield a real Prime Slot window", async () => {
    const recentSession = session(todayAt(9)); // today 09:00 -> slot 1 -> 08:00-10:00
    api.get.mockImplementation((url) => {
      if (url.includes("/distractions/")) return Promise.resolve({ data: [] });
      if (url.includes("/quizzes/")) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [recentSession] });
    });

    render(<PerformanceDashboard />);

    // Shows in both the audit's Circadian Rhythm and the heatmap's Prime Slot
    expect(await screen.findAllByText("08:00 — 10:00")).toHaveLength(2);
  });

  test("1.1.1 end-to-end: distractions inside a session window hurt Concentration Quality", async () => {
    const s = session(todayAt(9)); // 09:00-09:30
    const d = distraction(new Date(todayAt(9).getTime() + 10 * 60000)); // inside window
    api.get.mockImplementation((url) => {
      if (url.includes("/distractions/")) return Promise.resolve({ data: [d] });
      if (url.includes("/quizzes/")) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [s] });
    });

    render(<PerformanceDashboard />);

    // 1 concentrated session out of 1 -> would be 100%; with the distraction: 0%
    expect(await screen.findByText("0%")).toBeInTheDocument();
  });

  test("1.1.1 end-to-end: distractions outside every session window keep Concentration Quality at 100%", async () => {
    const s = session(todayAt(9)); // 09:00-09:30
    const d = distraction(new Date(todayAt(8).getTime() + 30 * 60000)); // 08:30, outside
    api.get.mockImplementation((url) => {
      if (url.includes("/distractions/")) return Promise.resolve({ data: [d] });
      if (url.includes("/quizzes/")) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [s] });
    });

    render(<PerformanceDashboard />);

    expect(await screen.findByText("100%")).toBeInTheDocument();
  });

  test("audit depth score reflects fraction of distraction-free sessions", async () => {
    const s1 = session(todayAt(9)); // has distraction
    const s2 = session(daysAgoAt(1, 14)); // clean
    const d = distraction(new Date(todayAt(9).getTime() + 10 * 60000));
    api.get.mockImplementation((url) => {
      if (url.includes("/distractions/")) return Promise.resolve({ data: [d] });
      if (url.includes("/quizzes/")) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [s1, s2] });
    });

    render(<PerformanceDashboard />);

    expect(await screen.findByText("50%")).toBeInTheDocument();
  });
});

// ── Mastery Deficits (Bugs 1.2.1 - 1.2.5) ────────────────────────────────

const objectiveQuiz = (topic, category, objectiveCount) => ({
  id: 1,
  topic,
  category,
  questions: Array.from({ length: objectiveCount }, (_, i) => ({
    id: i + 1,
    questionType: "OBJECTIVE",
  })),
});

const attempt = (overrides = {}) => ({
  id: 1,
  score: 0,
  totalQuestions: 0,
  graded: true,
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  status: "COMPLETED",
  quiz: objectiveQuiz("Calculus", "Math", 1),
  ...overrides,
});

describe("Mastery Deficits (Bugs 1.2.1 - 1.2.4)", () => {
  const mockApiFor = (attemptsData, sessionsData = []) => {
    api.get.mockImplementation((url) => {
      if (url.includes("/distractions/")) return Promise.resolve({ data: [] });
      if (url.includes("/quizzes/")) return Promise.resolve({ data: attemptsData });
      return Promise.resolve({ data: sessionsData });
    });
  };

  test("1.2.1: ungraded PENDING_REVIEW attempts are excluded (no false 0% deficits)", async () => {
    mockApiFor([
      attempt({
        id: 1,
        score: 4,
        totalQuestions: 4,
        graded: true,
        quiz: objectiveQuiz("Calculus", "Math", 4),
      }),
      attempt({
        id: 2,
        score: 0,
        totalQuestions: 4,
        graded: false,
        status: "PENDING_REVIEW",
        quiz: objectiveQuiz("Calculus", "Math", 4),
      }),
    ]);

    render(<PerformanceDashboard />);

    // Only the graded attempt counts: 4/4 -> 100% mastered
    expect(await screen.findByText("Concept mastered")).toBeInTheDocument();
    expect(screen.queryByText("Requires immediate review")).not.toBeInTheDocument();
  });

  test("1.2.1: when only ungraded attempts exist, section shows the empty state", async () => {
    mockApiFor([
      attempt({
        id: 1,
        score: 0,
        totalQuestions: 4,
        graded: false,
        status: "PENDING_REVIEW",
        quiz: objectiveQuiz("Calculus", "Math", 4),
      }),
    ]);

    render(<PerformanceDashboard />);

    expect(await screen.findByText("No quiz data available yet.")).toBeInTheDocument();
  });

  test("1.2.2: all attempts (not just latest per quiz) are averaged", async () => {
    mockApiFor([
      attempt({
        id: 1,
        score: 2,
        totalQuestions: 4,
        quiz: objectiveQuiz("Calculus", "Math", 4),
      }),
      attempt({
        id: 2,
        score: 4,
        totalQuestions: 4,
        quiz: objectiveQuiz("Calculus", "Math", 4),
      }),
    ]);

    render(<PerformanceDashboard />);

    // average = (50% + 100%) / 2 = 75%
    expect(await screen.findByText("75%")).toBeInTheDocument();
  });

  test("1.2.3: denominator is objective question count, not total questions", async () => {
    mockApiFor([
      attempt({
        id: 1,
        score: 3,
        totalQuestions: 5, // 2 descriptive questions included in total
        quiz: objectiveQuiz("Calculus", "Math", 3),
      }),
    ]);

    render(<PerformanceDashboard />);

    // 3/3 objective -> 100%, not 3/5 = 60%
    expect(await screen.findByText("Concept mastered")).toBeInTheDocument();
  });

  test("1.2.4: groups by quiz topic first; category only as fallback", async () => {
    mockApiFor([
      attempt({
        id: 1,
        score: 4,
        totalQuestions: 4,
        quiz: objectiveQuiz("Calculus", "Math", 4),
      }),
      attempt({
        id: 2,
        score: 4,
        totalQuestions: 4,
        quiz: { ...objectiveQuiz("Some Topic", "Physics", 4), topic: null },
      }),
    ]);

    render(<PerformanceDashboard />);

    expect(await screen.findByText("Calculus")).toBeInTheDocument();
    // topic is null -> falls back to the category (not "Some Topic")
    expect(screen.getByText("Physics")).toBeInTheDocument();
    expect(screen.queryByText("Some Topic")).not.toBeInTheDocument();
  });
});