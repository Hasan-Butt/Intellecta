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