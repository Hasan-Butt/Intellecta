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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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

  // Map weekly velocity to bar chart data
  const weeklyVelocityData = (() => {
    const raw = dashboardData?.weeklyVelocity ?? [];
    if (!raw.length) return [];
    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
      result.push({ name: dayName, minutes: raw[i] });
    }
    return result;
  })();

  const heatmapCells = dashboardData?.peakStudyTimes ?? Array(42).fill(0);
  
  // Transform flat array [dayIndex * 6 + slotIndex] to grid cells row by row
  // CSS Grid flows row by row. We want 7 columns (days) and 6 rows (time slots).
  const heatmapGrid = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 7; c++) {
      heatmapGrid.push(heatmapCells[c * 6 + r] || 0);
    }
  }

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

                <div className="h-64 w-full mt-4">
                  {!dashboardData ? (
                    <div className="h-full flex items-center justify-center text-sm font-bold text-gray-400">Loading...</div>
                  ) : dashboardData.weeklyVelocity?.every((v) => v === 0) ? (
                    <div className="h-full flex items-center justify-center text-sm font-bold text-gray-400">No data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyVelocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#9CA3AF' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#9CA3AF' }} />
                        <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="minutes" fill="#6C5DD3" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Peak Study Times Heatmap */}
              <div className="lg:col-span-4 bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm flex flex-col">
                <h3 className="text-2xl font-black text-[#111827] mb-8">
                  Peak Study Times
                </h3>

                <div className="flex flex-col flex-1 mt-4">
                  {!dashboardData ? (
                    <div className="h-full flex items-center justify-center text-sm font-bold text-gray-400">Loading...</div>
                  ) : (
                    <>
                      <div className="flex justify-between mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-[40px]">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
                          <span key={label} className="flex-1 text-center">{label}</span>
                        ))}
                      </div>
                      <div className="flex flex-1 gap-2">
                        <div className="flex flex-col justify-between py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-[32px] text-right">
                          {["00-04", "04-08", "08-12", "12-16", "16-20", "20-24"].map((label) => (
                            <span key={label}>{label}</span>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 grid-rows-6 gap-2 flex-1">
                          {heatmapGrid.map((val, i) => (
                            <div
                              key={i}
                              className={`rounded-md ${
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
                      </div>
                    </>
                  )}
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
