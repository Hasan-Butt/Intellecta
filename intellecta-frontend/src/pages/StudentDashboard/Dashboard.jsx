import { useState } from "react";
import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/StudentSidebar";

// ── Figma asset URLs ──────────────────────────────────────────────────────────
const imgLeaderboardUser =
  "https://www.figma.com/api/mcp/asset/d6e2420d-b287-4faa-99e5-cec266dae359";
// const imgLeaderboardUser1 =
//   "https://www.figma.com/api/mcp/asset/01747dd6-03fe-45b0-a02a-19352824f453";
const imgCurrentUser =
  "https://www.figma.com/api/mcp/asset/de6187fa-657d-4895-a61f-89df2ee4c707";
const imgDailyTipCard =
  "https://www.figma.com/api/mcp/asset/ecee153a-f7f9-4e4a-a8c5-55ed756c98c6";
const imgGradient =
  "https://www.figma.com/api/mcp/asset/c9e33b0b-5899-4842-af5b-78200a95cfdb";
// const imgFrame1 =
//   "https://www.figma.com/api/mcp/asset/a914574f-30a9-4618-8537-39f62287213b";
const imgOverlayOverlayBlur =
  "https://www.figma.com/api/mcp/asset/7865af56-4d99-4907-9238-a1d91d6c6aa1";

// ── Icons & Helpers ────────────────────────────────────────────────────────────
const PlayIcon = () => (
  <svg width="11" height="14" viewBox="0 0 11 14" fill="none">
    <path
      d="M1 1L10 7L1 13V1Z"
      fill="#451ebb"
      stroke="#451ebb"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);
