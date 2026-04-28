import React, { useState } from "react";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Shuffle,
  Check,
  Zap,
} from "lucide-react";
import { cn } from "../../lib/utils";
import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/StudentSidebar";

// ── Data ────────────────────────────────────────────────────────────────────────

const SUBJECTS = ["Advanced Physics", "Macroeconomics", "Comp Sci", "World History"];

const TOPICS_BY_SUBJECT = {
  "Advanced Physics": [
    {
      id: 1,
      title: "Schrödinger's Equation",
      sub: "Wave mechanics and probability density",
      status: "MASTERED",
    },
    {
      id: 2,
      title: "Quantum Entanglement",
      sub: "EPR Paradox and Bell's inequalities",
      status: "IN_PROGRESS",
    },
    {
      id: 3,
      title: "Photoelectric Effect",
      sub: "Photon energy and work function",
      status: "REVIEWED",
    },
    {
      id: 4,
      title: "Heisenberg Uncertainty",
      sub: "Conjugate variables and wave packets",
      status: "NOT_STARTED",
    },
  ],
  "Macroeconomics": [
    { id: 5, title: "GDP Measurement", sub: "Expenditure and income approaches", status: "MASTERED" },
    { id: 6, title: "Fiscal Policy", sub: "Government spending and taxation", status: "IN_PROGRESS" },
    { id: 7, title: "Monetary Policy", sub: "Central bank tools and interest rates", status: "NOT_STARTED" },
  ],
  "Comp Sci": [
    { id: 8, title: "Binary Trees", sub: "Traversal and balancing algorithms", status: "REVIEWED" },
    { id: 9, title: "Dynamic Programming", sub: "Memoization and tabulation", status: "IN_PROGRESS" },
  ],
  "World History": [
    { id: 10, title: "World War I", sub: "Causes and major offensives", status: "MASTERED" },
    { id: 11, title: "Cold War", sub: "Proxy wars and ideological conflict", status: "NOT_STARTED" },
  ],
};

const CHECKLIST_ITEMS = [
  { id: 1, label: "Review lecture notes (units 1-4)", done: true },
  { id: 2, label: "Download e-Hall Ticket", done: false },
  { id: 3, label: "Mock Test: 2023 Finals", done: false },
];

const UPCOMING_EXAMS = [
  {
    id: 1,
    name: "Quantum Mechanics Midterm",
    date: "October 24, 2024 • 09:00 AM",
    daysLeft: 12,
    status: "Behind Schedule",
    tag: "CORE",
    isBehind: true,
  },
  {
    id: 2,
    name: "Data Science Finals",
    date: "Nov 10, 2026",
    daysLeft: 36,
    status: null,
    tag: null,
    isBehind: false,
  },
];

const STATUS_CONFIG = {
  MASTERED: {
    label: "MASTERED",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  IN_PROGRESS: {
    label: "IN PROGRESS",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  REVIEWED: {
    label: "REVIEWED",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  NOT_STARTED: {
    label: "NOT STARTED",
    color: "text-gray-400",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
};

const STATUS_ORDER = ["NOT_STARTED", "IN_PROGRESS", "REVIEWED", "MASTERED"];

// ── Sub Components ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn(
      "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border",
      cfg.color, cfg.bg, cfg.border
    )}>
      {cfg.label}
    </span>
  );
};

const TopicRow = ({ topic, onCycleStatus }) => {
  const statusIcons = {
    MASTERED: "✦",
    IN_PROGRESS: "✳",
    REVIEWED: "✧",
    NOT_STARTED: "✩",
  };

  return (
    <div className="flex items-center justify-between py-4 px-5 rounded-2xl hover:bg-gray-50 transition-colors group">
      <div className="flex items-center gap-4">
        <span className={cn(
          "text-lg w-6 text-center",
          STATUS_CONFIG[topic.status].color
        )}>
          {statusIcons[topic.status]}
        </span>
        <div>
          <p className="text-sm font-bold text-gray-800">{topic.title}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{topic.sub}</p>
        </div>
      </div>
      <button
        onClick={() => onCycleStatus(topic.id)}
        className="opacity-100 transition-opacity"
      >
        <StatusBadge status={topic.status} />
      </button>
    </div>
  );
};

