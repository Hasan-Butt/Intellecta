import React, { useState, useEffect, useCallback } from "react";
import {
  Download,
  RefreshCw,
  ShieldCheck,
  Activity,
  Users,
  BookOpen,
  HelpCircle,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import intellectaLogo from "../../assets/intellectaLogo.jpeg";
import api from "../../services/api";

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState("Analytics");

  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [fromDate, setFromDate] = useState(thirtyDaysAgo);
  const [toDate, setToDate] = useState(today);
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [dateError, setDateError] = useState("");

  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [integrity, setIntegrity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [integrityLoading, setIntegrityLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/analytics", {
        params: { from: appliedFrom, to: appliedTo },
      });
      setAnalytics(res.data);
    } catch {
      showToast("Failed to load analytics.", "error");
    } finally {
      setLoading(false);
    }
  }, [appliedFrom, appliedTo]);

  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res = await api.get("/admin/audit");
      setAuditLogs(res.data);
    } catch {
      showToast("Failed to load audit logs.", "error");
    } finally {
      setAuditLoading(false);
    }
  }, []);

  const fetchIntegrity = useCallback(async () => {
    setIntegrityLoading(true);
    try {
      const res = await api.get("/admin/integrity");
      setIntegrity(res.data);
    } catch {
      showToast("Failed to load system integrity.", "error");
    } finally {
      setIntegrityLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    fetchAuditLogs();
    fetchIntegrity();
  }, [fetchAnalytics, fetchAuditLogs, fetchIntegrity]);

  const handleApplyDateRange = () => {
    if (fromDate && toDate && fromDate > toDate) {
      setDateError("Start date cannot be after end date.");
      return;
    }
    setDateError("");
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  };

  const handleExport = async () => {
    try {
      const res = await api.get("/admin/analytics/export", {
        params: { from: appliedFrom, to: appliedTo },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "analytics.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast("Report downloaded.");
    } catch {
      showToast("Failed to export report.", "error");
    }
  };

  const val = (v) => (loading || !analytics ? "—" : v);
  const activePercent = analytics?.activeUserPercentage ?? 0;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar intellectaLogo={intellectaLogo} />

      <div className="flex min-h-screen bg-[#F9FAFB] font-inter text-[#111827]">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-10 space-y-10 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto space-y-10">

            {/* Header */}
            <div className="flex flex-wrap justify-between items-end gap-6">
              <div>
                <h2 className="text-4xl font-black tracking-tight text-[#111827]">
                  System Analytics
                </h2>
                <p className="text-gray-400 font-bold mt-2 uppercase text-[11px] tracking-widest">
                  Real-time monitoring of session health and cognitive load.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-black text-[#6C5DD3] hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                >
                  <Download size={18} strokeWidth={3} /> Export Report
                </button>
                <button
                  onClick={() => { fetchAnalytics(); fetchAuditLogs(); fetchIntegrity(); }}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-4 bg-[#6C5DD3] text-white rounded-2xl text-xs font-black hover:bg-[#5a4db3] shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-60"
                >
                  <RefreshCw size={18} strokeWidth={3} className={loading ? "animate-spin" : ""} />
                  {loading ? "Updating..." : "Live Update"}
                </button>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  <CalendarDays size={16} className="text-[#6C5DD3]" />
                  Date Range
                </div>
                <div className="flex flex-wrap items-end gap-4 flex-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">From</label>
                    <input
                      type="date"
                      value={fromDate}
                      max={toDate}
                      onChange={(e) => { setFromDate(e.target.value); setDateError(""); }}
                      className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">To</label>
                    <input
                      type="date"
                      value={toDate}
                      min={fromDate}
                      max={today}
                      onChange={(e) => { setToDate(e.target.value); setDateError(""); }}
                      className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/30"
                    />
                  </div>
                  <button
                    onClick={handleApplyDateRange}
                    className="px-6 py-2.5 bg-[#6C5DD3] text-white rounded-xl text-xs font-black hover:bg-[#5b4eb3] transition-all"
                  >
                    Apply Filter
                  </button>
                  {(appliedFrom || appliedTo) && (
                    <button
                      onClick={() => { setAppliedFrom(""); setAppliedTo(""); setFromDate(thirtyDaysAgo); setToDate(today); }}
                      className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-black hover:bg-gray-200 transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {dateError && (
                  <p className="text-xs font-bold text-red-400 w-full">{dateError}</p>
                )}
                {appliedFrom && (
                  <span className="text-[10px] font-black text-[#6C5DD3] bg-[#6C5DD3]/10 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                    Filtered: {appliedFrom} → {appliedTo}
                  </span>
                )}
              </div>
            </div>

            {/* Platform Metrics — real data */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                icon={<Users size={20} />}
                label="Total Users"
                value={val(analytics?.totalUsers)}
                sub={val(`${analytics?.studentCount} students · ${analytics?.adminCount} admins`)}
                color="text-[#6C5DD3]"
                bg="bg-[#6C5DD3]/10"
              />
              <MetricCard
                icon={<TrendingUp size={20} />}
                label="Active Users"
                value={val(analytics?.activeUsers)}
                sub={val(`${analytics?.activeUserPercentage}% of total`)}
                color="text-emerald-600"
                bg="bg-emerald-50"
              />
              <MetricCard
                icon={<BookOpen size={20} />}
                label="Quizzes Taken"
                value={val(analytics?.totalQuizzesTaken ?? 0)}
                sub={val(`Avg score: ${analytics?.averageQuizScore ?? 0}%`)}
                color="text-blue-500"
                bg="bg-blue-50"
              />
              <MetricCard
                icon={<HelpCircle size={20} />}
                label="Total Questions"
                value={val(analytics?.totalQuestions ?? 0)}
                sub="In question bank"
                color="text-amber-500"
                bg="bg-amber-50"
              />
            </div>

            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-12 gap-8">
              {/* Focus Card — driven by real activeUserPercentage */}
              <div className="col-span-12 lg:col-span-5 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                      Active User Focus
                    </p>
                    <h3 className="text-6xl font-black mt-4 tracking-tighter text-[#111827]">
                      {loading ? "—" : `${activePercent}%`}
                    </h3>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-[11px] font-black px-3 py-1 rounded-xl border border-emerald-100">
                    {analytics
                      ? `${analytics.activeUsers}/${analytics.totalUsers} active`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-end gap-2 h-32 mb-6">
                  {(analytics?.focusHistory ?? [35, 45, 60, 40, 85, 50, 40, 35, 60, activePercent]).map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-lg transition-all duration-500 ${
                        h > 70 ? "bg-[#6C5DD3]" : "bg-[#E3E0F7] hover:bg-[#d0ccf0]"
                      }`}
                      style={{ height: `${Math.max(Math.min(h, 100), 4)}%` }}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">
                  {analytics
                    ? `Based on ${analytics.totalUsers} registered users.`
                    : "Loading..."}
                </p>
              </div>

              {/* Distractions Card */}
              <div className="col-span-12 lg:col-span-3 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    Distractions
                  </p>
                  <div className="flex items-baseline gap-1 mt-6">
                    <h3 className="text-6xl font-black text-[#111827] tracking-tighter">
                      {loading ? "—" : (analytics?.distractionsPerHour ?? 0)}
                    </h3>
                    <span className="text-gray-300 text-xl font-bold uppercase">/hr</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-red-500 mt-10">
                  <Activity size={24} />
                  <p className="text-[11px] font-black leading-tight uppercase tracking-widest">
                    {loading ? "—" : (analytics?.distractionTrend ?? "—")}
                  </p>
                </div>
              </div>

              {/* System Load Card */}
              <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  System Load
                </p>
                <h3 className="text-6xl font-black mt-6 tracking-tighter text-[#111827]">
                  {integrityLoading ? "—" : `${integrity?.systemLoad ?? 0}%`}
                </h3>
                <div className="mt-10 h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${integrity?.systemLoad ?? 0}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-6 font-black uppercase tracking-[0.2em]">
                  {integrityLoading ? "Checking..." : (integrity?.nodeStatus ?? "All Nodes Healthy")}
                </p>
              </div>
            </div>

            {/* User Breakdown + Audit Logs */}
            <div className="grid grid-cols-12 gap-8">
              {/* Session Audit Logs */}
              <div className="col-span-12 lg:col-span-8 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 flex justify-between items-center border-b border-gray-50">
                  <h4 className="text-2xl font-black text-[#111827]">Session Audit Logs</h4>
                  <div className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">
                    Live Stream
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-[10px] uppercase text-gray-400 font-black tracking-widest">
                      <tr>
                        <th className="px-8 py-5">Timestamp</th>
                        <th className="px-8 py-5">User ID</th>
                        <th className="px-8 py-5">Event</th>
                        <th className="px-8 py-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-bold text-gray-600">
                      {auditLoading ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-8 text-center text-sm font-bold text-gray-400">
                            Loading audit logs...
                          </td>
                        </tr>
                      ) : auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-8 text-center text-sm font-bold text-gray-400">
                            No session logs available.
                          </td>
                        </tr>
                      ) : auditLogs.map((row, i) => (
                        <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-5 text-gray-400 font-mono text-xs">{row.timestamp}</td>
                          <td className="px-8 py-5 text-[#111827] font-black text-xs">{row.userId}</td>
                          <td className="px-8 py-5 text-xs">{row.event}</td>
                          <td className="px-8 py-5 text-right">
                            <span className={`text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${
                              row.status === "COMPLETED"   ? "bg-emerald-500" :
                              row.status === "IN_PROGRESS" ? "bg-amber-500"   : "bg-gray-400"
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Side cards */}
              <div className="col-span-12 lg:col-span-4 space-y-8">
                {/* System Integrity */}
                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-8">
                      <ShieldCheck size={28} className="text-emerald-500" />
                    </div>
                    <h4 className="text-3xl font-black leading-tight text-[#111827]">
                      System Integrity{" "}
                      {integrityLoading ? "—" : `${integrity?.integrityScore ?? 100}%`}
                    </h4>
                    <p className="text-sm text-gray-400 mt-4 font-bold leading-relaxed">
                      {integrityLoading
                        ? "Running diagnostics..."
                        : (integrity?.nodeStatus ?? "All systems operational")}
                    </p>
                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-tight">
                        <span>Active Sessions</span>
                        <span className="text-emerald-500">
                          {integrity?.concurrentSessions ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-tight">
                        <span>Quiz Completion</span>
                        <span className="text-blue-500">
                          {integrity?.quizCompletionRate ?? 100}%
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-tight">
                        <span>Active Users</span>
                        <span className="text-[#6C5DD3]">
                          {integrity ? `${integrity.activeUsers}/${integrity.totalUsers}` : "—"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={fetchIntegrity}
                      disabled={integrityLoading}
                      className="mt-8 w-full py-5 bg-[#6C5DD3] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#5a4db3] transition-all shadow-lg shadow-indigo-100 disabled:opacity-60"
                    >
                      {integrityLoading ? "Scanning..." : "Execute Diagnostics"}
                    </button>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#6C5DD3]/5 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
                </div>

                {/* Distraction Sources */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-8">
                    Distraction Sources
                  </h4>
                  <div className="space-y-6">
                    {(analytics?.distractionSources ?? [
                      { label: "Social Media", percentage: 42 },
                      { label: "Notifications", percentage: 28 },
                      { label: "Physical Breaks", percentage: 15 },
                    ]).map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs font-black mb-3 uppercase tracking-tighter">
                          <span className="text-gray-600">{item.label}</span>
                          <span className="text-[#6C5DD3]">{item.percentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-50 rounded-full border border-gray-100">
                          <div
                            className="h-full bg-[#6C5DD3] rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-xl font-bold text-sm text-white z-50 ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ icon, label, value, sub, color, bg }) => (
  <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
    <div className={`w-10 h-10 ${bg} ${color} rounded-2xl flex items-center justify-center mb-5`}>
      {icon}
    </div>
    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <h4 className="text-3xl font-black mt-1 text-[#111827]">{value}</h4>
    <p className="text-[11px] font-bold text-gray-400 mt-2">{sub}</p>
  </div>
);

export default AnalyticsPage;
