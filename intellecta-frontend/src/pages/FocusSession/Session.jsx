import React, { useState, useEffect } from "react";
import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/StudentSidebar";
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  Settings2,
  ChevronDown,
  ChevronRight,
  Search,
  Zap,
  CheckCircle2,
  BellOff,
  Lock,
  Moon,
  MousePointer2,
  Type,
  Network,
} from "lucide-react";

// --- Sub-Components ---

const StatCard = ({ label, value, subtext, color = "text-slate-900" }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
      {label}
    </span>
    <span className={`text-2xl font-black ${color}`}>{value}</span>
    {subtext && (
      <span className="text-xs font-medium text-slate-400">{subtext}</span>
    )}
  </div>
);

const SessionItem = ({ icon: Icon, title, subtitle, time, xp, type }) => (
  <div className="flex items-center justify-between p-1 group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
        <Icon size={18} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-900">
          {title}:{" "}
          <span className="font-medium text-slate-500">{subtitle}</span>
        </h4>
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
          {time}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="text-right">
        <span className="block text-sm font-bold text-indigo-600">
          +{xp} XP
        </span>
        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
          {type}
        </span>
      </div>
      <ChevronRight
        size={16}
        className="text-slate-300 group-hover:text-slate-600 transition-colors"
      />
    </div>
  </div>
);

// --- Main Component ---

