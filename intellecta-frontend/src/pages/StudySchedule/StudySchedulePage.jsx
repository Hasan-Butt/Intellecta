import React, { useState } from "react";
import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/StudentSidebar";
import {
  UploadCloud,
  MoreVertical,
  Clock,
  BarChart2,
  FileText,
  Plus,
  Pause,
  CheckCircle2,
  Zap,
  Circle,
  Flame,
  Timer,
} from "lucide-react";

// ─── Color constants ──────────────────────────────────────────────────────────
const C = {
  indigo: "#451ebb",
  indigoLight: "rgba(69,30,187,0.05)",
  indigoBorder: "rgba(69,30,187,0.1)",
  indigoSoft: "#e6deff",
  text: "#161c27",
  muted: "#484554",
  subtle: "#797586",
  border: "#c9c4d7",
  bg: "#f9f9ff",
  sidebar: "#f1f5f9",
  panel: "#f1f3ff",
  green: "#6bfe9c",
  greenDark: "#006d37",
  amber: "#ffdfa0",
  amberDark: "#594100",
  red: "#ba1a1a",
  redBg: "rgba(255,218,214,0.5)",
};

// ─── Course Card ──────────────────────────────────────────────────────────────
const CourseCard = ({
  icon: IconBg,
  iconBgColor,
  name,
  tag,
  tagBg,
  tagText,
  examDays,
  mastery,
}) => (
  <div className="bg-white rounded-3xl px-8 py-6 flex items-center justify-between shadow-[0_4px_24px_-2px_rgba(0,0,0,0.04),0_2px_8px_-1px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
    <div className="flex items-center gap-7">
      <div
        className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBgColor }}
      >
        <IconBg size={22} className="text-slate-600" />
      </div>
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h4
            className="font-extrabold text-[22px] tracking-tight leading-tight"
            style={{ color: C.text, fontFamily: "Manrope, sans-serif" }}
          >
            {name}
          </h4>
          <span
            className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase"
            style={{ backgroundColor: tagBg, color: tagText }}
          >
            {tag}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span
            className="flex items-center gap-1.5 text-[13px] font-semibold italic"
            style={{ color: C.subtle }}
          >
            <Clock size={11} /> Exam in {examDays} days
          </span>
          <span
            className="flex items-center gap-1.5 text-[13px] font-semibold"
            style={{ color: C.subtle }}
          >
            <BarChart2 size={11} /> {mastery}% Mastery
          </span>
        </div>
      </div>
    </div>
    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
      <MoreVertical size={16} className="text-slate-400" />
    </button>
  </div>
);

// ─── Calendar session block ───────────────────────────────────────────────────
const SessionBlock = ({
  time,
  subject,
  bgColor,
  borderColor,
  textColor,
  minH = 80,
  opacity = 1,
}) => (
  <div
    className="border-l-4 rounded-2xl px-4 py-3 flex flex-col justify-between"
    style={{ backgroundColor: bgColor, borderColor, minHeight: minH, opacity }}
  >
    <p className="text-[9px] font-bold uppercase" style={{ color: textColor }}>
      {time}
    </p>
    <p
      className="text-[11px] font-semibold leading-tight"
      style={{ color: C.text }}
    >
      {subject}
    </p>
  </div>
);

