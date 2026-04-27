import React, { useState } from "react";
import {
  Download,
  RefreshCw,
  ShieldCheck,
  //Zap,
  //BarChart3,
  //Clock,
  Activity,
} from "lucide-react";

// Correct Paths
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import intellectaLogo from "../../assets/intellectaLogo.jpeg";

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState("Analytics");
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* 4. Pass the logo prop just like in Dashboard */}
      <Navbar intellectaLogo={intellectaLogo} />

      <div className="flex min-h-screen bg-[#F9FAFB] font-inter text-[#111827]">
        {/* 5. Pass activeTab and setActiveTab props to the Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-10 space-y-10 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto space-y-10">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-4xl font-black tracking-tight text-[#111827]">
                  System Analytics
                </h2>
                <p className="text-gray-400 font-bold mt-2 uppercase text-[11px] tracking-widest">
                  Real-time monitoring of session health and cognitive load.
                </p>
              </div>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-black text-[#6C5DD3] hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                  <Download size={18} strokeWidth={3} /> Export Report
                </button>
                <button className="flex items-center gap-2 px-6 py-4 bg-[#6C5DD3] text-white rounded-2xl text-xs font-black hover:bg-[#5a4db3] shadow-xl shadow-indigo-100 transition-all active:scale-95">
                  <RefreshCw size={18} strokeWidth={3} /> Live Update
                </button>
              </div>
            </div>

            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-12 gap-8">
              {/* Focus Card */}
              <div className="col-span-12 lg:col-span-5 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                      Active User Focus
                    </p>
                    <h3 className="text-6xl font-black mt-4 tracking-tighter text-[#111827]">
                      87.4%
                    </h3>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-[11px] font-black px-3 py-1 rounded-xl border border-emerald-100">
                    +1.2%
                  </span>
                </div>
                <div className="flex items-end gap-2 h-32 mb-6">
                  {[35, 45, 60, 40, 85, 50, 40, 35, 60, 80].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-lg transition-all duration-500 ${h > 70 ? "bg-[#6C5DD3]" : "bg-[#E3E0F7] hover:bg-[#d0ccf0]"}`}
                      style={{ height: `${h}%` }}
                    ></div>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">
                  Based on 1,240 concurrent learning sessions.
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
                      3.2
                    </h3>
                    <span className="text-gray-300 text-xl font-bold uppercase">
                      /hr
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-red-500 mt-10">
                  <Activity size={24} />
                  <p className="text-[11px] font-black leading-tight uppercase tracking-widest">
                    Decreasing Trend
                  </p>
                </div>
              </div>

              {/* System Load Card */}
              <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  System Load
                </p>
                <h3 className="text-6xl font-black mt-6 tracking-tighter text-[#111827]">
                  12%
                </h3>
                <div className="mt-10 h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: "12%" }}
                  ></div>
                </div>
                <p className="text-[11px] text-gray-400 mt-6 font-black uppercase tracking-[0.2em]">
                  All Nodes Healthy
                </p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
              {/* Audit Logs */}
              <div className="col-span-12 lg:col-span-8 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 flex justify-between items-center border-b border-gray-50">
                  <h4 className="text-2xl font-black text-[#111827]">
                    Session Audit Logs
                  </h4>
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
                      {[
                        {
                          time: "14:23:01",
                          user: "u_88219",
                          event: "Session Init",
                          status: "SUCCESS",
                          color: "bg-emerald-500",
                        },
                        {
                          time: "14:22:58",
                          user: "u_sarah_d",
                          event: "Auth Failure",
                          status: "BLOCKED",
                          color: "bg-red-500",
                        },
                        {
                          time: "14:21:44",
                          user: "u_intel_04",
                          event: "Focus Log",
                          status: "LOGGED",
                          color: "bg-gray-400",
                        },
                        {
                          time: "14:19:30",
                          user: "u_k8s_92",
                          event: "Threshold",
                          status: "SUCCESS",
                          color: "bg-emerald-500",
                        },
                      ].map((row, i) => (
                        <tr
                          key={i}
                          className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-8 py-6 text-gray-400 font-mono">
                            {row.time}
                          </td>
                          <td className="px-8 py-6 text-[#111827] font-black">
                            {row.user}
                          </td>
                          <td className="px-8 py-6">{row.event}</td>
                          <td className="px-8 py-6 text-right">
                            <span
                              className={`${row.color} text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* System Integrity Side Card */}
              <div className="col-span-12 lg:col-span-4 space-y-8">
                <div className="bg-[#111827] p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="bg-emerald-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-8">
                      <ShieldCheck size={28} className="text-emerald-400" />
                    </div>
                    <h4 className="text-3xl font-black leading-tight">
                      System Integrity 100%
                    </h4>
                    <p className="text-sm text-gray-400 mt-4 font-bold leading-relaxed">
                      All cognitive edge nodes are synchronized. No latency
                      detected in adaptive quiz engines.
                    </p>
                    <button className="mt-10 w-full py-5 bg-[#6C5DD3] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#5a4db3] transition-all">
                      Execute Diagnostics
                    </button>
                  </div>
                  {/* Decorative circle */}
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#6C5DD3]/10 rounded-full blur-3xl group-hover:scale-125 transition-transform"></div>
                </div>

                {/* Progress Card */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-8">
                    Distraction Sources
                  </h4>
                  <div className="space-y-6">
                    {[
                      { label: "Social Media", value: 42 },
                      { label: "Ambient Noise", value: 28 },
                      { label: "Notifications", value: 15 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs font-black mb-3 uppercase tracking-tighter">
                          <span className="text-gray-600">{item.label}</span>
                          <span className="text-[#6C5DD3]">{item.value}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-50 rounded-full border border-gray-100">
                          <div
                            className="h-full bg-[#6C5DD3] rounded-full"
                            style={{ width: `${item.value}%` }}
                          ></div>
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
    </div>
  );
};

export default AnalyticsPage;