const StudeySessionDashboard = () => {
  const [isActive, setIsActive] = useState(true);
  const [isBlocked, setIsBlocked] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1498); // 24:58 in seconds

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#F9F9FF]">
      {/*Navbar*/}
      <Navbar />

      <div className="flex flex-1">
        {/*Sidebar*/}
        <Sidebar />
        <main className="flex-1 lg:p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="flex justify-between items-end mb-10">
              <div className="space-y-2">
                <h2 className="font-[sans-serif] font-extrabold text-5xl tracking-tight">
                  Focus Session.
                </h2>
                <p className="text-slate-500 max-w-md leading-relaxed">
                  Design your cognitive environment. The Sanctuary aligns your
                  energy with your objectives.
                </p>
              </div>
              <div className="bg-[#E8EEFF] rounded-3xl p-4 flex items-center gap-4 px-6">
                <div className="w-10 h-10 rounded-full bg-[#FFDFA0] flex items-center justify-center">
                  <Zap
                    size={20}
                    fill="currentColor"
                    className="text-amber-900"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                    Current Streak
                  </p>
                  <p className="text-xl font-black italic">12 Days</p>
                </div>
              </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-12 gap-6">
              {/* Core Timer Area (Left - 7 Cols) */}
              <section className="col-span-12 lg:col-span-7 bg-[#F1F3FF] rounded-[2.5rem] p-8 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Decorative Blurs */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 blur-[80px] rounded-full" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 blur-[80px] rounded-full" />

                <div className="z-10 flex flex-col items-center gap-5 w-full">
                  <div className="bg-indigo-600/10 text-indigo-600 px-4 py-1 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    <span className="text-[12px] font-bold tracking-widest uppercase">
                      Work Session Active
                    </span>
                  </div>

                  <div className="font-['Manrope'] text-[130px] leading-none font-black tracking-tighter text-[#1E1B4B]">
                    {formatTime(timeLeft)}
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-slate-500 font-bold tracking-[0.2em] uppercase text-sm">
                      Deep Focus: Architectural History
                    </p>
                  </div>

                  <div className="flex items-center gap-8">
                    <button className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-900 hover:scale-105 transition-transform shadow-sm">
                      <RotateCcw size={24} />
                    </button>
                    <button
                      onClick={() => setIsActive(!isActive)}
                      className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-[0_20px_40px_rgba(69,30,187,0.4)] hover:scale-105 transition-transform"
                    >
                      {isActive ? (
                        <Pause size={32} fill="currentColor" />
                      ) : (
                        <Play size={32} fill="currentColor" className="ml-1" />
                      )}
                    </button>
                    <button className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-900 hover:scale-105 transition-transform shadow-sm">
                      <Square size={24} fill="currentColor" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-600" />
                      <div className="w-3 h-3 rounded-full bg-indigo-600" />
                      <div className="w-3 h-3 rounded-full bg-indigo-600" />
                      <div className="w-3 h-3 rounded-full bg-slate-300" />
                    </div>
                    <span className="text-[12px] font-bold text-slate-400 tracking-widest uppercase ml-2">
                      3/4 Pomodoros
                    </span>
                  </div>
                </div>
              </section>

              {/* Session Configuration (Right - 5 Cols) */}
              <section className="col-span-12 lg:col-span-5 bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <Settings2 className="text-indigo-600" size={20} />
                  <h3 className="text-xl font-bold font-['Manrope']">
                    Configure Session
                  </h3>
                </div>

                <div className="space-y-8">
                  {/* Subject Select */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                      Active Subject
                    </label>
                    <div className="bg-[#F1F3FF] p-4 px-6 rounded-3xl flex items-center justify-between cursor-pointer group">
                      <span className="font-medium">Architectural History</span>
                      <ChevronDown
                        size={18}
                        className="text-slate-400 group-hover:text-slate-900 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Time Selectors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                        Work Duration
                      </label>
                      <div className="bg-[#F1F3FF] p-4 px-6 rounded-3xl flex items-end gap-2">
                        <span className="text-2xl font-bold leading-none">
                          25
                        </span>
                        <span className="text-xs font-bold text-slate-400 pb-0.5">
                          MIN
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                        Break Time
                      </label>
                      <div className="bg-[#F1F3FF] p-4 px-6 rounded-3xl flex items-end gap-2">
                        <span className="text-2xl font-bold leading-none">
                          05
                        </span>
                        <span className="text-xs font-bold text-slate-400 pb-0.5">
                          MIN
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="bg-indigo-600/5 p-5 px-6 rounded-[2rem] flex items-center justify-between border border-indigo-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                        <BellOff size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">
                          Distraction Blocker
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Mute Notifications & Tabs
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsBlocked(!isBlocked)}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${isBlocked ? "bg-indigo-600" : "bg-slate-300"}`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${isBlocked ? "left-7" : "left-1"}`}
                      />
                    </button>
                  </div>

                  {/* Progress Footer */}
                  <div className="bg-[#E8EEFF] p-3 px-6 rounded-full flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-600" size={18} />
                    <span className="text-sm font-bold text-slate-600">
                      3/4 Pomodoros Completed
                    </span>
                  </div>
                </div>
              </section>

              {/* Insights (Bottom Left - 4 Cols) */}
              <section className="col-span-12 lg:col-span-4 bg-[#E3E8F9] rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[400px]">
                <div className="flex justify-between items-center">
                  <h3 className="font-['Manrope'] font-bold text-lg tracking-tight">
                    Focus Insights
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 tracking-widest uppercase">
                    Today
                  </span>
                </div>

                {/* Visual Chart Placeholder */}
                <div className="flex items-end justify-between h-40 px-2">
                  <div className="w-8 bg-indigo-400/40 rounded-t-lg h-[40%]" />
                  <div className="w-8 bg-indigo-400/40 rounded-t-lg h-[60%]" />
                  <div className="w-8 bg-indigo-600 rounded-t-lg h-[90%]" />
                  <div className="w-8 bg-indigo-400/40 rounded-t-lg h-[50%]" />
                </div>

                <div className="flex justify-between items-end">
                  <StatCard label="Total Focus" value="6.4h" />
                  <StatCard
                    label="vs Yesterday"
                    value="+12%"
                    color="text-emerald-600"
                  />
                </div>
              </section>

              {/* Recent Sessions (Bottom Right - 8 Cols) */}
              <section className="col-span-12 lg:col-span-8 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-['Manrope'] font-bold text-lg tracking-tight">
                    Recent Sessions
                  </h3>
                  <button className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase hover:underline">
                    View Archive
                  </button>
                </div>

                <div className="space-y-6">
                  <SessionItem
                    icon={MousePointer2}
                    title="Architectural History"
                    subtitle="Modernism"
                    time="10:15 AM • 50 MIN"
                    xp="150"
                    type="Perfect Flow"
                  />
                  <SessionItem
                    icon={Network}
                    title="Neural Networks"
                    subtitle="Backprop"
                    time="08:30 AM • 25 MIN"
                    xp="75"
                    type="Standard"
                  />
                  <SessionItem
                    icon={Type}
                    title="Advanced Typography"
                    subtitle="Kerning"
                    time="Yesterday • 120 MIN"
                    xp="300"
                    type="Marathon"
                  />
                </div>
              </section>
            </div>

            {/* Footer Progress Bar */}
            <footer className="mt-8 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-3xl p-6 flex items-center gap-8 border border-white">
              <div className="flex items-center gap-4 min-w-[120px]">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-slate-200 flex items-center justify-center text-sm font-black italic">
                  Lvl 24
                </div>
                <div>
                  <p className="text-sm font-bold">Progress to Level 25</p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Collect{" "}
                    <span className="text-indigo-600 font-bold">
                      450 more XP
                    </span>{" "}
                    to unlock the 'Deep Thinker' badge.
                  </p>
                </div>
              </div>
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.4)]" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm cursor-pointer">
                  <Moon size={18} fill="currentColor" />
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-sm cursor-pointer">
                  <CheckCircle2 size={18} />
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 shadow-inner cursor-not-allowed">
                  <Lock size={18} />
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudeySessionDashboard;