// ─── Enroll Form ──────────────────────────────────────────────────────────────
const EnrollForm = () => {
  const [difficulty, setDifficulty] = useState("Medium");
  const [commitment, setCommitment] = useState(12);

  return (
    <div className="bg-[#f1f3ff] rounded-2xl p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3
          className="font-bold text-[19px]"
          style={{ color: C.text, fontFamily: "Manrope, sans-serif" }}
        >
          Enroll New Course
        </h3>
        <button
          className="flex items-center gap-1.5 text-[13px] font-bold"
          style={{ color: C.indigo }}
        >
          <UploadCloud size={12} /> Import Courses
        </button>
      </div>

      <div>
        <label
          className="block text-[9px] font-bold uppercase tracking-widest mb-2"
          style={{ color: C.muted }}
        >
          Course Name
        </label>
        <input
          className="w-full rounded-2xl border border-slate-800 bg-[#f1f3ff] px-4 py-4 text-[13px] outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-400"
          placeholder="e.g. Molecular Biology 401"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className="block text-[9px] font-bold uppercase tracking-widest mb-2"
            style={{ color: C.muted }}
          >
            Exam Date
          </label>
          <input
            type="date"
            className="w-full rounded-2xl border border-slate-800 bg-[#f1f3ff] px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label
            className="block text-[9px] font-bold uppercase tracking-widest mb-2"
            style={{ color: C.muted }}
          >
            Deadline
          </label>
          <input
            type="date"
            className="w-full rounded-2xl border border-slate-800 bg-[#f1f3ff] px-3 py-3 text-[13px] outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      <div>
        <label
          className="block text-[9px] font-bold uppercase tracking-widest mb-3"
          style={{ color: C.muted }}
        >
          Difficulty Level
        </label>
        <div className="flex gap-3">
          {["Easy", "Medium", "Hard"].map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className="px-5 py-2 rounded-full text-[13px] font-medium transition-colors"
              style={
                difficulty === d
                  ? { backgroundColor: C.indigo, color: "white" }
                  : {
                      border: `1px solid ${C.border}`,
                      color: C.text,
                      backgroundColor: "transparent",
                    }
              }
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          className="block text-[9px] font-bold uppercase tracking-widest mb-3"
          style={{ color: C.muted }}
        >
          Commitment (Hours/Week)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={40}
            value={commitment}
            onChange={(e) => setCommitment(Number(e.target.value))}
            className="flex-1 accent-indigo-600"
          />
          <span
            className="text-[17px] font-semibold"
            style={{ color: C.indigo }}
          >
            {commitment}h
          </span>
        </div>
      </div>

      <button
        className="w-full py-3 rounded-xl text-white text-[15px] font-bold text-center transition-opacity hover:opacity-90"
        style={{
          background: "linear-gradient(135deg, #451ebb 0%, #5d3fd3 100%)",
        }}
      >
        Enroll Course
      </button>
    </div>
  );
};

// ─── Weekly Calendar ──────────────────────────────────────────────────────────
const DAYS = [
  { label: "MON", date: "12" },
  { label: "TUE", date: "13" },
  { label: "WED", date: "14" },
  { label: "THU", date: "15" },
  { label: "FRI", date: "16" },
  { label: "SAT", date: "🌙" },
  { label: "SUN", date: "18" },
];

const WeeklyCalendar = () => {
  const [view, setView] = useState("Grid");
  return (
    <section
      className="rounded-3xl p-8 flex flex-col gap-8"
      style={{ backgroundColor: C.panel }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="font-extrabold text-[28px] tracking-tight"
            style={{ color: C.text, fontFamily: "Manrope, sans-serif" }}
          >
            Weekly Curriculum
          </h2>
          <p
            className="text-[15px] font-medium mt-0.5"
            style={{ color: C.muted }}
          >
            Phase: Deep Retention • Week 4 of 12
          </p>
        </div>
        <div className="flex items-center gap-1 bg-[#e3e8f9] rounded-2xl p-1">
          {["Grid", "List"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
              style={
                view === v
                  ? {
                      backgroundColor: "white",
                      color: C.indigo,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    }
                  : { color: C.muted }
              }
            >
              {v} View
            </button>
          ))}
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-4">
        {DAYS.map(({ label, date }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span
              className="text-[9px] font-semibold uppercase tracking-widest"
              style={{ color: C.muted }}
            >
              {label}
            </span>
            <span
              className="text-[17px] font-semibold"
              style={{ color: C.text }}
            >
              {date}
            </span>
          </div>
        ))}
      </div>

      {/* Session grid */}
      <div className="grid grid-cols-7 gap-4 items-start">
        {/* MON */}
        <div className="flex flex-col gap-3">
          <SessionBlock
            time="09:00 AM"
            subject="Organic Chemistry"
            bgColor="rgba(93,63,211,0.15)"
            borderColor={C.indigo}
            textColor={C.indigo}
            minH={80}
          />
          <SessionBlock
            time="01:00 PM"
            subject="Neuroscience Review"
            bgColor="rgba(107,254,156,0.25)"
            borderColor={C.greenDark}
            textColor={C.greenDark}
            minH={110}
          />
        </div>
        {/* TUE */}
        <div className="flex flex-col gap-3">
          <SessionBlock
            time="10:30 AM"
            subject="Statistical Models"
            bgColor="rgba(255,223,160,0.25)"
            borderColor={C.amberDark}
            textColor={C.amberDark}
            minH={90}
          />
        </div>
        {/* WED */}
        <div className="flex flex-col gap-3">
          <SessionBlock
            time="09:00 AM"
            subject="Organic Chemistry"
            bgColor="rgba(93,63,211,0.15)"
            borderColor={C.indigo}
            textColor={C.indigo}
            minH={80}
          />
          <SessionBlock
            time="02:00 PM"
            subject="Thesis Drafting"
            bgColor="rgba(107,254,156,0.25)"
            borderColor={C.greenDark}
            textColor={C.greenDark}
            minH={120}
          />
        </div>
        {/* THU */}
        <div className="flex flex-col gap-3">
          <SessionBlock
            time="10:30 AM"
            subject="Statistical Models"
            bgColor="rgba(255,223,160,0.25)"
            borderColor={C.amberDark}
            textColor={C.amberDark}
            minH={90}
          />
        </div>
        {/* FRI */}
        <div className="flex flex-col gap-3">
          <SessionBlock
            time="09:00 AM"
            subject="Organic Chemistry"
            bgColor="rgba(93,63,211,0.15)"
            borderColor={C.indigo}
            textColor={C.indigo}
            minH={80}
          />
        </div>
        {/* SAT — buffer */}
        <div className="flex flex-col gap-3">
          <div
            className="border-l-4 rounded-2xl px-4 py-3 opacity-50"
            style={{
              backgroundColor: "rgba(107,254,156,0.15)",
              borderColor: "rgba(0,109,55,0.35)",
              minHeight: 60,
            }}
          >
            <p
              className="text-[9px] font-bold uppercase"
              style={{ color: C.muted }}
            >
              Buffer Time
            </p>
          </div>
        </div>
        {/* SUN — empty slot */}
        <div>
          <div
            className="border-2 border-dashed rounded-2xl flex items-center justify-center"
            style={{
              borderColor: C.border,
              backgroundColor: "#dde2f3",
              minHeight: 120,
            }}
          >
            <Plus size={16} className="text-slate-400" />
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Today's Focus Map ────────────────────────────────────────────────────────
const FocusMap = () => (
  <section className="bg-white rounded-[2.5rem] p-10 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.04),0_2px_8px_-1px_rgba(0,0,0,0.02)] h-full">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2
          className="font-extrabold text-[26px] tracking-tight"
          style={{ color: C.text, fontFamily: "Manrope, sans-serif" }}
        >
          Today's Focus Map
        </h2>
        <p className="text-[13px] font-medium mt-1" style={{ color: C.subtle }}>
          Your real-time execution path for today.
        </p>
      </div>
      <span
        className="px-5 py-2 rounded-full text-[11px] font-bold tracking-widest uppercase"
        style={{
          backgroundColor: "rgba(230,222,255,0.4)",
          color: C.indigo,
          border: `1px solid ${C.indigoBorder}`,
        }}
      >
        OCT 24, 2023
      </span>
    </div>

    {/* Timeline */}
    <div className="relative pl-8">
      {/* Vertical line */}
      <div className="absolute left-[10px] top-6 bottom-6 w-0.5 bg-slate-200 rounded-full" />

      {/* Slot 1: Completed */}
      <div className="relative mb-6">
        <div className="absolute -left-[22px] top-0 w-6 h-6 rounded-full bg-[#6bfe9c] border-4 border-white z-10" />
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-1"
              style={{ color: C.subtle }}
            >
              08:00 — 10:00
            </p>
            <h4
              className="font-extrabold text-[18px] line-through mb-1"
              style={{
                color: C.text,
                fontFamily: "Manrope, sans-serif",
                textDecorationColor: C.subtle,
              }}
            >
              Vector Algebra Review
            </h4>
            <p
              className="text-[13px] font-medium opacity-70 leading-relaxed"
              style={{ color: C.muted }}
            >
              Completed problem sets 4.1 to 4.5 and verified answers.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 ml-6 shrink-0">
            <span
              className="flex items-center gap-1.5 bg-[rgba(107,254,156,0.1)] px-3 py-1.5 rounded-xl text-[9px] font-bold tracking-widest uppercase"
              style={{ color: "#4ae183" }}
            >
              <CheckCircle2 size={10} /> COMPLETED
            </span>
            <button
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: C.subtle }}
            >
              VIEW NOTES
            </button>
          </div>
        </div>
      </div>

      {/* Slot 2: Active */}
      <div className="relative mb-6">
        <div
          className="absolute -left-[22px] top-0 w-6 h-6 rounded-full z-10 shadow-[0_0_0_6px_rgba(69,30,187,0.1)]"
          style={{ backgroundColor: C.indigo, border: "4px solid white" }}
        />
        <div
          className="rounded-3xl p-6 border"
          style={{
            backgroundColor: C.indigoLight,
            borderColor: C.indigoBorder,
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-1"
                style={{ color: C.indigo }}
              >
                11:00 — 13:00
              </p>
              <h4
                className="font-extrabold text-[18px] mb-1"
                style={{ color: C.text, fontFamily: "Manrope, sans-serif" }}
              >
                Phenomenology Reading
              </h4>
              <p
                className="text-[13px] font-medium leading-relaxed"
                style={{ color: C.muted }}
              >
                Heidegger Chapter 2 & Annotation for Seminar.
              </p>
            </div>
            <span
              className="bg-white border rounded-xl px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest flex flex-col items-center leading-tight"
              style={{ color: C.indigo, borderColor: C.indigoBorder }}
            >
              ACTIVE
              <br />
              NOW
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: C.indigo }}
            >
              <Pause size={10} /> PAUSE SESSION
            </button>
            <button
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: C.indigo }}
            >
              TIMER: 45:12
            </button>
          </div>
        </div>
      </div>

      {/* Slot 3: Pending */}
      <div className="relative">
        <div
          className="absolute -left-[20px] top-0 w-5 h-5 rounded-full border-4 border-white z-10"
          style={{ backgroundColor: C.border }}
        />
        <div className="flex items-start justify-between">
          <div className="flex-1 opacity-60">
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-1"
              style={{ color: C.subtle }}
            >
              15:00 — 17:00
            </p>
            <h4
              className="font-extrabold text-[18px] mb-1"
              style={{ color: C.text, fontFamily: "Manrope, sans-serif" }}
            >
              Exam Mock Test
            </h4>
            <p className="text-[13px] font-medium" style={{ color: C.muted }}>
              Timed environment simulation at campus library.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 ml-6 shrink-0">
            <span
              className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase"
              style={{ color: C.subtle }}
            >
              <Circle size={10} /> QUEUED
            </span>
            <button
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: C.indigo }}
            >
              RESCHEDULE
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─── Right panel cards ────────────────────────────────────────────────────────
const KineticCard = () => (
  <div
    className="rounded-[2.5rem] px-10 py-8 text-white overflow-hidden relative flex flex-col gap-6"
    style={{
      backgroundColor: "#5d3fd3",
      boxShadow: "0 25px 50px -12px rgba(69,30,187,0.25)",
    }}
  >
    <div className="absolute top-[-48px] right-[-48px] w-40 h-40 rounded-full opacity-10 blur-3xl bg-white" />
    <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 rounded-full opacity-5 bg-black blur-3xl" />
    <div className="w-14 h-14 rounded-3xl flex items-center justify-center bg-white/10 backdrop-blur-sm">
      <Zap size={26} className="text-[#d8ceff]" fill="currentColor" />
    </div>
    <div>
      <h3
        className="font-extrabold text-[22px] leading-tight mb-3"
        style={{ color: "#d8ceff", fontFamily: "Manrope, sans-serif" }}
      >
        Kinetic
        <br />
        Recalibration
      </h3>
      <p
        className="text-[13px] font-medium leading-relaxed opacity-80"
        style={{ color: "#d8ceff" }}
      >
        Let the Kinetic Algorithm analyze your current progress and deadlines to
        optimize your focus distribution.
      </p>
    </div>
    <button
      className="bg-white w-full py-2.5 rounded-xl text-[11px] font-bold tracking-widest uppercase hover:bg-slate-50 transition-colors"
      style={{ color: C.indigo }}
    >
      GENERATE SCHEDULE
    </button>
  </div>
);

