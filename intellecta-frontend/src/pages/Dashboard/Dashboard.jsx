import { useState } from "react";

// ─── Figma asset URLs ──────────────────────────────────────────────────────────
const imgLeaderboardUser =
  "https://www.figma.com/api/mcp/asset/d6e2420d-b287-4faa-99e5-cec266dae359";
const imgLeaderboardUser1 =
  "https://www.figma.com/api/mcp/asset/01747dd6-03fe-45b0-a02a-19352824f453";
const imgCurrentUser =
  "https://www.figma.com/api/mcp/asset/de6187fa-657d-4895-a61f-89df2ee4c707";
const imgDailyTipCard =
  "https://www.figma.com/api/mcp/asset/ecee153a-f7f9-4e4a-a8c5-55ed756c98c6";
const imgUserProfileAvatar =
  "https://www.figma.com/api/mcp/asset/faa09328-87e8-4f55-b6f2-b6ca8d8f151e";
const imgGradient =
  "https://www.figma.com/api/mcp/asset/c9e33b0b-5899-4842-af5b-78200a95cfdb";
const imgFrame1 =
  "https://www.figma.com/api/mcp/asset/a914574f-30a9-4618-8537-39f62287213b";
const imgOverlayOverlayBlur =
  "https://www.figma.com/api/mcp/asset/7865af56-4d99-4907-9238-a1d91d6c6aa1";

// SVG icons as inline components to avoid external deps
const PlayIcon = () => (
  <svg width="11" height="14" viewBox="0 0 11 14" fill="none">
    <path d="M1 1L10 7L1 13V1Z" fill="#451ebb" stroke="#451ebb" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);
const TimerIcon = () => (
  <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
    <circle cx="10" cy="9" r="6" stroke="white" strokeWidth="1.5" />
    <path d="M10 3V1M7 1H13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 6V9L12 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const RescheduleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1 7C1 3.686 3.686 1 7 1C9.21 1 11.14 2.17 12.24 3.93" stroke="#451ebb" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M13 7C13 10.314 10.314 13 7 13C4.79 13 2.86 11.83 1.76 10.07" stroke="#451ebb" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 1L12.24 3.93L9.5 4" stroke="#451ebb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 13L1.76 10.07L4.5 10" stroke="#451ebb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const AddIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M6 1V11M1 6H11" stroke="#451ebb" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const CheckIcon = ({ color = "white" }) => (
  <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
    <path d="M1 3.5L3.5 6L9 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const FireIcon = () => (
  <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
    <path d="M8 1C8 1 12 5 12 9C12 11.76 10.21 14.09 7.73 14.83C8.54 13.8 9 12.46 9 11C9 8.24 7.27 5.91 5.14 4.71C5.68 6.17 5.63 7.8 4.95 9.22C4.27 7.59 3.16 6.19 2.76 4.43C1.66 6 1 7.93 1 10C1 13.87 4.13 17 8 17C11.87 17 15 13.87 15 10C15 5.5 11 2 8 1Z" fill="#f59e0b" />
  </svg>
);
const StarIcon = () => (
  <svg width="17" height="15" viewBox="0 0 17 15" fill="none">
    <path d="M8.5 1L10.59 5.26L15.27 5.93L11.89 9.22L12.68 13.93L8.5 11.73L4.32 13.93L5.11 9.22L1.73 5.93L6.41 5.26L8.5 1Z" fill="#451ebb" stroke="#451ebb" strokeWidth="1" strokeLinejoin="round" />
  </svg>
);
const LeafIcon = () => (
  <svg width="17" height="15" viewBox="0 0 17 15" fill="none">
    <path d="M2 13C2 13 4 7 9 5C14 3 15 1 15 1C15 1 14 8 9 10C6.5 11 4 11 2 13Z" fill="#22c55e" stroke="#22c55e" strokeWidth="1" />
    <path d="M2 13L6 9" stroke="white" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

// ── Circular progress SVG ──────────────────────────────────────────────────────
function CircularProgress({ pct = 70, size = 80 }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r={r} fill="none" stroke="#e6deff" strokeWidth="8" />
      <circle
        cx="40" cy="40" r={r}
        fill="none" stroke="#451ebb" strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
      />
      <text x="40" y="44" textAnchor="middle" fill="#161c27" fontSize="14" fontWeight="700" fontFamily="Manrope, sans-serif">
        {pct}%
      </text>
    </svg>
  );
}

