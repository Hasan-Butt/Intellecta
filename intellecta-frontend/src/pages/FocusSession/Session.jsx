import React, { useState, useEffect } from "react";
import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/StudentSidebar";
import api from "../../services/api";
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  Settings2,
  ChevronDown,
  ChevronRight,
  Zap,
  CheckCircle2,
  BellOff,
  Lock,
  Moon,
  MousePointer2,
  Network,
  Type,
  X,
} from "lucide-react";

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

const SessionItem = ({ title, subtitle, time, xp, type }) => (
  <div className="flex items-center justify-between p-1 group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
        <MousePointer2 size={18} />
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

const StudySessionDashboard = () => {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("Work");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);

  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);

  const [sessionId, setSessionId] = useState(null);
  const [isBlocked, setIsBlocked] = useState(true);

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  const [recentSessions, setRecentSessions] = useState([]);
  const [level, setLevel] = useState(1);
  const [currentXp, setCurrentXp] = useState(0);
  const [nextLevelXp, setNextLevelXp] = useState(141);
  const [streakDays, setStreakDays] = useState(0);
  const [todayFocusTotal, setTodayFocusTotal] = useState(0);
  const [focusWeek, setFocusWeek] = useState([]);

  const [showDistractionDialog, setShowDistractionDialog] = useState(false);
  const [distractionReason, setDistractionReason] = useState("");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "2";
    const fetchData = async () => {
      try {
        const [dashRes, subjectsRes, sessionsRes] = await Promise.all([
          api.get(`/dashboard/user/${userId}`),
          api.get(`/subjects/user/${userId}`),
          api.get(`/sessions/user/${userId}`),
        ]);

        setLevel(dashRes.data.level ?? 1);
        setCurrentXp(dashRes.data.currentXp ?? 0);
        setNextLevelXp(dashRes.data.nextLevelXp ?? 141);
        setStreakDays(dashRes.data.streakDays ?? 0);
        setTodayFocusTotal(dashRes.data.todayStudyHours ?? 0);
        setFocusWeek(dashRes.data.focusWeek || []);

        setSubjects(subjectsRes.data || []);
        if (subjectsRes.data?.length > 0) {
          setSelectedSubject(subjectsRes.data[0].name);
        }

        setRecentSessions(sessionsRes.data || []);
      } catch (err) {}
    };
    fetchData();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (mode === "Work") {
        setPomodorosCompleted((prev) => prev + 1);
        setMode("Break");
        setTimeLeft(breakDuration * 60);
      } else {
        setMode("Work");
        setTimeLeft(workDuration * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, breakDuration, workDuration]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isBlocked && isActive && mode === "Work") {
        const userId = localStorage.getItem("userId") || "2";
        api
          .post(`/distractions/user/${userId}`, {
            reason: "Tab Switch during Work",
          })
          .catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isBlocked, isActive, mode]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartResume = async () => {
    if (!sessionId) {
      try {
        const userId = localStorage.getItem("userId") || "2";
        const res = await api.post(`/sessions/user/${userId}/start`, {
          subject: selectedSubject || "General",
          deepWork: isBlocked,
        });
        setSessionId(res.data.id);
        setIsActive(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      setIsActive(true);
    }
  };

  const handlePause = () => {
    setIsActive(false);
    setShowDistractionDialog(true);
  };

  const submitDistraction = async () => {
    try {
      const userId = localStorage.getItem("userId") || "2";
      await api.post(`/distractions/user/${userId}`, {
        reason: distractionReason || "Paused Session",
      });
    } catch (err) {}
    setShowDistractionDialog(false);
    setDistractionReason("");
  };

  const skipDistraction = () => {
    setShowDistractionDialog(false);
    setDistractionReason("");
  };

  const handleStop = async () => {
    if (sessionId) {
      try {
        await api.patch(`/sessions/${sessionId}/end`, { pomodorosCompleted });
        const userId = localStorage.getItem("userId") || "2";
        const [dashRes, sessionsRes] = await Promise.all([
          api.get(`/dashboard/user/${userId}`),
          api.get(`/sessions/user/${userId}`),
        ]);
        setLevel(dashRes.data.level ?? 1);
        setCurrentXp(dashRes.data.currentXp ?? 0);
        setNextLevelXp(dashRes.data.nextLevelXp ?? 141);
        setRecentSessions(sessionsRes.data || []);
        setTodayFocusTotal(dashRes.data.todayStudyHours ?? 0);
        setFocusWeek(dashRes.data.focusWeek || []);
      } catch (err) {
        console.error(err);
      }
    }
    setIsActive(false);
    setSessionId(null);
    setPomodorosCompleted(0);
    setMode("Work");
    setTimeLeft(workDuration * 60);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(mode === "Work" ? workDuration * 60 : breakDuration * 60);
  };

  return (
    <div className="min-h-screen bg-[#F9F9FF]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 lg:p-10 overflow-y-auto relative">
          {showDistractionDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative">
                <button
                  onClick={skipDistraction}
                  className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
                <h3 className="text-2xl font-bold font-['Manrope'] mb-2">
                  Session Paused
                </h3>
                <p className="text-slate-500 mb-6 text-sm">
                  What distracted you? Logging this helps you improve focus.
                </p>
                <input
                  type="text"
                  value={distractionReason}
                  onChange={(e) => setDistractionReason(e.target.value)}
                  placeholder="e.g., Phone call, Social media..."
                  className="w-full bg-[#F1F3FF] border-none rounded-2xl p-4 mb-6 focus:ring-2 focus:ring-indigo-600 outline-none"
                  autoFocus
                />
                <button
                  onClick={submitDistraction}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-colors"
                >
                  Log Distraction
                </button>
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto">
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
                  <p className="text-xl font-black italic">{streakDays} Days</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <section className="col-span-12 lg:col-span-7 bg-[#F1F3FF] rounded-[2.5rem] p-8 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 blur-[80px] rounded-full" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 blur-[80px] rounded-full" />

                <div className="z-10 flex flex-col items-center gap-5 w-full">
                  <div
                    className={`${mode === "Work" ? "bg-indigo-600/10 text-indigo-600" : "bg-emerald-600/10 text-emerald-600"} px-4 py-1 rounded-full flex items-center gap-2`}
                  >
                    {isActive && (
                      <div
                        className={`w-2 h-2 rounded-full ${mode === "Work" ? "bg-indigo-600" : "bg-emerald-600"} animate-pulse`}
                      />
                    )}
                    <span className="text-[12px] font-bold tracking-widest uppercase">
                      {mode} Session {isActive ? "Active" : "Paused"}
                    </span>
                  </div>

                  <div className="font-['Manrope'] text-[130px] leading-none font-black tracking-tighter text-[#1E1B4B]">
                    {formatTime(timeLeft)}
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-slate-500 font-bold tracking-[0.2em] uppercase text-sm">
                      {selectedSubject || "General Focus"}
                    </p>
                  </div>

                  <div className="flex items-center gap-8">
                    <button
                      onClick={handleReset}
                      className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-900 hover:scale-105 transition-transform shadow-sm"
                    >
                      <RotateCcw size={24} />
                    </button>
                    <button
                      onClick={isActive ? handlePause : handleStartResume}
                      className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-[0_20px_40px_rgba(69,30,187,0.4)] hover:scale-105 transition-transform"
                    >
                      {isActive ? (
                        <Pause size={32} fill="currentColor" />
                      ) : (
                        <Play size={32} fill="currentColor" className="ml-1" />
                      )}
                    </button>
                    <button
                      onClick={handleStop}
                      className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-900 hover:scale-105 transition-transform shadow-sm"
                    >
                      <Square size={24} fill="currentColor" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex gap-2">
                      {pomodorosCompleted === 0 ? (
                        <div className="w-3 h-3 rounded-full bg-slate-300" />
                      ) : (
                        [...Array(pomodorosCompleted)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full bg-indigo-600`}
                          />
                        ))
                      )}
                    </div>
                    <span className="text-[12px] font-bold text-slate-400 tracking-widest uppercase ml-2">
                      {pomodorosCompleted} Pomodoros
                    </span>
                  </div>
                </div>
              </section>

              <section className="col-span-12 lg:col-span-5 bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <Settings2 className="text-indigo-600" size={20} />
                  <h3 className="text-xl font-bold font-['Manrope']">
                    Configure Session
                  </h3>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3 relative">
                    <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                      Active Subject
                    </label>
                    <div
                      className="bg-[#F1F3FF] p-4 px-6 rounded-3xl flex items-center justify-between cursor-pointer group"
                      onClick={() =>
                        !isActive && setIsDropdownOpen(!isDropdownOpen)
                      }
                    >
                      <span className="font-medium">
                        {selectedSubject || "Select Subject"}
                      </span>
                      <ChevronDown
                        size={18}
                        className="text-slate-400 group-hover:text-slate-900 transition-colors"
                      />
                    </div>
                    {isDropdownOpen && !isActive && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-xl rounded-2xl z-20 overflow-hidden">
                        {subjects.map((s) => (
                          <div
                            key={s.id}
                            className="p-4 hover:bg-[#F1F3FF] cursor-pointer text-sm font-medium transition-colors"
                            onClick={() => {
                              setSelectedSubject(s.name);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {s.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Time Selectors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                        Work Duration
                      </label>
                      <div className="bg-[#F1F3FF] p-2 px-4 rounded-3xl flex items-center gap-2">
                        <input
                          type="number"
                          value={workDuration}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 25;
                            setWorkDuration(val);
                            if (!isActive && mode === "Work")
                              setTimeLeft(val * 60);
                          }}
                          className="bg-transparent text-2xl font-bold leading-none w-16 outline-none text-center"
                          min="1"
                          max="120"
                          disabled={isActive}
                        />
                        <span className="text-xs font-bold text-slate-400 pb-0.5">
                          MIN
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                        Break Time
                      </label>
                      <div className="bg-[#F1F3FF] p-2 px-4 rounded-3xl flex items-center gap-2">
                        <input
                          type="number"
                          value={breakDuration}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 5;
                            setBreakDuration(val);
                            if (!isActive && mode === "Break")
                              setTimeLeft(val * 60);
                          }}
                          className="bg-transparent text-2xl font-bold leading-none w-16 outline-none text-center"
                          min="1"
                          max="60"
                          disabled={isActive}
                        />
                        <span className="text-xs font-bold text-slate-400 pb-0.5">
                          MIN
                        </span>
                      </div>
                    </div>
                  </div>

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

                  <div className="bg-[#E8EEFF] p-3 px-6 rounded-full flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-600" size={18} />
                    <span className="text-sm font-bold text-slate-600">
                      {pomodorosCompleted} Pomodoros Completed
                    </span>
                  </div>
                </div>
              </section>

              <section className="col-span-12 lg:col-span-4 bg-[#E3E8F9] rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[400px]">
                <div className="flex justify-between items-center">
                  <h3 className="font-['Manrope'] font-bold text-lg tracking-tight">
                    Focus Insights
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 tracking-widest uppercase">
                    This Week
                  </span>
                </div>

                <div className="flex items-end justify-between h-40 px-2 mt-4 mb-6">
                  {focusWeek.length > 0 ? (
                    focusWeek.map((day, idx) => {
                      const maxMinutes = Math.max(
                        ...focusWeek.map((d) => d.focusMinutes),
                        1,
                      );
                      const heightPct =
                        day.focusMinutes === 0
                          ? 0
                          : Math.max(12, (day.focusMinutes / maxMinutes) * 100);
                      const isToday = idx === focusWeek.length - 1;
                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center gap-2 group w-8"
                        >
                          <div
                            className={`w-full rounded-t-lg transition-all duration-500 ${isToday ? "bg-indigo-600" : "bg-indigo-400/40"}`}
                            style={{ height: `${heightPct}%` }}
                            title={`${day.focusMinutes} mins`}
                          />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {day.dayLabel}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full flex items-center justify-center text-slate-400 text-sm font-medium h-full">
                      No data yet
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end">
                  <StatCard
                    label="Total Focus"
                    value={`${todayFocusTotal.toFixed(1)}h`}
                  />
                  <StatCard
                    label="Sessions"
                    value={recentSessions.length}
                    color="text-emerald-600"
                  />
                </div>
              </section>

              <section className="col-span-12 lg:col-span-8 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-['Manrope'] font-bold text-lg tracking-tight">
                    Recent Sessions
                  </h3>
                  <button className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase hover:underline">
                    View Archive
                  </button>
                </div>

                <div className="custom-scrollbar space-y-6 max-h-[300px] overflow-y-auto pr-2">
                  {recentSessions.slice(0, 5).map((session) => (
                    <SessionItem
                      key={session.id}
                      title={session.subject}
                      subtitle="Session"
                      time={`${new Date(session.startTime).toLocaleTimeString()} • ${session.durationMinutes} MIN`}
                      xp={(session.pomodorosCompleted || 0) * 50}
                      type={session.deepWork ? "Deep Focus" : "Standard"}
                    />
                  ))}
                  {recentSessions.length === 0 && (
                    <div className="text-center text-slate-500 py-10">
                      No recent sessions found.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <footer className="mt-8 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-3xl p-6 flex items-center gap-8 border border-white">
              <div className="flex items-center gap-4 min-w-[120px]">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-slate-200 flex items-center justify-center text-sm font-black italic">
                  Lvl {level}
                </div>
                <div>
                  <p className="text-sm font-bold">
                    Progress to Level {level + 1}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Collect{" "}
                    <span className="text-indigo-600 font-bold">
                      {Math.max(0, nextLevelXp - currentXp).toLocaleString()}{" "}
                      more XP
                    </span>{" "}
                    to reach the next level.
                  </p>
                </div>
              </div>
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.4)] transition-all duration-700"
                  style={{
                    width: `${Math.min(100, nextLevelXp > 0 ? (currentXp / nextLevelXp) * 100 : 0)}%`,
                  }}
                />
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

export default StudySessionDashboard;