const VelocityCard = () => (
  <div className="bg-white rounded-3xl px-8 py-5 flex items-center gap-5 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.04)]">
    <div className="flex-1">
      <p
        className="text-[9px] font-bold tracking-widest uppercase mb-2"
        style={{ color: C.subtle }}
      >
        STUDY VELOCITY
      </p>
      <div className="flex items-center gap-4">
        <div className="h-1.5 flex-1 rounded-full bg-[#e8eeff]" />
        <div className="flex items-baseline gap-1">
          <span className="text-[20px] font-bold" style={{ color: C.indigo }}>
            6.0h
          </span>
          <span className="text-[12px] font-medium" style={{ color: C.subtle }}>
            /day
          </span>
        </div>
      </div>
    </div>
    <div className="w-px h-8 bg-[#c9c4d7]" />
    <button className="p-3 rounded-2xl bg-[#f1f3ff] hover:bg-indigo-100 transition-colors">
      <BarChart2 size={16} style={{ color: C.indigo }} />
    </button>
  </div>
);

const StatsCards = () => (
  <div className="grid grid-cols-2 gap-4">
    <div
      className="rounded-3xl p-6 flex flex-col gap-2"
      style={{ backgroundColor: "rgba(69,30,187,0.05)" }}
    >
      <Timer size={18} style={{ color: C.indigo }} />
      <span className="text-[22px] font-semibold" style={{ color: C.indigo }}>
        24h
      </span>
      <span
        className="text-[9px] font-semibold uppercase tracking-wider"
        style={{ color: C.muted }}
      >
        Studied This Week
      </span>
    </div>
    <div
      className="rounded-3xl p-6 flex flex-col gap-2"
      style={{ backgroundColor: "rgba(255,223,160,0.2)" }}
    >
      <Flame size={18} style={{ color: C.amberDark }} />
      <span
        className="text-[22px] font-semibold"
        style={{ color: C.amberDark }}
      >
        14d
      </span>
      <span
        className="text-[9px] font-semibold uppercase tracking-wider"
        style={{ color: C.muted }}
      >
        Streak
      </span>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudySchedulePage() {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Navbar — same as DashboardPage */}
      <Navbar />

      <div className="bg-[#f9f9ff] min-h-screen flex w-full">
        {/* Sidebar — same as DashboardPage */}
        <Sidebar />

        {/* Main content — same px-12 py-10 padding as DashboardPage */}
        <main className="flex-1">
          <div className="px-12 py-10">
            {/* Page heading — same typographic scale as DashboardPage */}
            <div className="mb-10">
              <h1 className="font-[sans-serif] font-extrabold text-5xl tracking-[-1.2px] text-[#161c27] leading-[48px]">
                Study Schedule
              </h1>
              <p className="font-[sans-serif] text-[#484554] text-lg leading-relaxed mt-2">
                Manage your academic trajectory with editorial precision.
              </p>
            </div>

            {/* Row 1: Enroll form + Active courses — mimics dashboard's flex gap-8 */}
            <div className="flex gap-8 mb-8">
              {/* Enroll form — fixed 340px like dashboard's left widgets */}
              <div className="w-[340px] flex-shrink-0">
                <EnrollForm />
              </div>

              {/* Active courses — flex-1 like dashboard's right col */}
              <div className="flex flex-col gap-4 flex-1 min-w-0">
                <div className="flex items-center justify-between px-2">
                  <span
                    className="text-[9px] font-bold tracking-[2px] uppercase"
                    style={{ color: C.subtle }}
                  >
                    ACTIVE INTELLECTUAL PURSUITS
                  </span>
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: C.muted }}
                  >
                    02 Running
                  </span>
                </div>
                <CourseCard
                  icon={BarChart2}
                  iconBgColor="rgba(230,222,255,0.3)"
                  name="Advanced Calculus"
                  tag="CRUCIAL"
                  tagBg={C.redBg}
                  tagText={C.red}
                  examDays={18}
                  mastery={64}
                />
                <CourseCard
                  icon={FileText}
                  iconBgColor="rgba(107,254,156,0.4)"
                  name="Intro to Philosophy"
                  tag="ELECTIVE"
                  tagBg="#6bfe9c"
                  tagText="#00210c"
                  examDays={41}
                  mastery={22}
                />
                <CourseCard
                  icon={FileText}
                  iconBgColor="rgba(107,254,156,0.4)"
                  name="Intro to Philosophy"
                  tag="ELECTIVE"
                  tagBg="#6bfe9c"
                  tagText="#00210c"
                  examDays={41}
                  mastery={22}
                />
              </div>
            </div>

            {/* Weekly Curriculum — full width row */}
            <div className="mb-8">
              <WeeklyCalendar />
            </div>

            {/* Below row: Focus Map on left, right-side cards on right */}
            <div className="flex gap-8 items-stretch">
              {/* Left column — stretches to match right column height */}
              <div className="flex flex-col gap-6 w-[608px] flex-shrink-0">
                <FocusMap className="flex-1 h-full" />
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-6 flex-1 min-w-0">
                <KineticCard />
                <VelocityCard />
                <StatsCards />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
