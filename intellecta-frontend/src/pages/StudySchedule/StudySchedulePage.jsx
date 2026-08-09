import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/StudentSidebar";
import api from "../../services/api";
import { getUserId } from "../../utils/auth";
import {
  Clock,
  BarChart2,
  CheckCircle2,
  Zap,
  Flame,
  Timer,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Plus,
  Lightbulb,
  CalendarCheck,
  RefreshCw,
  Info,
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
  panel: "#f1f3ff",
  green: "#6bfe9c",
  greenDark: "#006d37",
  amber: "#ffdfa0",
  amberDark: "#594100",
  red: "#ba1a1a",
  redBg: "rgba(255,218,214,0.5)",
};

const PRIORITY_STYLES = {
  HIGH: { bg: C.redBg, text: C.red, label: "CRUCIAL" },
  MEDIUM: {
    bg: "rgba(255,223,160,0.25)",
    text: C.amberDark,
    label: "MODERATE",
  },
  LOW: { bg: "rgba(107,254,156,0.25)", text: C.greenDark, label: "LOW" },
};

const DIFF_COLORS = {
  HARD: { bg: C.redBg, text: C.red },
  MEDIUM: { bg: "rgba(255,223,160,0.25)", text: C.amberDark },
  EASY: { bg: "rgba(107,254,156,0.25)", text: C.greenDark },
};

// ─── Course Card ──────────────────────────────────────────────────────────────
const CourseCard = ({ course, onDelete }) => {
  const diff = DIFF_COLORS[course.difficulty] || DIFF_COLORS.MEDIUM;
  const urgent = course.daysUntilExam >= 0 && course.daysUntilExam <= 7;

  return (
    <div className="neu px-8 py-6 flex items-center justify-between hover:scale-[1.01] transition-transform">
      <div className="flex items-center gap-7">
        <div
          className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: diff.bg }}
        >
          <BarChart2 size={22} className="text-slate-600" />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h4
              className="font-extrabold text-[22px] tracking-tight leading-tight"
              style={{ color: C.text, fontFamily: "Manrope, sans-serif" }}
            >
              {course.courseName}
            </h4>
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase"
              style={{ backgroundColor: diff.bg, color: diff.text }}
            >
              {course.difficulty}
            </span>
            {urgent && (
              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase"
                style={{ backgroundColor: C.redBg, color: C.red }}
              >
                URGENT
              </span>
            )}
          </div>
          <div className="flex items-center gap-5">
            <span
              className="flex items-center gap-1.5 text-[13px] font-semibold italic"
              style={{ color: C.subtle }}
            >
              <Clock size={11} />
              {course.daysUntilExam >= 0
                ? `Exam in ${course.daysUntilExam} day${course.daysUntilExam !== 1 ? "s" : ""}`
                : "No exam date"}
            </span>
            <span
              className="flex items-center gap-1.5 text-[13px] font-semibold"
              style={{ color: C.subtle }}
            >
              <Timer size={11} /> {course.plannedHoursPerDay}h/day planned
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={() => onDelete(course.id)}
        className="p-2 hover:bg-red-50 rounded-full transition-colors group"
      >
        <Trash2
          size={16}
          className="text-slate-300 group-hover:text-red-400 transition-colors"
        />
      </button>
    </div>
  );
};