const CircularCountdown = ({ days }) => {
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, 1 - days / 30));
  const dash = pct * circ;

  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
      <circle
        cx="36" cy="36" r={radius}
        fill="none" stroke="white" strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="33" textAnchor="middle" fill="white" fontSize="13" fontWeight="800">{days}</text>
      <text x="36" y="46" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="7" fontWeight="700">DAYS LEFT</text>
    </svg>
  );
};

// ── Main Page ───────────────────────────────────────────────────────────────────

const CoverageTrackerPage = () => {
  const [activeSubject, setActiveSubject] = useState("Advanced Physics");
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [topics, setTopics] = useState(TOPICS_BY_SUBJECT);
  const [checklist, setChecklist] = useState(CHECKLIST_ITEMS);
  const [newCheckItem, setNewCheckItem] = useState("");
  const [addingItem, setAddingItem] = useState(false);

  const cycleStatus = (topicId) => {
    setTopics((prev) => {
      const updated = { ...prev };
      updated[activeSubject] = updated[activeSubject].map((t) => {
        if (t.id !== topicId) return t;
        const currentIndex = STATUS_ORDER.indexOf(t.status);
        const nextStatus = STATUS_ORDER[(currentIndex + 1) % STATUS_ORDER.length];
        return { ...t, status: nextStatus };
      });
      return updated;
    });
  };

  const toggleChecklist = (id) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c))
    );
  };

  const addChecklistItem = (e) => {
    if (e.key === "Enter" && newCheckItem.trim()) {
      setChecklist((prev) => [
        ...prev,
        { id: Date.now(), label: newCheckItem.trim(), done: false },
      ]);
      setNewCheckItem("");
      setAddingItem(false);
    }
  };

  const currentTopics = topics[activeSubject] || [];

  const masteredCount = currentTopics.filter((t) => t.status === "MASTERED").length;
  const progressPct = currentTopics.length
    ? Math.round((masteredCount / currentTopics.length) * 100)
    : 0;

  // overall across all subjects
  const allTopics = Object.values(topics).flat();
  const overallPct = allTopics.length
    ? Math.round(
        (allTopics.filter((t) => t.status === "MASTERED").length / allTopics.length) * 100
      )
    : 0;

  const primaryExam = UPCOMING_EXAMS[0];
  const secondaryExam = UPCOMING_EXAMS[1];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />

      <div className="bg-[#f9f9ff] min-h-screen flex w-full">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="px-10 py-10">
            <div className="grid grid-cols-[1fr_380px] gap-8 max-w-6xl">

              {/* ── LEFT: Coverage Tracker ── */}
              <div>
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Coverage Tracker
                      </h1>
                      <p className="text-gray-400 text-sm mt-1">
                        Monitor your curriculum mastery in real-time with granular topic analytics.
                      </p>
                    </div>

                    {/* Subject Selector */}
                    <div className="relative">
                      <button
                        onClick={() => setSubjectOpen(!subjectOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 hover:border-gray-300 transition-colors shadow-sm"
                      >
                        {activeSubject}
                        <ChevronDown size={13} className={cn("transition-transform", subjectOpen && "rotate-180")} />
                      </button>
                      {subjectOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-20">
                          {SUBJECTS.map((s) => (
                            <button
                              key={s}
                              onClick={() => { setActiveSubject(s); setSubjectOpen(false); }}
                              className={cn(
                                "w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center justify-between",
                                activeSubject === s
                                  ? "text-[#7c3aed] bg-[#f5f3ff]"
                                  : "text-gray-600 hover:bg-gray-50"
                              )}
                            >
                              {s}
                              {activeSubject === s && <Check size={12} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="bg-white rounded-3xl px-6 py-5 mb-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Overall Progress
                    </span>
                    <span className="text-2xl font-black text-gray-900">{overallPct}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#7c3aed] rounded-full transition-all duration-700"
                      style={{ width: `${overallPct}%` }}
                    />
                  </div>
                </div>

                {/* Topic List */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-5">
                  <div className="divide-y divide-gray-50">
                    {currentTopics.map((topic) => (
                      <TopicRow
                        key={topic.id}
                        topic={topic}
                        onCycleStatus={cycleStatus}
                      />
                    ))}
                    {currentTopics.length === 0 && (
                      <p className="text-center text-gray-400 text-sm py-10">
                        No topics for this subject yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Save Changes Button */}
                <button className="w-full py-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold rounded-2xl transition-colors shadow-lg shadow-indigo-100">
                  Save Changes
                </button>
              </div>

              {/* ── RIGHT: Exam Prep ── */}
              <div>
                {/* Exam Prep Header */}
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-extrabold text-gray-900">Exam Prep</h2>
                  <button className="flex items-center gap-1.5 text-[#7c3aed] text-xs font-bold hover:underline">
                    <Plus size={13} /> Add Exam
                  </button>
                </div>

                {/* Primary Exam Card */}
                <div className="bg-[#7c3aed] rounded-3xl p-6 mb-4 relative overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full" />
                  <div className="absolute -right-2 -bottom-2 w-24 h-24 bg-white/5 rounded-full" />

                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-extrabold text-lg leading-tight">
                          {primaryExam.name}
                        </h3>
                        {primaryExam.tag && (
                          <span className="bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {primaryExam.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-white/60 text-xs">{primaryExam.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 relative z-10">
                    <CircularCountdown days={primaryExam.daysLeft} />
                    <div>
                      <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-1">
                        Status
                      </p>
                      <p className="text-white font-extrabold text-xl">
                        {primaryExam.status}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Secondary Exam Row */}
                <div className="bg-white rounded-2xl px-5 py-4 mb-4 border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{secondaryExam.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{secondaryExam.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-[#7c3aed] bg-[#f5f3ff] px-3 py-1.5 rounded-full">
                      {secondaryExam.daysLeft} DAYS LEFT
                    </span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>

                {/* Panic Meter + Recommended */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      Panic Meter
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={16} className="text-red-500" />
                      <span className="text-sm font-black text-red-500">High</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 rounded-full w-4/5" />
                    </div>
                    <p className="text-[9px] text-gray-400 mt-2">Intense vs. Ease</p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Recommended
                      </p>
                      <Shuffle size={13} className="text-gray-300" />
                    </div>
                    <p className="text-3xl font-black text-gray-900">~3.5 hrs</p>
                    <p className="text-[10px] text-gray-400 mt-1">Daily study target</p>
                  </div>
                </div>

                {/* Behind Alert */}
                {primaryExam.isBehind && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4 flex items-start gap-3">
                    <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-red-600">You're falling behind</p>
                      <p className="text-[11px] text-red-400 mt-0.5 leading-relaxed">
                        Based on your current coverage speed, you need to increase focus on "Quantum Entanglement" to finish before Oct 24.
                      </p>
                    </div>
                  </div>
                )}

                {/* Pre-Exam Checklist */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-gray-800">Pre-Exam Checklist</h3>
                      <span className="text-[10px] text-gray-400 font-bold">
                        {checklist.filter((c) => c.done).length}/{checklist.length} items checked
                      </span>
                    </div>
                    <button
                      onClick={() => setAddingItem(true)}
                      className="flex items-center gap-1 text-[#7c3aed] text-[11px] font-black hover:underline"
                    >
                      <Plus size={12} /> Add Item
                    </button>
                  </div>

                  <div className="px-5 py-3 divide-y divide-gray-50">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 py-3 group cursor-pointer"
                        onClick={() => toggleChecklist(item.id)}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                          item.done
                            ? "bg-[#7c3aed] border-[#7c3aed]"
                            : "border-gray-200 group-hover:border-[#c4b5fd]"
                        )}>
                          {item.done && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className={cn(
                          "text-sm font-medium transition-colors",
                          item.done ? "text-gray-400 line-through" : "text-gray-700"
                        )}>
                          {item.label}
                        </span>
                      </div>
                    ))}

                    {addingItem && (
                      <input
                        autoFocus
                        type="text"
                        value={newCheckItem}
                        onChange={(e) => setNewCheckItem(e.target.value)}
                        onKeyDown={addChecklistItem}
                        onBlur={() => setAddingItem(false)}
                        placeholder="Add item and press Enter..."
                        className="w-full py-3 text-sm outline-none placeholder:text-gray-300 text-gray-700"
                      />
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-[#7c3aed] text-white rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center hover:bg-[#6d28d9] transition-all hover:scale-105 active:scale-95 z-50">
        <Zap size={22} fill="white" />
      </button>
    </div>
  );
};

export default CoverageTrackerPage;