// ── Bar chart data ─────────────────────────────────────────────────────────────
const focusData = [
  { day: "Mon", focus: 96,  distraction: false },
  { day: "Tue", focus: 144, distraction: true  },
  { day: "Wed", focus: 128, distraction: false },
  { day: "Thu", focus: 185, distraction: true  },
  { day: "Fri", focus: 160, distraction: false },
  { day: "Sat", focus: 80,  distraction: false },
  { day: "Sun", focus: 64,  distraction: false },
];
const maxFocus = Math.max(...focusData.map(d => d.focus));

// ── Schedule items ─────────────────────────────────────────────────────────────
const scheduleItems = [
  { time: "09:00 AM", subject: "Advanced Cognitive Psychology", topic: "Chapter 4: Memory Retrieval Models", color: "#6bfe9c", badge: "Active",  badgeBg: "#e3e8f9",  badgeText: "#484554" },
  { time: "01:30 PM", subject: "Data Science Fundamentals",     topic: "Practical Lab: Logistic Regression",  color: "#e6deff", duration: "90 mins" },
  { time: "04:00 PM", subject: "Digital Ethics Seminar",         topic: "Reading: The Algorithmic Bias",        color: "#ffdfa0", duration: "45 mins" },
];

// ── Checklist items ────────────────────────────────────────────────────────────
const initialChecklist = [
  { id: 1, label: "Verify Exam Center",  sub: "Completed yesterday", done: true  },
  { id: 2, label: "Download Hall Ticket", sub: "PDF required for entry", done: false },
  { id: 3, label: "Stationery Check",    sub: "2B Pencils, Eraser, Pens", done: false },
];

// ── Review queue ───────────────────────────────────────────────────────────────
const reviewQueue = [
  { id: 1, title: "Laplace Theory",   sub: "Overdue 2 days", urgent: true  },
  { id: 2, title: "SQL Joins Deep Dive", sub: "Due today",  urgent: false },
];