const TimerIcon = () => (
  <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
    <circle cx="10" cy="9" r="6" stroke="white" strokeWidth="1.5" />
    <path
      d="M10 3V1M7 1H13"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M10 6V9L12 11"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
const RescheduleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M1 7C1 3.686 3.686 1 7 1C9.21 1 11.14 2.17 12.24 3.93"
      stroke="#451ebb"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M13 7C13 10.314 10.314 13 7 13C4.79 13 2.86 11.83 1.76 10.07"
      stroke="#451ebb"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M12 1L12.24 3.93L9.5 4"
      stroke="#451ebb"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 13L1.76 10.07L4.5 10"
      stroke="#451ebb"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const AddIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M6 1V11M1 6H11"
      stroke="#451ebb"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
const CheckIcon = ({ color = "white" }) => (
  <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
    <path
      d="M1 3.5L3.5 6L9 1"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const FireIcon = () => (
  <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
    <path
      d="M8 1C8 1 12 5 12 9C12 11.76 10.21 14.09 7.73 14.83C8.54 13.8 9 12.46 9 11C9 8.24 7.27 5.91 5.14 4.71C5.68 6.17 5.63 7.8 4.95 9.22C4.27 7.59 3.16 6.19 2.76 4.43C1.66 6 1 7.93 1 10C1 13.87 4.13 17 8 17C11.87 17 15 13.87 15 10C15 5.5 11 2 8 1Z"
      fill="#f59e0b"
    />
  </svg>
);
const StarIcon = () => (
  <svg width="17" height="15" viewBox="0 0 17 15" fill="none">
    <path
      d="M8.5 1L10.59 5.26L15.27 5.93L11.89 9.22L12.68 13.93L8.5 11.73L4.32 13.93L5.11 9.22L1.73 5.93L6.41 5.26L8.5 1Z"
      fill="#451ebb"
      stroke="#451ebb"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
);
const LeafIcon = () => (
  <svg width="17" height="15" viewBox="0 0 17 15" fill="none">
    <path
      d="M2 13C2 13 4 7 9 5C14 3 15 1 15 1C15 1 14 8 9 10C6.5 11 4 11 2 13Z"
      fill="#22c55e"
      stroke="#22c55e"
      strokeWidth="1"
    />
    <path d="M2 13L6 9" stroke="white" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

function CircularProgress({ pct = 70, size = 80 }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke="#e6deff"
        strokeWidth="8"
      />
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke="#451ebb"
        strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
      />
      <text
        x="40"
        y="44"
        textAnchor="middle"
        fill="#161c27"
        fontSize="14"
        fontWeight="700"
        fontFamily="Manrope, sans-serif"
      >
        {pct}%
      </text>
    </svg>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────────
const focusData = [
  { day: "Mon", focus: 96, distraction: false },
  { day: "Tue", focus: 144, distraction: true },
  { day: "Wed", focus: 128, distraction: false },
  { day: "Thu", focus: 185, distraction: true },
  { day: "Fri", focus: 160, distraction: false },
  { day: "Sat", focus: 80, distraction: false },
  { day: "Sun", focus: 64, distraction: false },
];
const maxFocus = Math.max(...focusData.map((d) => d.focus));

const scheduleItems = [
  {
    time: "09:00 AM",
    subject: "Advanced Cognitive Psychology",
    topic: "Chapter 4: Memory Retrieval Models",
    color: "#6bfe9c",
    badge: "Active",
  },
  {
    time: "01:30 PM",
    subject: "Data Science Fundamentals",
    topic: "Practical Lab: Logistic Regression",
    color: "#e6deff",
    duration: "90 mins",
  },
  {
    time: "04:00 PM",
    subject: "Digital Ethics Seminar",
    topic: "Reading: The Algorithmic Bias",
    color: "#ffdfa0",
    duration: "45 mins",
  },
];

const initialChecklist = [
  {
    id: 1,
    label: "Verify Exam Center",
    sub: "Completed yesterday",
    done: true,
  },
  {
    id: 2,
    label: "Download Hall Ticket",
    sub: "PDF required for entry",
    done: false,
  },
  {
    id: 3,
    label: "Stationery Check",
    sub: "2B Pencils, Eraser, Pens",
    done: false,
  },
];

const reviewQueue = [
  { id: 1, title: "Laplace Theory", sub: "Overdue 2 days", urgent: true },
  { id: 2, title: "SQL Joins Deep Dive", sub: "Due today", urgent: false },
];

function DistractionLog() {
  const tags = [
    {
      label: "Social Media",
      color: "text-[#ba1a1a]",
      bg: "bg-[#fff1f0]",
      border: "border-[#ffdad6]",
    },
    {
      label: "Phone Call",
      color: "text-[#8a5100]",
      bg: "bg-[#fff8f1]",
      border: "border-[#ffdcbe]",
    },
    {
      label: "Noise",
      color: "text-[#484554]",
      bg: "bg-[#f1f3ff]",
      border: "border-[#e0e1eb]",
    },
    {
      label: "Hunger",
      color: "text-[#484554]",
      bg: "bg-[#f1f3ff]",
      border: "border-[#e0e1eb]",
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 flex flex-col justify-between shadow-lg border border-gray-100 h-[281px] w-full">
      <div>
        <h3 className="font-bold text-[#161c27] text-sm uppercase tracking-wider mb-4">
          Distraction Log
        </h3>

        {/* Input Field */}
        <div className="relative flex items-center mb-4">
          <input
            type="text"
            placeholder="What broke your focus?"
            className="w-full bg-[#f4f7ff] border-none rounded-2xl py-3 px-4 text-xs outline-none placeholder:text-gray-400"
          />
          <button className="absolute right-2 bg-[#e6deff] p-1.5 rounded-full hover:bg-[#d8dfff] transition-colors scale-75">
            <AddIcon />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <button
              key={i}
              className={`px-3 py-1.5 rounded-full border ${tag.bg} ${tag.border} ${tag.color} text-[10px] font-bold transition-opacity`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="h-[1px] bg-gray-100 w-full mb-3" />

        {/* Recent Activity */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-2 items-center">
            <span className="text-gray-400 text-[10px] uppercase font-bold">
              Recent:
            </span>
            <span className="text-[#484554] text-xs font-semibold">
              Instagram Loop
            </span>
          </div>
          <span className="text-gray-400 text-[10px]">17m ago</span>
        </div>

        {/* Weekly Stats Mini-Chart */}
        <div className="flex items-end justify-between h-8 px-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`w-4 rounded-sm ${i === 3 ? "bg-[#a394f0] h-6" : "bg-[#e6deff] h-2"}`}
              />
              <span className="text-[7px] text-gray-400 font-black">{day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// ══════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const [checklist, setChecklist] = useState(initialChecklist);

  const toggleCheck = (id) =>
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)),
    );

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* 2. Navbar */}
      <Navbar />

      <div className="bg-[#f9f9ff] min-h-screen flex w-full">
        {/* 1. Sidebar */}
        <Sidebar />

        {/* 3. Main Content Wrapper */}
        <main className="flex-1">
          <div className="px-12 py-10">
            {/* Header / Greeting */}
            <div className="flex items-end justify-between mb-10">
              <div className="flex flex-col gap-4 max-w-xl">
                <div>
                  <h1 className="font-['Manrope',sans-serif] font-extrabold text-5xl tracking-[-1.2px] text-[#161c27] leading-[48px]">
                    Welcome back, Alex!
                  </h1>
                  <h1 className="font-['Manrope',sans-serif] font-extrabold text-5xl tracking-[-1.2px] text-[#451ebb] leading-[48px]">
                    Ready to focus?
                  </h1>
                </div>
                <p className="font-['Inter',sans-serif] text-[#484554] text-lg leading-relaxed">
                  Your cognitive performance is up by 12% this week. You're
                  currently in the top 5% of deep-work practitioners in your
                  cohort.
                </p>
              </div>

              <div className="flex gap-6 items-center flex-shrink-0">
                <div className="flex gap-3 items-center px-5 py-6 rounded-3xl bg-white/70 backdrop-blur-[10px] shadow-lg border-b-4 border-[#451ebb]">
                  <CircularProgress pct={70} size={80} />
                  <div className="flex flex-col gap-1">
                    <span className="font-['Inter',sans-serif] text-[#484554] text-xs tracking-[1.2px] uppercase leading-4">
                      Daily
                      <br />
                      Goal
                    </span>
                    <span className="font-['Inter',sans-serif] font-bold text-[#161c27] text-base leading-6">
                      4.2 / 6<br />
                      hrs
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 items-center px-5 py-6 rounded-3xl bg-white/70 backdrop-blur-[10px] shadow-lg border-b-4 border-[#fbbc00]">
                  <div className="w-[80px] h-[80px] flex items-center justify-center flex-shrink-0">
                    <div className="bg-[#ffdfa0] rounded-full w-10 h-14 flex items-center justify-center">
                      <FireIcon />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-['Inter',sans-serif] text-[#484554] text-xs tracking-[1.2px] uppercase leading-4">
                      Focus
                      <br />
                      Streak
                    </span>
                    <span className="font-['Inter',sans-serif] font-bold text-[#161c27] text-base leading-6">
                      14 Days
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="flex gap-8">
              {/* Left Column */}
              <div className="flex flex-col gap-6 w-[608px] flex-shrink-0">
                <div className="rounded-3xl overflow-hidden relative min-h-[217px] bg-gradient-to-br from-[#451ebb] to-[#5d3fd3] shadow-lg">
                  <div className="absolute w-64 h-64 rounded-full opacity-10 bg-white blur-[32px] -bottom-14 -right-14 pointer-events-none" />
                  <div className="relative z-10 p-10 flex flex-col gap-6">
                    <h2 className="font-['Manrope',sans-serif] font-bold text-white text-3xl leading-9">
                      Enter the Sanctuary
                    </h2>
                    <div className="flex gap-4">
                      <button className="flex items-center gap-3 bg-white px-8 py-[17px] rounded-3xl font-bold text-[#451ebb] hover:opacity-90 transition-opacity">
                        <PlayIcon /> Start Deep Work
                      </button>
                      <button className="flex items-center gap-3 px-8 py-[17px] rounded-3xl font-bold text-white border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all">
                        <TimerIcon /> Light Review
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chart Section */}
                <div className="bg-[#f1f3ff] rounded-3xl p-8 flex flex-col gap-10">
                  <div className="flex items-center justify-between">
                    <span className="font-['Inter',sans-serif] text-[#484554] text-xs tracking-[1.2px] uppercase">
                      Focus Intensity Over Time
                    </span>
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1.5 text-xs text-[#161c27] font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#451ebb]" />{" "}
                        Focus
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-[#161c27] font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />{" "}
                        Distractions
                      </span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between h-[299px] gap-1">
                    {focusData.map(({ day, focus, distraction }) => {
                      const lightH = Math.round((focus / maxFocus) * 224);
                      const darkH = Math.round((focus / maxFocus) * 185);
                      return (
                        <div
                          key={day}
                          className="relative flex-1 flex flex-col items-center gap-4"
                        >
                          <div
                            className="w-full rounded-t-2xl bg-[#e6deff]"
                            style={{ height: lightH }}
                          />
                          <span className="text-[#484554] text-[10px] uppercase font-bold">
                            {day}
                          </span>
                          <div
                            className="absolute bottom-[24px] left-0 right-0 rounded-t-2xl bg-[#451ebb]"
                            style={{ height: darkH }}
                          />
                          {distraction && (
                            <div
                              className="absolute w-3 h-3 rounded-full bg-[#ba1a1a] border-2 border-[#f9f9ff]"
                              style={{ bottom: darkH + 28 }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-6">
                  {/* Review Queue */}
                  <div className="bg-white rounded-3xl p-6 flex flex-col gap-4 flex-1 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[#484554] text-xs tracking-[1.2px] uppercase font-bold">
                        Review Queue
                      </span>
                      <button className="flex items-center gap-1 text-[#451ebb] font-bold text-[10px] uppercase">
                        <AddIcon /> Add Item
                      </button>
                    </div>
                    <div className="flex flex-col gap-3">
                      {reviewQueue.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 pl-3 pr-2 py-2 rounded-2xl border-l-4"
                          style={{
                            borderLeftColor: item.urgent
                              ? "#ba1a1a"
                              : "#451ebb",
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#161c27] text-sm">
                              {item.title}
                            </p>
                            <p className="text-[#484554] text-[10px]">
                              {item.sub}
                            </p>
                          </div>
                          <button
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-bold text-[10px] transition-all ${item.urgent ? "bg-[#451ebb] text-white" : "text-[#451ebb] border border-[#451ebb]"}`}
                          >
                            <CheckIcon
                              color={item.urgent ? "white" : "#451ebb"}
                            />{" "}
                            Confirm
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="bg-white rounded-3xl p-6 flex flex-col gap-4 flex-1 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[#484554] text-xs tracking-[1.2px] uppercase font-bold leading-4">
                          Pre-Exam
                          <br />
                          Checklist
                        </span>
                        <span className="bg-green-100 text-green-700 font-bold text-[8px] px-2 py-0.5 rounded-full">
                          ACTIVE
                        </span>
                      </div>
                      <button className="flex items-center gap-1 text-[#451ebb] font-bold text-[10px] uppercase">
                        <AddIcon /> Add
                      </button>
                    </div>
                    <div className="flex flex-col gap-1">
                      {checklist.map((item) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleCheck(item.id)}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${item.done ? "border-[#451ebb] bg-[#451ebb]/10" : "border-gray-400"}`}
                          >
                            {item.done && <CheckIcon color="#451ebb" />}
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${item.done ? "text-gray-400 line-through" : "text-[#161c27]"}`}
                            >
                              {item.label}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {item.sub}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Itinerary */}
                <div className="bg-white rounded-3xl p-8 flex flex-col gap-8 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[#484554] text-xs tracking-[1.2px] uppercase font-bold">
                        Upcoming Blocks
                      </span>
                      <h3 className="font-bold text-[#161c27] text-xl">
                        Today's Itinerary
                      </h3>
                    </div>
                    <button className="flex items-center gap-1 text-[#451ebb] font-bold text-sm">
                      <RescheduleIcon /> Reschedule
                    </button>
                  </div>
                  <div className="flex flex-col gap-4">
                    {scheduleItems.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-6 p-4 rounded-2xl hover:bg-gray-50 transition-all"
                      >
                        <span className="text-[#484554] text-xs uppercase w-20 flex-shrink-0">
                          {item.time}
                        </span>
                        <div
                          className="rounded-full w-1 h-12"
                          style={{ background: item.color }}
                        />
                        <div className="flex-1">
                          <p className="font-bold text-[#161c27] text-base">
                            {item.subject}
                          </p>
                          <p className="text-[#484554] text-sm">{item.topic}</p>
                        </div>
                        {item.badge ? (
                          <span className="bg-[#e3e8f9] text-[#484554] font-bold text-xs px-3 py-1 rounded-full">
                            {item.badge}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            {item.duration}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-6 flex-1 min-w-0">
                <DistractionLog />

                <div className="bg-white rounded-3xl overflow-hidden flex flex-col shadow-sm border border-gray-100 min-h-[661px]">
                  <div className="p-8 flex flex-col gap-6 bg-gradient-to-br from-[#451ebb] to-[#5d3fd3] min-h-[214px]">
                    <div className="flex items-start justify-between text-white">
                      <div>
                        <p className="text-xs uppercase opacity-80 mb-1 font-bold">
                          Current Standing
                        </p>
                        <h3 className="font-bold text-2xl leading-8">
                          Level 12
                          <br />
                          Scholar
                        </h3>
                      </div>
                      <img
                        src={imgOverlayOverlayBlur}
                        alt=""
                        className="w-8 h-9"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-white text-xs font-bold">
                        <span>2,450 XP</span>
                        <span>3,000 XP</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                        <div
                          className="h-full bg-[#6bfe9c]"
                          style={{ width: "82%" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                      <span className="text-[#484554] text-[10px] font-bold uppercase tracking-widest">
                        Recent Achievements
                      </span>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#ffdfa0] flex items-center justify-center shadow-sm">
                          <FireIcon />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#e6deff] flex items-center justify-center shadow-sm">
                          <StarIcon />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#6bfe9c] flex items-center justify-center shadow-sm">
                          <LeafIcon />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-6">
                      <span className="text-[#484554] text-xs font-bold uppercase">
                        Cohort Leaderboard
                      </span>
                      {/* User Rank 1 */}
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-[#451ebb] w-4">1</span>
                        <img
                          src={imgLeaderboardUser}
                          alt="Marcus Chen's profile"
                          className="w-10 h-10 rounded-full bg-blue-50"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-sm">Marcus Chen</p>
                          <p className="text-[10px] text-gray-500">
                            84 hrs focused
                          </p>
                        </div>
                        <span className="text-green-600 font-bold text-xs">
                          ↑ 2
                        </span>
                      </div>
                      {/* User (Highlighted) */}
                      <div className="flex items-center gap-4 p-2 rounded-2xl bg-[#451ebb]/5 ring-2 ring-[#451ebb]/20">
                        <span className="font-bold text-[#451ebb] w-4">3</span>
                        <img
                          src={imgCurrentUser}
                          alt="Alex's profile"
                          className="w-10 h-10 rounded-full bg-blue-50 object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-[#451ebb] text-sm">
                            Alex (You)
                          </p>
                          <p className="text-[10px] text-[#451ebb]/70">
                            76 hrs focused
                          </p>
                        </div>
                        <span className="text-green-600 font-bold text-xs">
                          ↑ 1
                        </span>
                      </div>
                      <button className="w-full bg-[#e3e8f9] text-[#451ebb] font-bold text-sm py-3 rounded-3xl hover:bg-[#d8dfff] transition-all">
                        View Full Standings
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl overflow-hidden relative h-[192px] shadow-lg">
                  <img
                    src={imgGradient}
                    alt=""
                    className="absolute inset-0 w-full h-[150%] -top-[25%] object-cover"
                  />
                  <img
                    src={imgDailyTipCard}
                    alt="Insight decoration"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                  <div className="absolute bottom-7 left-5 p-6 flex flex-col gap-1">
                    <span className="text-[#ffdfa0] text-xs font-bold uppercase">
                      Weekly Insight
                    </span>
                    <p className="font-bold text-white text-base leading-6 max-w-[240px]">
                      Try 5 minutes breaks between deep work after every 25
                      minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
