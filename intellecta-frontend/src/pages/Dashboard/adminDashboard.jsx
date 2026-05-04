import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Brain,
  Zap,
  Calendar,
  AlertTriangle,
  Tablet,
  ShieldCheck,
  RefreshCw,
  X,
} from "lucide-react";

import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import intellectaLogo from "../../assets/intellectaLogo.jpeg";
import api from "../../services/api";

// Map backend iconType string → Lucide component
const ICON_MAP = {
  ANOMALY: AlertTriangle,
  PERFORMANCE: Tablet,
  SECURITY: ShieldCheck,
};

// Map backend alertType → Tailwind color classes
const ALERT_COLORS = {
  CRITICAL: {
    color: "text-red-500",
    bgColor: "bg-red-50",
    badgeColor: "bg-red-500",
  },
  WARNING: {
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    badgeColor: "bg-gray-400",
  },
  RESOLVED: {
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    badgeColor: "bg-emerald-500",
  },
};

const formatLastUpdated = (date) => {
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `Today, ${months[date.getMonth()]} ${date.getDate()}, ${h12}:${m} ${ampm}`;
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/dashboard");
      setDashboardData(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      await api.delete(`/admin/alerts/${alertId}`);
      setDashboardData((prev) => ({
        ...prev,
        alerts: prev.alerts.filter((a) => a.id !== alertId),
      }));
    } catch (err) {
      console.error("Failed to dismiss alert:", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Normalise weekly velocity (raw minutes) to bar-height percentages (0–100)
  const weeklyVelocityPct = (() => {
    const raw = dashboardData?.weeklyVelocity ?? [55, 68, 40, 92, 60, 35, 30];
    const max = Math.max(...raw, 1);
    return raw.map((v) => Math.round((v / max) * 100));
  })();

  const heatmapCells = dashboardData?.peakStudyTimes ?? [
    0, 0, 1, 2, 2, 0, 1, 2, 3, 4, 2, 1, 2, 3, 4, 3, 1, 1, 2, 3, 2, 0, 0, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];

  const alerts = (dashboardData?.alerts ?? []).map((a) => ({
    ...a,
    icon: ICON_MAP[a.iconType] ?? AlertTriangle,
    ...(ALERT_COLORS[a.alertType] ?? ALERT_COLORS.WARNING),
  }));

  const activeEngagement = dashboardData?.activeEngagement ?? 0;
  const engagementTrend = dashboardData?.engagementTrend ?? 0;
  const avgFocusScore = dashboardData?.avgFocusScore ?? 0;
  const concurrentSessions = dashboardData?.concurrentSessions ?? 0;

  return (
    <div className="flex-1 flex flex-col">
      <Navbar intellectaLogo={intellectaLogo} />

      <div className="flex min-h-screen bg-[#F9FAFB] font-inter">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="p-10 space-y-10">
          <div className="max-w-[1400px] mx-auto space-y-10">
            {/* PLATFORM OVERVIEW SECTION */}
            <section>
              <div className="mb-8">
                <h2 className="text-4xl font-black text-[#111827] tracking-tight">
                  Platform Overview
                </h2>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 text-gray-400 font-bold uppercase text-[11px] tracking-widest">
                    <Calendar size={14} className="text-[#6C5DD3]" />
                    <span>Last Update: {formatLastUpdated(lastUpdated)}</span>
                  </div>

                  <button
                    onClick={fetchDashboard}
                    disabled={loading}
                    className="flex items-center gap-2 text-[11px] font-bold text-[#6C5DD3] uppercase tracking-widest hover:opacity-70 transition-opacity disabled:opacity-40"
                  >
                    <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                    {loading ? "Refreshing…" : "Refresh"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Engagement */}
                <div className="bg-[#6C5DD3] rounded-[40px] p-10 text-white shadow-2xl shadow-indigo-100">
                  <p className="text-[12px] font-bold uppercase tracking-[0.2em] opacity-80">
                    Active Engagement
                  </p>

                  <h3 className="text-7xl font-black mt-6 tracking-tighter">
                    {loading ? (
                      <span className="opacity-40">—</span>
                    ) : (
                      activeEngagement.toLocaleString()
                    )}
                  </h3>

                  <div className="mt-10 flex items-center gap-4">
                    <div className="bg-[#34D399] text-[#064E3B] px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
                      <TrendingUp size={16} strokeWidth={3} />
                      <span className="text-sm font-black">{engagementTrend}%</span>
                    </div>
                  </div>
                </div>

                {/* Avg Focus Score */}
                <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-400">
                        Avg Focus Score
                      </p>

                      <div className="flex items-baseline gap-2 mt-6">
                        <h3 className="text-6xl font-black text-[#111827]">
                          {loading ? (
                            <span className="text-gray-300">—</span>
                          ) : (
                            avgFocusScore.toFixed(1)
                          )}
                        </h3>
                        <span className="text-2xl font-bold text-gray-300">/ 10</span>
                      </div>
                    </div>

                    <div className="bg-[#F5F6FF] p-4 rounded-3xl text-[#6C5DD3]">
                      <Brain size={32} />
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, avgFocusScore * 10)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Concurrent Sessions */}
                <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="bg-gray-50 p-6 rounded-full mb-8 border border-gray-100">
                    <Zap
                      size={40}
                      className="text-gray-100 stroke-gray-500 fill-gray-100"
                      strokeWidth={1.5}
                    />
                  </div>

                  <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    Concurrent Sessions
                  </p>

                  <h3 className="text-6xl font-black text-[#111827] mt-2">
                    {loading ? (
                      <span className="text-gray-300">—</span>
                    ) : (
                      concurrentSessions.toLocaleString()
                    )}
                  </h3>
                </div>
              </div>
            </section>

            {/* CHARTS SECTION */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Weekly Study Velocity */}
              <div className="lg:col-span-8 bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-black text-[#111827] mb-12">
                  Weekly Study Velocity
                </h3>

                <div className="relative flex items-end justify-between h-64 w-full px-2">
                  {weeklyVelocityPct.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center mx-2 justify-end group"
                    >
                      <div
                        className={`w-full rounded-md transition-all duration-500 ${
                          h === Math.max(...weeklyVelocityPct)
                            ? "bg-[#6C5DD3]"
                            : "bg-[#E3E0F7]"
                        }`}
                        style={{ height: `${Math.max(h, 4)}%` }}
                      />
                      <span className="text-[11px] font-black mt-4 text-gray-400 uppercase tracking-tighter">
                        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"][i]}
                      </span>
                    </div>
                  ))}
                </div>

                {dashboardData?.weeklyVelocity?.every((v) => v === 0) && (
                  <p className="text-center text-sm text-gray-400 font-bold mt-4">
                    No study sessions recorded this week yet.
                  </p>
                )}
              </div>

              {/* Peak Study Times Heatmap */}
              <div className="lg:col-span-4 bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm flex flex-col">
                <h3 className="text-2xl font-black text-[#111827] mb-8">
                  Peak Study Times
                </h3>

                <div className="grid grid-cols-6 gap-2 flex-1">
                  {heatmapCells.map((val, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-md ${
                        val === 0
                          ? "bg-gray-100"
                          : val === 1
                          ? "bg-[#6C5DD3]/20"
                          : val === 2
                          ? "bg-[#6C5DD3]/40"
                          : val === 3
                          ? "bg-[#6C5DD3]/70"
                          : "bg-[#6C5DD3]"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {["0h", "4h", "8h", "12h", "16h", "20h"].map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              </div>
            </section>

            {/* ALERTS SECTION */}
            <section className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-black text-[#111827] mb-10">
                Flagging &amp; Alerts
              </h3>

              {loading ? (
                <p className="text-sm font-bold text-gray-400 text-center py-8">
                  Loading alerts…
                </p>
              ) : alerts.length === 0 ? (
                <p className="text-sm font-bold text-gray-400 text-center py-8">
                  No alerts at this time.
                </p>
              ) : (
                <div className="space-y-6">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between border-b border-gray-50 pb-6 last:border-0"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`${alert.bgColor} ${alert.color} p-4 rounded-2xl`}>
                          <alert.icon size={24} />
                        </div>

                        <div>
                          <h4 className="text-base font-black text-[#111827]">
                            {alert.title}
                          </h4>
                          <p className="text-sm font-bold text-gray-400">
                            {alert.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <span
                          className={`${alert.badgeColor} text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest`}
                        >
                          {alert.alertType}
                        </span>
                        <span className="text-sm font-bold text-gray-400 min-w-[80px] text-right">
                          {alert.time}
                        </span>
                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          title="Dismiss alert"
                          className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