// ══════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const [checklist, setChecklist] = useState(initialChecklist);

  const toggleCheck = (id) =>
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));

  return (
    <div className="bg-[#f9f9ff] min-h-screen w-full p-0">
      {/* ── Main scroll area offset for sidebar (256px) and topnav (64px) ── */}
      <main className="ml-[256px] pt-[64px] min-h-screen">
        <div className="px-12 py-12">

          {/* ═══════════════════════════════════════════════════════════════════
              HEADER SECTION — Greeting + Widgets
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="flex items-end justify-between mb-10">
            {/* Left: greeting text */}
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
                Your cognitive performance is up by 12% this week. You're currently in the top 5% of deep-work practitioners in your cohort.
              </p>
            </div>

            {/* Right: stat widgets */}
            <div className="flex gap-6 items-center flex-shrink-0">
              {/* Daily Goal widget */}
              <div
                className="flex gap-3 items-center px-5 py-6 rounded-3xl"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 20px 20px rgba(22,28,39,0.06)",
                  borderBottom: "4px solid #451ebb",
                }}
              >
                <CircularProgress pct={70} size={80} />
                <div className="flex flex-col gap-1">
                  <span className="font-['Inter',sans-serif] text-[#484554] text-xs tracking-[1.2px] uppercase leading-4">
                    Daily<br />Goal
                  </span>
                  <span className="font-['Inter',sans-serif] font-bold text-[#161c27] text-base leading-6">
                    4.2 / 6<br />hrs
                  </span>
                </div>
              </div>

              {/* Focus Streak widget */}
              <div
                className="flex gap-6 items-center px-6 py-6 rounded-3xl"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 20px 20px rgba(22,28,39,0.06)",
                  borderBottom: "4px solid #fbbc00",
                }}
              >
                <div className="bg-[#ffdfa0] rounded-full w-8 h-12 flex items-center justify-center flex-shrink-0">
                  <FireIcon />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-['Inter',sans-serif] text-[#484554] text-xs tracking-[1.2px] uppercase leading-4">
                    Focus<br />Streak
                  </span>
                  <span className="font-['Inter',sans-serif] font-bold text-[#161c27] text-base leading-6">
                    14 Days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              MAIN GRID — Left column + Right column
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="flex gap-8">

            {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-6 w-[608px] flex-shrink-0">

              {/* Session Launcher */}
              <div
                className="rounded-3xl overflow-hidden relative"
                style={{
                  background: "linear-gradient(132deg, #451ebb 0%, #5d3fd3 100%)",
                  boxShadow: "0 20px 40px rgba(22,28,39,0.06)",
                  minHeight: 217,
                }}
              >
                {/* Decorative blur bubble */}
                <div className="absolute w-64 h-64 rounded-full opacity-10 bg-white blur-[32px] -bottom-14 -right-14 pointer-events-none" />
                <div className="relative z-10 p-10 flex flex-col gap-6">
                  <h2 className="font-['Manrope',sans-serif] font-bold text-white text-3xl leading-9">
                    Enter the Sanctuary
                  </h2>
                  <div className="flex gap-4">
                    <button className="flex items-center gap-3 bg-white px-8 py-[17px] rounded-3xl font-['Inter',sans-serif] font-bold text-[#451ebb] text-base transition-opacity hover:opacity-90">
                      <PlayIcon />
                      Start Deep Work
                    </button>
                    <button
                      className="flex items-center gap-3 px-8 py-[17px] rounded-3xl font-['Inter',sans-serif] font-bold text-white text-base border transition-opacity hover:opacity-90"
                      style={{ background: "rgba(69,30,187,0.2)", backdropFilter: "blur(6px)", borderColor: "rgba(255,255,255,0.2)" }}
                    >
                      <TimerIcon />
                      Light Review
                    </button>
                  </div>
                </div>
              </div>

              {/* Focus Intensity Chart */}
              <div className="bg-[#f1f3ff] rounded-3xl p-8 flex flex-col gap-10">
                <div className="flex items-center justify-between">
                  <span className="font-['Inter',sans-serif] text-[#484554] text-xs tracking-[1.2px] uppercase">
                    Focus Intensity Over Time
                  </span>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5 font-['Inter',sans-serif] text-xs text-[#161c27] font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#451ebb] inline-block" />
                      Focus
                    </span>
                    <span className="flex items-center gap-1.5 font-['Inter',sans-serif] text-xs text-[#161c27] font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#ba1a1a] inline-block" />
                      Distractions
                    </span>
                  </div>
                </div>

                <div className="flex items-end justify-between h-[299px] gap-1">
                  {focusData.map(({ day, focus, distraction }) => {
                    const lightH = Math.round((focus / maxFocus) * 224);
                    const darkH  = Math.round((focus / maxFocus) * 185);
                    return (
                      <div key={day} className="relative flex-1 flex flex-col items-center gap-4">
                        {/* Light bar */}
                        <div
                          className="w-full rounded-t-2xl bg-[#e6deff]"
                          style={{ height: lightH }}
                        />
                        {/* Day label */}
                        <span className="font-['Inter',sans-serif] text-[#484554] text-[10px] uppercase">{day}</span>
                        {/* Dark bar */}
                        <div
                          className="absolute bottom-[24px] left-0 right-0 rounded-t-2xl bg-[#451ebb]"
                          style={{ height: darkH }}
                        />
                        {/* Distraction dot */}
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

              {/* Mid row: Review Queue + Pre-Exam Checklist */}
              <div className="flex gap-6">
                {/* Review Queue */}
                <div className="bg-white rounded-3xl p-6 flex flex-col gap-4 flex-1" style={{ boxShadow: "0 20px 20px rgba(22,28,39,0.06)" }}>
                  <div className="flex items-center justify-between">
                    <span className="font-['Inter',sans-serif] text-[#484554] text-xs tracking-[1.2px] uppercase">Review Queue</span>
                    <button className="flex items-center gap-1 text-[#451ebb] font-['Manrope',sans-serif] font-bold text-[10px] tracking-[0.5px] uppercase">
                      <AddIcon /> Add Item
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {reviewQueue.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 pl-3 pr-2 py-2 rounded-2xl"
                        style={{ borderLeft: `4px solid ${item.urgent ? "#ba1a1a" : "#451ebb"}` }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-['Inter',sans-serif] font-bold text-[#161c27] text-sm leading-5">{item.title}</p>
                          <p className="font-['Inter',sans-serif] text-[#484554] text-[10px] leading-4">{item.sub}</p>
                        </div>
                        <button
                          className="flex items-center gap-1.5 rounded-full px-3 py-1 font-['Inter',sans-serif] font-bold text-[10px] transition-opacity hover:opacity-80"
                          style={
                            item.urgent
                              ? { background: "#451ebb", color: "white" }
                              : { background: "transparent", color: "#451ebb", border: "1px solid #451ebb" }
                          }
                        >
                          <CheckIcon color={item.urgent ? "white" : "#451ebb"} />
                          Confirm
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pre-Exam Checklist */}
                <div className="bg-white rounded-3xl p-6 flex flex-col gap-4 flex-1" style={{ boxShadow: "0 20px 20px rgba(22,28,39,0.06)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-['Inter',sans-serif] text-[#484554] text-xs tracking-[1.2px] uppercase leading-4">
                        Pre-Exam<br />Checklist
                      </span>
                      <span className="bg-[rgba(0,109,55,0.1)] text-[#006d37] font-['Inter',sans-serif] font-bold text-[8px] px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    </div>
                    <button className="flex items-center gap-1 text-[#451ebb] font-['Manrope',sans-serif] font-bold text-[10px] tracking-[0.5px] uppercase">
                      <AddIcon /> Add
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    {checklist.map(item => (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleCheck(item.id)}
                      >
                        <div
                          className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                          style={{
                            borderColor: item.done ? "#451ebb" : "#797586",
                            background: item.done ? "rgba(69,30,187,0.1)" : "white",
                          }}
                        >
                          {item.done && <CheckIcon color="#451ebb" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-['Inter',sans-serif] font-medium text-sm leading-5"
                            style={{
                              color: item.done ? "#484554" : "#161c27",
                              opacity: item.done ? 0.6 : 1,
                              textDecoration: item.done ? "line-through" : "none",
                            }}
                          >
                            {item.label}
                          </p>
                          <p className="font-['Inter',sans-serif] text-[10px]" style={{ color: item.done ? "rgba(72,69,84,0.4)" : "rgba(72,69,84,0.6)" }}>
                            {item.sub}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Today's Itinerary */}
              <div className="bg-white rounded-3xl p-8 flex flex-col gap-8" style={{ boxShadow: "0 20px 20px rgba(22,28,39,0.06)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-['Inter',sans-serif] text-[#484554] text-xs tracking-[1.2px] uppercase">Upcoming Blocks</span>
                    <h3 className="font-['Manrope',sans-serif] font-bold text-[#161c27] text-xl leading-7">Today's Itinerary</h3>
                  </div>
                  <button className="flex items-center gap-1 text-[#451ebb] font-['Inter',sans-serif] font-bold text-sm">
                    <RescheduleIcon />
                    Reschedule
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  {scheduleItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                      <span className="font-['Inter',sans-serif] text-[#484554] text-xs uppercase w-20 flex-shrink-0">
                        {item.time}
                      </span>
                      <div className="rounded-full w-1 h-12 flex-shrink-0" style={{ background: item.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-['Inter',sans-serif] font-bold text-[#161c27] text-base leading-6">{item.subject}</p>
                        <p className="font-['Inter',sans-serif] text-[#484554] text-sm leading-5">{item.topic}</p>
                      </div>
                      {item.badge ? (
                        <span className="bg-[#e3e8f9] text-[#484554] font-['Inter',sans-serif] font-bold text-xs px-3 py-1 rounded-full flex-shrink-0">
                          {item.badge}
                        </span>
                      ) : (
                        <span className="font-['Inter',sans-serif] text-[#484554] text-xs flex-shrink-0">{item.duration}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-6 flex-1 min-w-0">

              {/* Distraction Log widget (from Figma as image) */}
              <div className="rounded-3xl overflow-hidden" style={{ height: 281, boxShadow: "0 20px 40px rgba(22,28,39,0.06)" }}>
                <img src={imgFrame1} alt="Distraction Log" className="w-full h-full object-cover" />
              </div>

              {/* Gamification / Level Card */}
              <div className="bg-white rounded-3xl overflow-hidden flex flex-col" style={{ boxShadow: "0 0 0 1px rgba(201,196,215,0.15)", minHeight: 661 }}>
                {/* Purple header */}
                <div
                  className="p-8 flex flex-col gap-6"
                  style={{ background: "linear-gradient(135deg, #451ebb 0%, #5d3fd3 100%)", minHeight: 214 }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-['Inter',sans-serif] text-white text-xs tracking-[1.2px] uppercase opacity-80 mb-1">Current Standing</p>
                      <h3 className="font-['Manrope',sans-serif] font-bold text-white text-2xl leading-8">
                        Level 12<br />Scholar
                      </h3>
                    </div>
                    <img src={imgOverlayOverlayBlur} alt="" className="w-8 h-9 flex-shrink-0" />
                  </div>
                  {/* XP bar */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="font-['Inter',sans-serif] font-bold text-white text-xs">2,450 XP</span>
                      <span className="font-['Inter',sans-serif] font-bold text-white text-xs">3,000 XP</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.2)" }}>
                      <div className="h-full bg-[#6bfe9c] rounded-full" style={{ width: "82%" }} />
                    </div>
                  </div>
                </div>

                {/* Body: Achievements + Leaderboard */}
                <div className="flex-1 p-8 flex flex-col gap-8">
                  {/* Recent Achievements */}
                  <div className="flex flex-col gap-4">
                    <span className="font-['Inter',sans-serif] text-[#484554] text-[10px] tracking-[1px] uppercase">Recent Achievements</span>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#ffdfa0] flex items-center justify-center" style={{ boxShadow: "0 1px 1px rgba(0,0,0,0.05)" }}>
                        <FireIcon />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#e6deff] flex items-center justify-center" style={{ boxShadow: "0 1px 1px rgba(0,0,0,0.05)" }}>
                        <StarIcon />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#6bfe9c] flex items-center justify-center" style={{ boxShadow: "0 1px 1px rgba(0,0,0,0.05)" }}>
                        <LeafIcon />
                      </div>
                    </div>
                  </div>

                  {/* Leaderboard */}
                  <div className="flex flex-col gap-6">
                    <span className="font-['Inter',sans-serif] text-[#484554] text-xs tracking-[1.2px] uppercase">Cohort Leaderboard</span>

                    {/* Rank 1 */}
                    <div className="flex items-center gap-4">
                      <span className="font-['Manrope',sans-serif] font-bold text-[#451ebb] text-base w-4">1</span>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e8eeff] flex-shrink-0">
                        <img src={imgLeaderboardUser} alt="Marcus Chen" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-['Inter',sans-serif] font-bold text-[#161c27] text-sm leading-5">Marcus Chen</p>
                        <p className="font-['Inter',sans-serif] text-[#484554] text-[10px]">84 hrs focused</p>
                      </div>
                      <span className="font-['Inter',sans-serif] font-bold text-[#006d37] text-xs">↑ 2</span>
                    </div>

                    {/* Rank 2 */}
                    <div className="flex items-center gap-4 opacity-50">
                      <span className="font-['Manrope',sans-serif] font-bold text-[#484554] text-base w-4">2</span>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e8eeff] flex-shrink-0">
                        <img src={imgLeaderboardUser1} alt="Elena Rodriguez" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-['Inter',sans-serif] font-bold text-[#161c27] text-sm leading-5">Elena Rodriguez</p>
                        <p className="font-['Inter',sans-serif] text-[#484554] text-[10px]">79 hrs focused</p>
                      </div>
                      <span className="font-['Inter',sans-serif] font-bold text-[#797586] text-xs">--</span>
                    </div>

                    {/* Rank 3 — current user (highlighted) */}
                    <div
                      className="flex items-center gap-4 p-2 rounded-2xl relative"
                      style={{ background: "rgba(69,30,187,0.05)", boxShadow: "0 0 0 2px rgba(69,30,187,0.2)" }}
                    >
                      <span className="font-['Manrope',sans-serif] font-bold text-[#451ebb] text-base w-4">3</span>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e8eeff] flex-shrink-0">
                        <img src={imgCurrentUser} alt="Alex" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-['Inter',sans-serif] font-bold text-[#451ebb] text-sm leading-5">Alex (You)</p>
                        <p className="font-['Inter',sans-serif] text-[10px]" style={{ color: "rgba(69,30,187,0.7)" }}>76 hrs focused</p>
                      </div>
                      <span className="font-['Inter',sans-serif] font-bold text-[#006d37] text-xs">↑ 1</span>
                    </div>

                    {/* View all button */}
                    <button className="w-full bg-[#e3e8f9] text-[#451ebb] font-['Inter',sans-serif] font-bold text-sm py-3 rounded-3xl hover:bg-[#d8dfff] transition-colors">
                      View Full Standings
                    </button>
                  </div>
                </div>
              </div>

              {/* Weekly Insight / Daily Tip Card */}
              <div className="rounded-3xl overflow-hidden relative" style={{ height: 192, boxShadow: "0 20px 40px rgba(22,28,39,0.06)" }}>
                <img src={imgDailyTipCard} alt="" className="absolute inset-0 w-full h-[150%] -top-[25%] object-cover" />
                <img src={imgGradient} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute bottom-7 left-5 p-6 flex flex-col gap-1">
                  <span className="font-['Inter',sans-serif] text-[#ffdfa0] text-xs tracking-[1.2px] uppercase">Weekly Insight</span>
                  <p className="font-['Inter',sans-serif] font-bold text-white text-base leading-6 max-w-[240px]">
                    Try 5 minutes breaks between deep work after every 25 minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}