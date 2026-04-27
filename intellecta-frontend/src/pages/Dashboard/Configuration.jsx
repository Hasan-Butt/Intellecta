import React, { useState } from "react";
import {
  Zap,
  Trophy,
  Shield,
  CheckCircle2,
  XCircle,
  Plus,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

// Standard Dashboard Components
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import intellectaLogo from "../../assets/intellectaLogo.jpeg";

const ConfigurationPage = () => {
  const [activeTab, setActiveTab] = useState("Configuration");
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar intellectaLogo={intellectaLogo} />

      <div className="flex min-h-screen bg-[#F9FAFB] font-inter text-[#111827]">
        {/* 5. Sidebar with logic props */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-10 space-y-10 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto space-y-10">
            {/* Header */}
            <div className="mb-10">
              <h2 className="text-4xl font-black tracking-tight text-[#111827]">
                Global Configuration
              </h2>
              <p className="text-gray-400 font-bold mt-2">
                Manage core behavioral parameters for the Intellecta ecosystem,
                from AI focus sensitivity to application governance.
              </p>
            </div>

            <div className="grid grid-cols-12 gap-8">
              {/* Focus Intensity Weights - Sliders Section */}
              <div className="col-span-12 lg:col-span-8 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-10">
                  <div className="bg-[#E3E0F7] p-3 rounded-2xl text-[#6C5DD3]">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#111827]">
                      Focus Intensity Weights
                    </h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                      Calibrate how system actions impact user focus scores.
                    </p>
                  </div>
                </div>

                <div className="space-y-12">
                  <ConfigSlider
                    label="Deep Work Multiplier"
                    value="2.4x"
                    min="Standard"
                    max="Extreme"
                  />
                  <ConfigSlider
                    label="Context Switch Penalty"
                    value="-0.8"
                    min="Minimal"
                    max="Severe"
                    color="bg-red-500"
                  />
                  <ConfigSlider
                    label="Idle Decay Rate"
                    value="Low"
                    min="Static"
                    max="Aggressive"
                  />
                </div>
              </div>

              {/* Leaderboard Intervals - Purple Card */}
              <div className="col-span-12 lg:col-span-4 bg-[#6C5DD3] p-10 rounded-[40px] text-white shadow-2xl shadow-indigo-100 flex flex-col justify-between">
                <div>
                  <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-8 text-white">
                    <Trophy size={24} />
                  </div>
                  <h3 className="text-2xl font-black mb-4">
                    Leaderboard Intervals
                  </h3>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed opacity-80">
                    Define the cadence for system-wide competitive reset cycles
                    and reward distribution.
                  </p>
                </div>

                <div className="space-y-4 mt-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-70">
                      Global Reset Cycle
                    </label>
                    <div className="bg-white/10 border border-white/20 p-4 rounded-2xl flex justify-between items-center cursor-pointer">
                      <span className="text-sm font-bold">
                        Bi-Weekly (Fortnightly)
                      </span>
                      <ChevronDown size={18} />
                    </div>
                  </div>

                  <div className="bg-white/10 border border-white/20 p-6 rounded-3xl">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">
                      Next Sync Window
                    </p>
                    <p className="text-3xl font-black">Oct 14, 04:00</p>
                  </div>

                  <button className="w-full bg-white text-[#6C5DD3] py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all active:scale-95">
                    <RefreshCw size={16} strokeWidth={3} /> Manual Force Reset
                  </button>
                </div>
              </div>

              {/* Application Governance Section */}
              <div className="col-span-12 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-500">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black">
                        Application Governance
                      </h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                        Whitelisted applications bypass focus filters;
                        Blacklisted ones trigger notifications.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-6 py-3 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase border border-gray-100 hover:bg-gray-100 transition-colors">
                      Export Rules
                    </button>
                    <button className="px-6 py-3 bg-[#6C5DD3] text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-indigo-100 hover:scale-105 transition-transform">
                      <Plus size={14} strokeWidth={4} /> Add New Rule
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <AppList
                    title="Global Whitelist"
                    icon={
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    }
                    apps={[
                      "Visual Studio Code",
                      "Notion Desktop",
                      "Slack (Huddles)",
                    ]}
                  />
                  <AppList
                    title="Global Blacklist"
                    icon={<XCircle size={16} className="text-red-500" />}
                    apps={[
                      "Steam Client",
                      "Instagram Web",
                      "Reddit (All Subdomains)",
                    ]}
                  />
                </div>
              </div>

              {/* Bottom Section - Moderator Bar & Final Actions */}
              <div className="col-span-12 space-y-12">
                {/* Moderator Status Card */}
                <div className="bg-white p-8 rounded-[35px] border border-gray-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className="flex -space-x-3">
                      <img
                        className="w-12 h-12 rounded-full border-4 border-white bg-gray-200 object-cover shadow-sm"
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                        alt="User 1"
                      />
                      <img
                        className="w-12 h-12 rounded-full border-4 border-white bg-gray-200 object-cover shadow-sm"
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                        alt="User 2"
                      />
                      <img
                        className="w-12 h-12 rounded-full border-4 border-white bg-gray-200 object-cover shadow-sm"
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
                        alt="User 3"
                      />
                      <div className="w-12 h-12 rounded-full border-4 border-white bg-[#F3F4F6] flex items-center justify-center text-[11px] font-black text-gray-500 shadow-sm">
                        +14
                      </div>
                    </div>
                    <div>
                      <h4 className="text-base font-black text-[#111827]">
                        17 System Moderators Active
                      </h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                        WATCHING 1.2K LIVE NODES
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-tight">
                      System Integrity 99.8%
                    </p>
                    <div className="w-56 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: "99.8%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex justify-end items-center gap-10 pr-4">
                  <button className="text-base font-black text-gray-500 hover:text-[#111827] transition-colors">
                    Discard Changes
                  </button>
                  <button className="bg-[#6C5DD3] text-white px-12 py-5 rounded-[22px] font-black text-base shadow-2xl shadow-indigo-200 hover:scale-[1.02] hover:bg-[#5a4db3] transition-all active:scale-95">
                    Deploy Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Sub-components
const ConfigSlider = ({ label, value, min, max, color = "bg-[#6C5DD3]" }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <span className="text-base font-black text-[#111827]">{label}</span>
      <span
        className={`${color === "bg-red-500" ? "bg-red-50 text-red-500" : "bg-indigo-50 text-[#6C5DD3]"} px-4 py-1.5 rounded-xl text-xs font-black`}
      >
        {value}
      </span>
    </div>
    <div className="relative h-2 bg-gray-100 rounded-full">
      <div
        className={`absolute top-1/2 left-1/3 -translate-y-1/2 w-6 h-6 ${color} rounded-full border-4 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform`}
      ></div>
      <div
        className={`absolute left-0 top-0 h-full ${color} rounded-full opacity-20`}
        style={{ width: "35%" }}
      ></div>
    </div>
    <div className="flex justify-between text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

const AppList = ({ title, icon, apps }) => (
  <div className="bg-gray-50/50 p-6 rounded-[32px] border border-gray-100">
    <div className="flex items-center gap-2 mb-6">
      {icon}
      <span className="text-xs font-black uppercase tracking-widest text-gray-500">
        {title}
      </span>
    </div>
    <div className="flex flex-wrap gap-2">
      {apps.map((app) => (
        <div
          key={app}
          className="bg-white px-4 py-2.5 rounded-xl border border-gray-100 text-xs font-bold text-[#111827] flex items-center gap-3 shadow-sm hover:border-[#6C5DD3]/30 transition-all cursor-default"
        >
          {app}{" "}
          <span className="text-gray-300 cursor-pointer hover:text-red-500 transition-colors text-base leading-none">
            ×
          </span>
        </div>
      ))}
      <div className="px-4 py-2.5 rounded-xl border border-dashed border-gray-200 text-xs font-bold text-gray-300 cursor-text hover:border-gray-300 transition-colors">
        Type to add...
      </div>
    </div>
  </div>
);

export default ConfigurationPage;
