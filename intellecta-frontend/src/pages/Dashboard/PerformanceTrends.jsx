import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, TrendingDown, Minus, Search, Download,
  RefreshCw, CalendarDays, User, ChevronDown, ChevronUp,
  BarChart2, BookOpen, AlertTriangle, X,
} from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import intellectaLogo from "../../assets/intellectaLogo.jpeg";
import api from "../../services/api";

const today = new Date().toISOString().split("T")[0];
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

const SUBJECTS = ["Mathematics", "Physics", "Computer Science", "Chemistry"];

export default function PerformanceTrends() {
  const [activeTab, setActiveTab] = useState("Analytics");

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [fromDate, setFromDate] = useState(thirtyDaysAgo);
  const [toDate, setToDate] = useState(today);
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [dateError, setDateError] = useState("");

  // Subject comparison
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);

  // Data
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Individual student drill-down
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/performance", {
        params: { search: appliedSearch, from: appliedFrom, to: appliedTo },
      });
      setData(res.data);
    } catch {
      showToast("Failed to load performance data.", "error");
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, appliedFrom, appliedTo]);

  useEffect(() => { fetchTrends(); }, [fetchTrends]);

  const handleApplyFilters = () => {
    if (fromDate && toDate && fromDate > toDate) {
      setDateError("Start date cannot be after end date.");
      return;
    }
    setDateError("");
    setAppliedSearch(searchInput);
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  };

  const handleClearFilters = () => {
    setSearchInput(""); setAppliedSearch("");
    setFromDate(thirtyDaysAgo); setToDate(today);
    setAppliedFrom(""); setAppliedTo("");
    setDateError("");
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    setStudentLoading(true);
    try {
      const res = await api.get(`/admin/performance/student/${student.id}`);
      setStudentDetail(res.data);
    } catch {
      showToast("Failed to load student details.", "error");
    } finally {
      setStudentLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get("/admin/performance/export", {
        params: { from: appliedFrom, to: appliedTo },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url; a.setAttribute("download", "performance_trends.csv");
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      showToast("Trends exported successfully.");
    } catch {
      showToast("Failed to export trends.", "error");
    }
  };

  const toggleSubject = (s) =>
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const displayedSubjects =
    data?.subjectBreakdown?.filter(
      (s) => selectedSubjects.length === 0 || selectedSubjects.includes(s.subjectName)
    ) ?? [];

  const val = (v) => (loading || !data ? "—" : v);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar intellectaLogo={intellectaLogo} />

      <div className="flex min-h-screen bg-[#F9FAFB] font-inter text-[#111827]">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-10 space-y-8 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto space-y-8">

            {/* HEADER */}
            <div className="flex flex-wrap justify-between items-end gap-6">
              <div>
                <h2 className="text-4xl font-black tracking-tight">Performance Trends</h2>
                <p className="text-gray-400 font-bold mt-2 uppercase text-[11px] tracking-widest">
                  Track student performance patterns and identify weak areas.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-black text-[#6C5DD3] hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                >
                  <Download size={16} strokeWidth={3} /> Export Trends
                </button>
                <button
                  onClick={fetchTrends}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-4 bg-[#6C5DD3] text-white rounded-2xl text-xs font-black hover:bg-[#5a4db3] shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-60"
                >
                  <RefreshCw size={16} strokeWidth={3} className={loading ? "animate-spin" : ""} />
                  {loading ? "Loading..." : "Refresh"}
                </button>
              </div>
            </div>

            {/* FILTERS */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 space-y-4">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Filters</p>
              <div className="flex flex-wrap items-end gap-4">
                {/* Student search */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Search Student</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Name or email..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                      className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/30 w-52"
                    />
                  </div>
                </div>
                {/* From */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <CalendarDays size={10} /> From
                  </label>
                  <input type="date" value={fromDate} max={toDate}
                    onChange={(e) => { setFromDate(e.target.value); setDateError(""); }}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/30"
                  />
                </div>
                {/* To */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <CalendarDays size={10} /> To
                  </label>
                  <input type="date" value={toDate} min={fromDate} max={today}
                    onChange={(e) => { setToDate(e.target.value); setDateError(""); }}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/30"
                  />
                </div>
                <button onClick={handleApplyFilters}
                  className="px-6 py-2.5 bg-[#6C5DD3] text-white rounded-xl text-xs font-black hover:bg-[#5b4eb3] transition-all">
                  Apply
                </button>
                {(appliedSearch || appliedFrom) && (
                  <button onClick={handleClearFilters}
                    className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-black hover:bg-gray-200 transition-all">
                    Clear
                  </button>
                )}
              </div>
              {dateError && <p className="text-xs font-bold text-red-400">{dateError}</p>}
              {(appliedSearch || appliedFrom) && (
                <div className="flex gap-2 flex-wrap">
                  {appliedSearch && (
                    <span className="text-[10px] font-black text-[#6C5DD3] bg-[#6C5DD3]/10 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                      Search: {appliedSearch}
                    </span>
                  )}
                  {appliedFrom && (
                    <span className="text-[10px] font-black text-[#6C5DD3] bg-[#6C5DD3]/10 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                      {appliedFrom} → {appliedTo}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* OVERVIEW STAT CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={<BarChart2 size={20} />} label="Total Students"
                value={val(data?.totalStudents)} sub="Registered students" color="text-[#6C5DD3]" bg="bg-[#6C5DD3]/10" />
              <StatCard icon={<TrendingUp size={20} />} label="Overall Avg Score"
                value={val(`${data?.overallAverageScore ?? 0}%`)} sub="Across all quizzes" color="text-emerald-600" bg="bg-emerald-50" />
              <StatCard icon={<BookOpen size={20} />} label="Quiz Attempts"
                value={val(data?.totalQuizAttempts ?? 0)} sub="Total attempts" color="text-blue-500" bg="bg-blue-50" />
              <StatCard icon={<AlertTriangle size={20} />} label="Weak Topics"
                value={val(data?.weakTopics?.length ?? 0)} sub="Need attention" color="text-amber-500" bg="bg-amber-50" />
            </div>

            {/* PERFORMANCE OVER TIME (visual chart) */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-black">Performance Over Time</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Average scores across all students
                  </p>
                </div>
                <span className="text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl uppercase tracking-widest">
                  {appliedFrom ? `${appliedFrom} → ${appliedTo}` : "All Time"}
                </span>
              </div>
              <div className="flex items-end justify-between h-48 gap-2">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((month, i) => {
                  const heights = [0, 0, 0, 0, 0, 0, 0];
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-3">
                      <div
                        className={`w-full rounded-xl transition-all duration-500 ${heights[i] > 0 ? "bg-[#6C5DD3]" : "bg-[#E3E0F7]"}`}
                        style={{ height: heights[i] > 0 ? `${heights[i]}%` : "8px" }}
                      />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{month}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-xs font-bold text-gray-400 mt-6 uppercase tracking-widest">
                Performance data will appear here as students complete quizzes
              </p>
            </div>

            {/* SUBJECT COMPARISON */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                  <h3 className="text-2xl font-black">Subject Comparison</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Compare performance across subjects
                  </p>
                </div>
                {/* Multi-subject selector */}
                <div className="relative">
                  <button
                    onClick={() => setSubjectDropdownOpen((o) => !o)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    {selectedSubjects.length === 0 ? "All Subjects" : `${selectedSubjects.length} selected`}
                    {subjectDropdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {subjectDropdownOpen && (
                    <div className="absolute right-0 top-11 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 w-52">
                      {SUBJECTS.map((s) => (
                        <label key={s} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                          <input type="checkbox" checked={selectedSubjects.includes(s)}
                            onChange={() => toggleSubject(s)}
                            className="rounded accent-[#6C5DD3]" />
                          <span className="text-sm font-bold text-gray-700">{s}</span>
                        </label>
                      ))}
                      {selectedSubjects.length > 0 && (
                        <button onClick={() => setSelectedSubjects([])}
                          className="w-full text-center text-xs font-black text-[#6C5DD3] py-2 border-t border-gray-50 hover:bg-gray-50 mt-1">
                          Clear selection
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                {displayedSubjects.map((subj) => (
                  <div key={subj.subjectName}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-black text-[#111827]">{subj.subjectName}</span>
                      <span className="text-xs font-black text-gray-400">
                        {subj.attempts > 0 ? `${subj.averageScore}%` : "No data yet"}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${subj.averageScore}%`, backgroundColor: subj.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STUDENT LIST + DRILL-DOWN */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Student table */}
              <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50">
                  <h3 className="text-2xl font-black">Student Performance</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Click a student to view individual trends
                  </p>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                      <th className="px-8 py-4">Student</th>
                      <th className="px-8 py-4">Avg Score</th>
                      <th className="px-8 py-4">Attempts</th>
                      <th className="px-8 py-4">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr><td colSpan={4} className="px-8 py-10 text-center text-sm font-bold text-gray-400">Loading...</td></tr>
                    ) : !data?.students?.length ? (
                      <tr><td colSpan={4} className="px-8 py-10 text-center text-sm font-bold text-gray-400">No students found.</td></tr>
                    ) : (
                      data.students.map((s) => (
                        <tr
                          key={s.id}
                          onClick={() => handleStudentClick(s)}
                          className={`hover:bg-gray-50/70 cursor-pointer transition-colors ${selectedStudent?.id === s.id ? "bg-[#6C5DD3]/5 border-l-4 border-[#6C5DD3]" : ""}`}
                        >
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`}
                                alt="" className="w-9 h-9 rounded-full border border-gray-100" />
                              <div>
                                <p className="text-sm font-black text-[#111827]">{s.username}</p>
                                <p className="text-[10px] font-bold text-gray-400">{s.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <span className="text-sm font-black text-[#111827]">
                              {s.quizAttempts > 0 ? `${s.averageScore}%` : "—"}
                            </span>
                          </td>
                          <td className="px-8 py-4">
                            <span className="text-sm font-bold text-gray-500">{s.quizAttempts}</span>
                          </td>
                          <td className="px-8 py-4">
                            <TrendIcon trend={s.trend} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Student detail panel */}
              <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 flex flex-col">
                {!selectedStudent ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 text-gray-300">
                    <User size={48} />
                    <p className="text-sm font-black uppercase tracking-widest">
                      Select a student to view their performance
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-lg font-black text-[#111827]">Student Detail</h3>
                      <button onClick={() => { setSelectedStudent(null); setStudentDetail(null); }}
                        className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-50 transition-all">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mb-8">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.username}`}
                        alt="" className="w-14 h-14 rounded-full border border-gray-100" />
                      <div>
                        <p className="text-base font-black text-[#111827]">{selectedStudent.username}</p>
                        <p className="text-xs font-bold text-gray-400">{selectedStudent.email}</p>
                        <StatusBadge status={selectedStudent.status} />
                      </div>
                    </div>

                    {studentLoading ? (
                      <p className="text-sm font-bold text-gray-400 text-center py-8">Loading...</p>
                    ) : (
                      <div className="space-y-5 flex-1">
                        <DetailRow label="Avg Score"
                          value={studentDetail?.quizAttempts > 0 ? `${studentDetail.averageScore}%` : "No data yet"} />
                        <DetailRow label="Quiz Attempts" value={studentDetail?.quizAttempts ?? 0} />
                        <DetailRow label="Trend" value={<TrendIcon trend={studentDetail?.trend ?? "STABLE"} />} />

                        <div className="mt-8 pt-6 border-t border-gray-50">
                          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">
                            Score History
                          </p>
                          <div className="flex items-end gap-1.5 h-20">
                            {[0, 0, 0, 0, 0, 0, 0].map((h, i) => (
                              <div key={i}
                                className="flex-1 bg-[#E3E0F7] rounded-md"
                                style={{ height: h > 0 ? `${h}%` : "6px" }}
                              />
                            ))}
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-tight">
                            Score history will populate after quiz attempts
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* WEAK TOPICS */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center">
                  <AlertTriangle size={20} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">Weak Topics</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    Topics where students consistently score low
                  </p>
                </div>
              </div>
              {data?.weakTopics?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.weakTopics.map((topic) => (
                    <div key={topic}
                      className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 text-sm font-black text-amber-700">
                      {topic}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-300">
                  <AlertTriangle size={40} className="mx-auto mb-3" />
                  <p className="text-sm font-black uppercase tracking-widest text-gray-400">
                    Weak topics will appear here once students complete quizzes
                  </p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* TOAST */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-xl font-bold text-sm text-white z-50 ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────

const StatCard = ({ icon, label, value, sub, color, bg }) => (
  <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
    <div className={`w-10 h-10 ${bg} ${color} rounded-2xl flex items-center justify-center mb-5`}>{icon}</div>
    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <h4 className="text-3xl font-black mt-1 text-[#111827]">{value}</h4>
    <p className="text-[11px] font-bold text-gray-400 mt-1">{sub}</p>
  </div>
);

const TrendIcon = ({ trend }) => {
  if (trend === "UP") return (
    <span className="flex items-center gap-1 text-emerald-500 text-xs font-black">
      <TrendingUp size={14} /> UP
    </span>
  );
  if (trend === "DOWN") return (
    <span className="flex items-center gap-1 text-red-400 text-xs font-black">
      <TrendingDown size={14} /> DOWN
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-gray-400 text-xs font-black">
      <Minus size={14} /> STABLE
    </span>
  );
};

const StatusBadge = ({ status }) => (
  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md mt-1 inline-block ${status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-400"}`}>
    {status ?? "—"}
  </span>
);

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-black text-[#111827]">{value}</span>
  </div>
);