// ─── Enroll Form ──────────────────────────────────────────────────────────────
const EnrollForm = ({ onEnrolled }) => {
  const [courseName, setCourseName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [hours, setHours] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!courseName.trim()) {
      setError("Subject name is required.");
      return;
    }
    if (!examDate) {
      setError("Exam date is required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const userId = getUserId();
      if (!userId) return;
      await api.post(`/courses/user/${userId}`, {
        courseName: courseName.trim(),
        examDate,
        difficulty,
        plannedHoursPerDay: hours,
      });
      setCourseName("");
      setExamDate("");
      setDifficulty("MEDIUM");
      setHours(2);
      onEnrolled();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to enroll course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neu p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3
          className="font-bold text-[19px]"
          style={{ color: C.text, fontFamily: "Manrope, sans-serif" }}
        >
          Add New Subject
        </h3>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
          <AlertTriangle size={14} className="text-red-400 shrink-0" />
          <p className="text-[12px] text-red-600 font-medium">{error}</p>
        </div>
      )}

      <div>
        <label
          className="block text-[9px] font-bold uppercase tracking-widest mb-2"
          style={{ color: C.muted }}
        >
          Subject Name
        </label>
        <input
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          className="w-full neu-inset px-4 py-4 text-[13px] outline-none placeholder:text-slate-400 bg-transparent"
          placeholder="e.g. Linear Algebra"
        />
      </div>

      <div>
        <label
          className="block text-[9px] font-bold uppercase tracking-widest mb-2"
          style={{ color: C.muted }}
        >
          Exam Date
        </label>
        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full neu-inset px-4 py-3 text-[13px] outline-none bg-transparent"
        />
      </div>

      <div>
        <label
          className="block text-[9px] font-bold uppercase tracking-widest mb-3"
          style={{ color: C.muted }}
        >
          Difficulty Level
        </label>
        <div className="flex gap-3">
          {["EASY", "MEDIUM", "HARD"].map((d) => (
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
              {d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          className="block text-[9px] font-bold uppercase tracking-widest mb-3"
          style={{ color: C.muted }}
        >
          Planned Study (Hours/Day)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={12}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="flex-1 accent-indigo-600"
          />
          <span
            className="text-[17px] font-semibold"
            style={{ color: C.indigo }}
          >
            {hours}h
          </span>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn-primary w-full py-3 font-bold text-center transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Enrolling…" : "Enroll Course"}
      </button>
    </div>
  );
};

// ─── Warning Banner ───────────────────────────────────────────────────────────
const WarningBanner = ({ schedule, onDismiss }) => {
  const [open, setOpen] = useState(true);
  if (!schedule || schedule.feasible) return null;

  return (
    <div
      className="rounded-3xl overflow-hidden border"
      style={{ borderColor: "rgba(186,26,26,0.2)", backgroundColor: C.redBg }}
    >
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          <AlertTriangle size={18} style={{ color: C.red }} />
          <p className="text-[13px] font-bold" style={{ color: C.red }}>
            {schedule.warningMessage}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronUp size={16} style={{ color: C.red }} />
          ) : (
            <ChevronDown size={16} style={{ color: C.red }} />
          )}
        </div>
      </div>
      {open && schedule.suggestions?.length > 0 && (
        <div className="px-6 pb-5 flex flex-col gap-2">
          {schedule.suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <Lightbulb
                size={13}
                className="mt-0.5 shrink-0"
                style={{ color: C.amberDark }}
              />
              <p className="text-[12px] font-medium" style={{ color: C.muted }}>
                {s}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Generated Schedule Grid ──────────────────────────────────────────────────
const DAYS_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const BLOCK_COLORS = [
  { bg: "rgba(93,63,211,0.12)", border: "#451ebb", text: "#451ebb" },
  { bg: "rgba(107,254,156,0.2)", border: "#006d37", text: "#006d37" },
  { bg: "rgba(255,223,160,0.3)", border: "#594100", text: "#594100" },
  { bg: "rgba(255,100,100,0.12)", border: "#ba1a1a", text: "#ba1a1a" },
  { bg: "rgba(0,180,200,0.12)", border: "#005f6a", text: "#005f6a" },
  { bg: "rgba(180,100,255,0.12)", border: "#6b00b3", text: "#6b00b3" },
];

const ScheduleGrid = ({ schedule, courses }) => {
  if (!schedule || schedule.blocks.length === 0) {
    return (
      <div className="rounded-3xl bg-[#f1f3ff] p-12 flex items-center justify-center text-center">
        <div className="space-y-3">
          <CalendarCheck size={36} className="text-slate-300 mx-auto" />
          <p className="text-[15px] font-semibold text-slate-400">
            No schedule generated yet. Add Subjects and click Generate.
          </p>
        </div>
      </div>
    );
  }

  // Group blocks by dayLabel
  const byDay = {};
  DAYS_ORDER.forEach((d) => {
    byDay[d] = [];
  });
  schedule.blocks.forEach((b) => {
    const short = b.dayLabel.substring(0, 3);
    if (byDay[short]) byDay[short].push(b);
  });

  // Assign stable color per course name
  const courseNames = [...new Set(schedule.blocks.map((b) => b.courseName))];
  const colorMap = {};
  courseNames.forEach((name, i) => {
    colorMap[name] = BLOCK_COLORS[i % BLOCK_COLORS.length];
  });

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
            {schedule.feasible
              ? `${schedule.totalAvailableHours}h available — fully covered`
              : `${schedule.totalAvailableHours}h available · ${schedule.totalRequiredHours}h required`}
          </p>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-2 max-w-xs justify-end">
          {courseNames.map((name) => (
            <span
              key={name}
              className="px-3 py-1 rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: colorMap[name].bg,
                color: colorMap[name].text,
              }}
            >
              {name.length > 16 ? name.substring(0, 14) + "…" : name}
            </span>
          ))}
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-4">
        {DAYS_ORDER.map((label) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span
              className="text-[9px] font-semibold uppercase tracking-widest"
              style={{ color: C.muted }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Block grid */}
      <div className="grid grid-cols-7 gap-4 items-start">
        {DAYS_ORDER.map((day) => (
          <div key={day} className="flex flex-col gap-3">
            {byDay[day].length === 0 ? (
              <div
                className="border-2 border-dashed rounded-2xl flex items-center justify-center"
                style={{
                  borderColor: C.border,
                  backgroundColor: "#dde2f3",
                  minHeight: 80,
                }}
              >
                <Plus size={14} className="text-slate-400" />
              </div>
            ) : (
              byDay[day].map((block, i) => {
                const col = colorMap[block.courseName];
                return (
                  <div
                    key={i}
                    className="border-l-4 rounded-2xl px-3 py-3 flex flex-col justify-between"
                    style={{
                      backgroundColor: col.bg,
                      borderColor: col.border,
                      minHeight: 72,
                    }}
                  >
                    <p
                      className="text-[9px] font-bold uppercase"
                      style={{ color: col.text }}
                    >
                      {block.priority}
                    </p>
                    <p
                      className="text-[11px] font-semibold leading-tight mt-1"
                      style={{ color: C.text }}
                    >
                      {block.courseName}
                    </p>
                    <p
                      className="text-[10px] font-medium mt-1"
                      style={{ color: C.subtle }}
                    >
                      {block.hoursAllocated}h · {block.daysUntilExam}d left
                    </p>
                  </div>
                );
              })
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── Generate Panel ───────────────────────────────────────────────────────────
const GeneratePanel = ({ onGenerate, loading, hasCourses }) => {
  const [hours, setHours] = useState(6);

  return (
    <div
      className="glass-card border-indigo-400/30 px-10 py-8 text-white overflow-hidden relative flex flex-col gap-6"
      style={{
        backgroundColor: "#5d3fd3",
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
          Schedule Generator
        </h3>
        <p
          className="text-[13px] font-medium leading-relaxed opacity-80"
          style={{ color: "#d8ceff" }}
        >
          Allocates study hours across your added subjects based on urgency,
          difficulty, and your availability.
        </p>
      </div>

      <div>
        <label
          className="block text-[9px] font-bold uppercase tracking-widest mb-3 opacity-60"
          style={{ color: "#d8ceff" }}
        >
          Available Hours / Day
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={12}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="flex-1 accent-white"
          />
          <span className="text-[20px] font-bold text-white">{hours}h</span>
        </div>
      </div>

      {!hasCourses && (
        <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-3">
          <Info size={13} className="text-white/60 shrink-0" />
          <p className="text-[11px] text-white/70">
            Enroll at least one course first.
          </p>
        </div>
      )}

      <button
        onClick={() => onGenerate(hours)}
        disabled={loading || !hasCourses}
        className="bg-white w-full py-2.5 rounded-xl text-[11px] font-bold tracking-widest uppercase hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ color: C.indigo }}
      >
        {loading ? (
          <>
            <RefreshCw size={13} className="animate-spin" /> GENERATING…
          </>
        ) : (
          <>
            <Zap size={13} /> GENERATE SCHEDULE
          </>
        )}
      </button>
    </div>
  );
};

// ─── Stats Cards ─────────────────────────────────────────────────────────────
const StatsCards = ({ courses }) => {
  const urgent = courses.filter(
    (c) => c.daysUntilExam >= 0 && c.daysUntilExam <= 14,
  ).length;
  const totalHours = courses.reduce((s, c) => s + c.plannedHoursPerDay, 0);
  return (
    <div className="grid grid-cols-2 gap-4">
      <div
        className="rounded-3xl p-6 flex flex-col gap-2"
        style={{ backgroundColor: "rgba(69,30,187,0.05)" }}
      >
        <Timer size={18} style={{ color: C.indigo }} />
        <span className="text-[22px] font-semibold" style={{ color: C.indigo }}>
          {totalHours.toFixed(1)}h
        </span>
        <span
          className="text-[9px] font-semibold uppercase tracking-wider"
          style={{ color: C.muted }}
        >
          Planned / Day
        </span>
      </div>
      <div
        className="rounded-3xl p-6 flex flex-col gap-2"
        style={{
          backgroundColor: urgent > 0 ? C.redBg : "rgba(107,254,156,0.2)",
        }}
      >
        <Flame size={18} style={{ color: urgent > 0 ? C.red : C.greenDark }} />
        <span
          className="text-[22px] font-semibold"
          style={{ color: urgent > 0 ? C.red : C.greenDark }}
        >
          {urgent}
        </span>
        <span
          className="text-[9px] font-semibold uppercase tracking-wider"
          style={{ color: C.muted }}
        >
          Urgent Exams
        </span>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudySchedulePage() {
  const [courses, setCourses] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingGen, setLoadingGen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const userId = getUserId();

  const fetchCourses = async () => {
    try {
      const res = await api.get(`/courses/user/${userId}`);
      setCourses(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (courseId) => {
    try {
      await api.delete(`/courses/user/${userId}/${courseId}`);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setSchedule(null); // reset schedule when courses change
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async (availableHoursPerDay) => {
    setLoadingGen(true);
    setSchedule(null);
    try {
      const res = await api.post(`/schedule/user/${userId}/generate`, {
        availableHoursPerDay,
      });
      setSchedule(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGen(false);
    }
  };

  const handleEnrolled = () => {
    fetchCourses();
    setSchedule(null); // reset schedule when new course enrolled
    setSuccessMsg("Subject added successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />
      <div className="bg-[#f9f9ff] min-h-screen flex w-full">
        <Sidebar />
        <main className="flex-1">
          <div className="px-12 py-10">
            {/* Page heading */}
            <div className="mb-10">
              <h1 className="font-[sans-serif] font-extrabold text-5xl tracking-[-1.2px] text-[#161c27] leading-[48px]">
                Study Schedule
              </h1>
              <p className="font-[sans-serif] text-[#484554] text-lg leading-relaxed mt-2">
                Manage your academic trajectory with editorial precision.
              </p>
            </div>

            {/* Success toast */}
            {successMsg && (
              <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <p className="text-[13px] font-semibold text-emerald-700">
                  {successMsg}
                </p>
              </div>
            )}

            {/* Row 1: Enroll + Courses */}
            <div className="flex gap-8 mb-8">
              <div className="w-[340px] flex-shrink-0">
                <EnrollForm onEnrolled={handleEnrolled} />
              </div>

              <div className="flex flex-col gap-4 flex-1 min-w-0">
                <div className="flex items-center justify-between px-2">
                  <span
                    className="text-[9px] font-bold tracking-[2px] uppercase"
                    style={{ color: C.subtle }}
                  >
                    ENROLLED SUBJECTS
                  </span>
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: C.muted }}
                  >
                    {courses.length} Course{courses.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div
                  className="custom-scrollbar overflow-y-auto flex flex-col gap-4"
                  style={{ maxHeight: "520px", paddingRight: "4px" }}
                >
                  {loadingCourses ? (
                    <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
                      Loading courses…
                    </div>
                  ) : courses.length === 0 ? (
                    <div
                      className="flex flex-col items-center justify-center py-16 gap-3 bg-white rounded-3xl border-2 border-dashed"
                      style={{ borderColor: C.border }}
                    >
                      <CalendarCheck size={32} className="text-slate-300" />
                      <p className="text-[14px] text-slate-400 font-medium">
                        No subjects enrolled yet. Add one on the left.
                      </p>
                    </div>
                  ) : (
                    courses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Warning banner */}
            {schedule && !schedule.feasible && (
              <div className="mb-8">
                <WarningBanner schedule={schedule} />
              </div>
            )}

            {/* Schedule grid */}
            <div className="mb-8">
              <ScheduleGrid schedule={schedule} courses={courses} />
            </div>

            {/* Bottom row: Generate panel + Stats */}
            <div className="flex gap-8 items-stretch">
              <div className="flex flex-col gap-6 flex-1 min-w-0">
                <GeneratePanel
                  onGenerate={handleGenerate}
                  loading={loadingGen}
                  hasCourses={courses.length > 0}
                />
              </div>
              <div className="flex flex-col gap-6 w-[260px] flex-shrink-0">
                <StatsCards courses={courses} />
                {schedule && (
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
                    <p
                      className="text-[9px] font-bold uppercase tracking-widest"
                      style={{ color: C.subtle }}
                    >
                      Schedule Summary
                    </p>
                    <div className="flex justify-between">
                      <span className="text-[12px] text-slate-500">
                        Available / week
                      </span>
                      <span
                        className="text-[12px] font-bold"
                        style={{ color: C.indigo }}
                      >
                        {schedule.totalAvailableHours}h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[12px] text-slate-500">
                        Required / week
                      </span>
                      <span
                        className="text-[12px] font-bold"
                        style={{
                          color: schedule.feasible ? C.greenDark : C.red,
                        }}
                      >
                        {schedule.totalRequiredHours}h
                      </span>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="flex items-center gap-2">
                      {schedule.feasible ? (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      ) : (
                        <AlertTriangle size={14} style={{ color: C.red }} />
                      )}
                      <span
                        className="text-[11px] font-semibold"
                        style={{
                          color: schedule.feasible ? C.greenDark : C.red,
                        }}
                      >
                        {schedule.feasible
                          ? "Schedule is feasible"
                          : "Insufficient hours"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
