import React, { useState, useEffect } from "react";
import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/StudentSidebar";
import api from "../../services/api";
import { getUserId } from "../../utils/auth";
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
  MousePointer2,
  X,
  ListTodo,
  Plus,
  Trash2,
  Star,
  Focus,
  Sparkles,
} from "lucide-react";
import Avatar from "../../components/common/Avatar";
import LofiPlayer from "../../components/LofiPlayer";
import Swal from "sweetalert2";

const ZEN_THEMES = [
  { id: "default", name: "Deep Void (Default)", image: null },
  { id: "nature", name: "Nature Retreat", image: "/themes/theme1.jpeg" },
  { id: "lofi", name: "Focus Flow", image: "/themes/theme2.png" },
  { id: "space", name: "Deep Forest", image: "/themes/theme3.jpeg" },
  { id: "space3", name: "Fantasy World", image: "/themes/newtheme1.png" },
  { id: "space4", name: "Starlight", image: "/themes/newtheme2.png" },
  { id: "space5", name: "Sparkling Sunshine", image: "/themes/newtheme3.png" },
];

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
  const [isBlocked, setIsBlocked] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState([]);

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  const [recentSessions, setRecentSessions] = useState([]);
  const [level, setLevel] = useState(1);
  const [currentXp, setCurrentXp] = useState(0);
  const [nextLevelXp, setNextLevelXp] = useState(141);
  const [xpProgressPct, setXpProgressPct] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [todayFocusTotal, setTodayFocusTotal] = useState(0);
  const [focusWeek, setFocusWeek] = useState([]);

  const [showDistractionDialog, setShowDistractionDialog] = useState(false);
  const [distractionReason, setDistractionReason] = useState("");
  const [pauseStartTime, setPauseStartTime] = useState(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ level: 1, title: "Scholar" });
  const [showArchive, setShowArchive] = useState(false);
  const [lastSessionStats, setLastSessionStats] = useState(null);
  const [userAvatar, setUserAvatar] = useState("");
  const [userName, setUserName] = useState("");

  const [ambientMode, setAmbientMode] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);

  const [activeThemeId, setActiveThemeId] = useState("default");

  useEffect(() => {
    let timer;
    if (showAchievementModal && earnedBadges.length > 0) {
      // 5 seconds delay per badge, except if we are on the last badge (then wait indefinitely or auto close, but let's wait indefinitely so they can click "Awesome!")
      if (currentAchievementIndex < earnedBadges.length - 1) {
        timer = setTimeout(() => {
          setCurrentAchievementIndex(prev => prev + 1);
        }, 5000);
      }
    }
    return () => clearTimeout(timer);
  }, [showAchievementModal, currentAchievementIndex, earnedBadges]);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;
    const fetchData = async () => {
      try {

        const results = await Promise.allSettled([
          api.get(`/dashboard/user/${userId}`),
          api.get(`/subjects/user/${userId}`),
          api.get(`/sessions/user/${userId}`),
          api.get(`/courses/user/${userId}`),
          api.get(`/users/${userId}/profile`),
        ]);
        
        const [dashRes, subjectsRes, sessionsRes, coursesRes, profileRes] = results;

        if (profileRes.status === 'fulfilled') {
          setUserAvatar(profileRes.value.data.avatarUrl || "");
          setUserName(profileRes.value.data.username || "Scholar");
        } else {
          setUserAvatar("");
          setUserName("Scholar");
        }

        if (dashRes.status === 'fulfilled') {
          setLevel(dashRes.value.data.level ?? 1);
          setCurrentXp(dashRes.value.data.currentXp ?? 0);
          setNextLevelXp(dashRes.value.data.nextLevelXp ?? 141);
          setXpProgressPct(dashRes.value.data.xpProgressPct ?? 0);
          setStreakDays(dashRes.value.data.streakDays ?? 0);
          setTodayFocusTotal(dashRes.value.data.todayStudyHours ?? 0);
          setFocusWeek(dashRes.value.data.focusWeek || []);
        }

        let combinedSubjects = [];
        if (subjectsRes.status === 'fulfilled') {
          combinedSubjects = [...combinedSubjects, ...(subjectsRes.value.data || [])];
        }
        if (coursesRes.status === 'fulfilled') {
          combinedSubjects = [
            ...combinedSubjects,
            ...(coursesRes.value.data || []).map(c => ({ id: `c-${c.id}`, name: c.courseName }))
          ];
        }
        
        setSubjects(combinedSubjects);
        if (combinedSubjects.length > 0) {
          setSelectedSubject(combinedSubjects[0].name);
        }

        if (sessionsRes.status === 'fulfilled') {
          setRecentSessions(sessionsRes.value.data || []);
        }
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
      // Play a short beep when timer finishes
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 2);
      } catch (e) {
        console.error("Audio playback failed", e);
      }

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
        const userId = getUserId();
        if (userId) {
          api
            .post(`/distractions/user/${userId}`, {
              reason: "Tab Switch during Work",
            })
            .catch(() => {});
        }
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

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
    setNewTask("");
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleStartResume = async () => {
    if (!sessionId) {
      try {
        const userId = getUserId();
        if (!userId) return;
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
    setPauseStartTime(Date.now());
    setShowDistractionDialog(true);
  };

  const submitDistraction = async () => {
    try {
      let durationMinutes = 1;
      if (pauseStartTime) {
         durationMinutes = Math.max(1, Math.round((Date.now() - pauseStartTime) / 60000));
      }

      const userId = getUserId();
      if (!userId) return;
      await api.post(`/distractions/user/${userId}`, {
        reason: distractionReason || "Paused Session",
        duration: `${durationMinutes} min`
      });
    } catch (err) {}
    setShowDistractionDialog(false);
    setDistractionReason("");
    setPauseStartTime(null);
    setIsActive(true); // Resume session immediately
  };

  const skipDistraction = () => {
    setShowDistractionDialog(false);
    setDistractionReason("");
    setPauseStartTime(null);
    setIsActive(true); // Resume session
  };

  const handleStop = async () => {
    if (isActive || (sessionId && timeLeft < workDuration * 60)) {
      const result = await Swal.fire({
        title: "End Session?",
        text: "Are you sure you want to end your current focus session?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#451ebb",
        cancelButtonColor: "#f1f5f9",
        cancelButtonText: "<span style='color:#64748b'>Cancel</span>",
        confirmButtonText: "Yes, end session",
        customClass: { popup: "rounded-[2rem]" }
      });
      if (!result.isConfirmed) return;
    }

    if (sessionId) {
      try {
        const response = await api.patch(`/sessions/${sessionId}/end`, { pomodorosCompleted });
        const userId = getUserId();
        if (!userId) return;
        const [dashRes, sessionsRes] = await Promise.all([
          api.get(`/dashboard/user/${userId}`),
          api.get(`/sessions/user/${userId}`),
        ]);
        const newLevel = dashRes.data.level ?? 1;
        if (newLevel > level) {
          setLevelUpData({ level: newLevel, title: dashRes.data.levelTitle ?? "Scholar" });
          setShowLevelUpModal(true);
        }
        setLevel(newLevel);
        window.dispatchEvent(new Event("userDataUpdated"));
        setCurrentXp(dashRes.data.currentXp ?? 0);
        setNextLevelXp(dashRes.data.nextLevelXp ?? 141);
        setXpProgressPct(dashRes.data.xpProgressPct ?? 0);
        setRecentSessions(sessionsRes.data || []);
        setTodayFocusTotal(dashRes.data.todayStudyHours ?? 0);
        setFocusWeek(dashRes.data.focusWeek || []);
        if (response.data.newBadges && response.data.newBadges.length > 0) {
          setEarnedBadges(response.data.newBadges);
        }
        
        setLastSessionStats({
          pomodoros: pomodorosCompleted,
          xp: pomodorosCompleted * 50,
          subject: selectedSubject || "General",
          duration: Math.round(((workDuration * 60 - timeLeft) / 60) + (pomodorosCompleted * workDuration)),
          newBadges: response.data.newBadges || []
        });
        setShowSummary(true);
      } catch (err) {
        console.error("Error ending session:", err);
        setIsActive(false);
      }
    }
    setIsActive(false);
    setSessionId(null);
    setPomodorosCompleted(0);
    setMode("Work");
    setTimeLeft(workDuration * 60);
  };

  const handleReset = async () => {
    if (isActive || timeLeft < (mode === "Work" ? workDuration * 60 : breakDuration * 60)) {
      const result = await Swal.fire({
        title: "Restart Timer?",
        text: "Are you sure you want to reset the timer to the beginning?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#451ebb",
        cancelButtonColor: "#f1f5f9",
        cancelButtonText: "<span style='color:#64748b'>Cancel</span>",
        confirmButtonText: "Yes, restart",
        customClass: { popup: "rounded-[2rem]" }
      });
      if (!result.isConfirmed) return;
    }

    setIsActive(false);
    setTimeLeft(mode === "Work" ? workDuration * 60 : breakDuration * 60);
  };

  const TimerCard = ({ zen = false }) => (
    <section className={`p-8 flex flex-col items-center justify-center relative transition-all duration-1000 ${zen ? (activeThemeId === 'default' ? "bg-white/5 border border-white/10 rounded-[3rem] w-full max-w-3xl py-20 shadow-2xl backdrop-blur-xl scale-110 overflow-hidden" : "w-full max-w-3xl scale-110") : "glass-neu col-span-12 lg:col-span-7 overflow-hidden"}`}>
      {zen && activeThemeId === 'default' && (
        <button 
          onClick={() => setAmbientMode(false)}
          className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/10 text-white/40 flex items-center justify-center hover:bg-white/20 transition-all z-20"
        >
          <X size={20} />
        </button>
      )}
      
      {(!zen || activeThemeId === 'default') && (
        <>
          <div className={`absolute -top-24 -left-24 w-96 h-96 ${zen ? "bg-indigo-400/20" : "bg-indigo-600/10"} blur-[80px] rounded-full`} />
          <div className={`absolute -bottom-24 -right-24 w-96 h-96 ${zen ? "bg-emerald-400/10" : "bg-emerald-500/10"} blur-[80px] rounded-full`} />
        </>
      )}

      <div className="z-10 flex flex-col items-center gap-5 w-full">
        <div
          className={`${mode === "Work" ? "bg-indigo-600/10 text-indigo-600" : "bg-emerald-600/10 text-emerald-600"} px-4 py-1 rounded-full flex items-center gap-2 ${zen ? "border border-white/20 text-white/80 bg-transparent" : ""}`}
        >
          {isActive && (
            <div
              className={`w-2 h-2 rounded-full ${mode === "Work" ? (zen ? "bg-white" : "bg-indigo-600") : "bg-emerald-600"} animate-pulse`}
            />
          )}
          <span className="text-[12px] font-bold tracking-widest uppercase">
            {mode} Session {isActive ? "Active" : "Paused"}
          </span>
        </div>

        <div className={`font-['Manrope'] text-[130px] leading-none font-black tracking-tighter transition-colors duration-1000 ${zen ? "text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]" : "text-[#1E1B4B]"}`}>
          {formatTime(timeLeft)}
        </div>

        <div className="text-center space-y-1">
          <p className={`font-bold tracking-[0.2em] uppercase text-sm ${zen ? "text-white/60" : "text-slate-500"}`}>
            {selectedSubject || "General Focus"}
          </p>
        </div>

        <div className="flex items-center gap-8">
          <button
            onClick={handleReset}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-sm ${zen ? "bg-white/10 text-white hover:bg-white/20" : "bg-white text-slate-900 hover:scale-105"}`}
          >
            <RotateCcw size={24} />
          </button>
          <button
            onClick={isActive ? handlePause : handleStartResume}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${zen ? "bg-white text-indigo-900 shadow-[0_0_50px_rgba(255,255,255,0.25)]" : "bg-indigo-600 text-white shadow-[0_20px_40px_rgba(69,30,187,0.4)] hover:scale-105"} ${isActive ? "focus-ring" : ""}`}
          >
            {isActive ? (
              <Pause size={32} fill="currentColor" />
            ) : (
              <Play size={32} fill="currentColor" className="ml-1" />
            )}
          </button>
          <button
            onClick={handleStop}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-sm ${zen ? "bg-white/10 text-white hover:bg-white/20" : "bg-white text-slate-900 hover:scale-105"}`}
          >
            <Square size={24} fill="currentColor" />
          </button>
        </div>

        {!zen && (
          <div className="flex items-center gap-3 mt-4">
            <div className="flex gap-2">
              {pomodorosCompleted === 0 ? (
                <div className="w-3 h-3 rounded-full bg-slate-300" />
              ) : (
                [...Array(pomodorosCompleted)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full bg-indigo-600"
                  />
                ))
              )}
            </div>
            <span className="text-[12px] font-bold text-slate-400 tracking-widest uppercase ml-2">
              {pomodorosCompleted} Pomodoros
            </span>
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${ambientMode ? "bg-[#0A0A1B]" : "bg-[#F9F9FF]"}`}>
      <div className={`${ambientMode ? "opacity-0 pointer-events-none" : "opacity-100"} transition-opacity duration-1000`}>
        <Navbar />
      </div>
      
      <div className="flex flex-1">
        <div className={`${ambientMode ? "opacity-0 pointer-events-none" : "opacity-100"} transition-opacity duration-1000`}>
          <Sidebar />
        </div>
        
        <main className={`flex-1 transition-all duration-1000 ${ambientMode ? "p-0" : "lg:p-10"} overflow-y-auto relative`}>
          {/* ZEN OVERLAY */}
          {ambientMode && (
            <div 
              className="fixed inset-0 z-[115] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500 bg-cover bg-no-repeat bg-center transition-all duration-1000"
              style={{
                backgroundImage: ZEN_THEMES.find(t => t.id === activeThemeId)?.image 
                  ? `url(${ZEN_THEMES.find(t => t.id === activeThemeId)?.image})`
                  : 'none',
                backgroundColor: ZEN_THEMES.find(t => t.id === activeThemeId)?.image ? '#0A0A1B' : '#0A0A1B'
              }}
            >
               {/* Overlay removed to preserve original image quality */}
               
               {/* Global Close Button for Zen Mode when custom theme is active */}
               {activeThemeId !== 'default' && (
                 <button 
                   onClick={() => setAmbientMode(false)}
                   className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 backdrop-blur-md transition-all shadow-lg border border-white/10 z-20"
                 >
                   <X size={24} />
                 </button>
               )}

               <div className="relative z-10 w-full flex justify-center">
                 <TimerCard zen={true} />
               </div>

               {/* Lofi Player — bottom-left */}
               <div className="absolute bottom-8 left-8 z-20">
                 <LofiPlayer isSessionActive={isActive} />
               </div>

               {/* Theme Selector — bottom-right */}
               <div className="absolute bottom-8 right-8 z-20">
                 <div className="group relative inline-block">
                   <div className="absolute bottom-full right-0 pb-4 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
                     <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex flex-col gap-1">
                       <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest px-3 py-2 mb-1">Themes</p>
                       {ZEN_THEMES.map(theme => (
                         <button
                           key={theme.id}
                           onClick={() => setActiveThemeId(theme.id)}
                           className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between border ${activeThemeId === theme.id ? 'bg-white/20 border-white/40 text-white' : 'bg-transparent border-transparent text-white/60 hover:bg-white/10 hover:text-white'}`}
                         >
                           {theme.name}
                           {activeThemeId === theme.id && <CheckCircle2 size={14} className="text-white" />}
                         </button>
                       ))}
                     </div>
                   </div>
                   <button className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center backdrop-blur-xl transition-all duration-300 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.2)] border border-white/20 hover:border-white/40 font-bold text-sm tracking-widest uppercase hover:-translate-y-1">
                     <Sparkles size={18} className="mr-2 text-white animate-pulse opacity-80" />
                     Change Theme
                   </button>
                 </div>
               </div>
            </div>
          )}

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
                  Log & Resume Session
                </button>
              </div>
            </div>
          )}

          <div className={`max-w-6xl mx-auto transition-opacity duration-1000 ${ambientMode ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <div className="flex justify-between items-end mb-10">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                  Focus Session.
                </h1>
                <p className="text-gray-500 text-base mt-2 max-w-md leading-relaxed">
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
              <TimerCard />

              <section className="col-span-12 lg:col-span-5 neu p-7 space-y-6">
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
                      className="neu-inset p-4 px-6 flex items-center justify-between cursor-pointer group"
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                        Work Duration
                      </label>
                      <div className="neu-inset p-2 px-4 flex items-center gap-2">
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

                  <div className="neu-inset p-5 px-6 flex items-center justify-between">
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
                </div>
              </section>

              <section className="col-span-12 lg:col-span-4 neu p-8 flex flex-col justify-between min-h-[400px]">
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
                      const maxMinutes = Math.max(...focusWeek.map(d => d.focusMinutes), 1);
                      const heightPct = day.focusMinutes === 0 
                        ? 0 
                        : Math.max(8, (day.focusMinutes / maxMinutes) * 100);
                      const isToday = idx === focusWeek.length - 1;
                      
                      return (
                        <div key={idx} className="flex flex-col items-center gap-3 group w-8 h-full">
                          <div className="relative w-full flex-1 flex items-end">
                            <div
                              className={`w-full rounded-t-xl transition-all duration-700 shadow-sm ${
                                isToday ? "bg-indigo-600" : "bg-indigo-500/60"
                              } group-hover:bg-indigo-400`}
                              style={{ height: `${heightPct}%` }}
                            />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                              {day.focusMinutes}m
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
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

              <section className="col-span-12 lg:col-span-8 neu p-8 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-['Manrope'] font-bold text-lg tracking-tight">
                    Recent Sessions
                  </h3>
                  <button 
                    onClick={() => setShowArchive(true)}
                    className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase hover:underline"
                  >
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

            <footer className="mt-8 glass-card p-6 flex items-center gap-8">
              <div className="flex items-center gap-4 min-w-[200px]">
                <Avatar 
                  src={userAvatar}
                  name={userName} 
                  size="w-12 h-12" 
                  className="border-2 border-indigo-200"
                />
                <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-slate-200 flex items-center justify-center text-sm font-black italic shrink-0">
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
              <div className="flex-1 xp-track">
                <div
                  className="xp-fill"
                  style={{
                    width: `${xpProgressPct}%`,
                  }}
                />
              </div>
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => setAmbientMode(!ambientMode)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-300 relative group ${ambientMode ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]" : "bg-white text-indigo-600 hover:bg-indigo-50 hover:scale-110 hover:-translate-y-1 hover:shadow-xl"}`}
                  title="Zen Focus Mode"
                >
                  <div className={`absolute inset-0 rounded-full bg-indigo-400 opacity-0 transition-opacity duration-300 group-hover:opacity-20 ${!ambientMode ? 'group-hover:animate-ping' : ''}`} />
                  <Focus size={24} className={ambientMode ? "animate-[spin_4s_linear_infinite]" : "animate-pulse"} />
                </div>
                <div 
                  onClick={() => setShowTasks(true)}
                  className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-sm cursor-pointer hover:scale-110 transition-transform"
                  title="Session Tasks"
                >
                  <CheckCircle2 size={18} />
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {showTasks && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[120] animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                   <ListTodo className="text-emerald-600" size={24} />
                   <h3 className="text-xl font-bold">Session Goals</h3>
                 </div>
                 <button onClick={() => setShowTasks(false)} className="text-slate-400 hover:text-slate-600">
                   <X size={20} />
                 </button>
              </div>

              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  placeholder="What needs doing?"
                  className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button 
                  onClick={addTask}
                  className="bg-emerald-600 text-white w-12 h-11 rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                 {tasks.map(task => (
                   <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group transition-all">
                      <div className="flex items-center gap-3">
                         <button 
                           onClick={() => toggleTask(task.id)}
                           className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${task.completed ? "bg-emerald-600 border-emerald-600" : "border-slate-300 bg-white"}`}
                         >
                           {task.completed && <CheckCircle2 size={12} className="text-white" />}
                         </button>
                         <span className={`text-sm font-medium ${task.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>
                           {task.text}
                         </span>
                      </div>
                      <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={16} />
                      </button>
                   </div>
                 ))}
                 {tasks.length === 0 && (
                   <p className="text-center text-slate-400 text-sm py-10">No tasks added for this session.</p>
                 )}
              </div>
           </div>
        </div>
      )}
      {/* Level Up Modal */}
      {showLevelUpModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-indigo-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <style>{`
            @keyframes rotate-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
            .animate-rotate-slow { animation: rotate-slow 10s linear infinite; }
            .animate-rotate-slow-reverse { animation: rotate-slow 12s linear infinite reverse; }
            .animate-twinkle-1 { animation: twinkle 3s ease-in-out infinite; }
            .animate-twinkle-2 { animation: twinkle 4s ease-in-out infinite 1s; }
            .animate-twinkle-3 { animation: twinkle 2.5s ease-in-out infinite 2s; }
            .animate-twinkle-4 { animation: twinkle 3.5s ease-in-out infinite 0.5s; }
          `}</style>
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full mx-4 shadow-2xl relative overflow-hidden text-center animate-in zoom-in-95 duration-500">
            {/* Twinkling Stars Background */}
            <div className="absolute top-8 left-8 text-yellow-400 animate-twinkle-1"><Star size={16} fill="currentColor" /></div>
            <div className="absolute top-12 right-10 text-purple-400 animate-twinkle-2"><Star size={20} fill="currentColor" /></div>
            <div className="absolute top-32 left-6 text-indigo-400 animate-twinkle-3"><Star size={12} fill="currentColor" /></div>
            <div className="absolute top-28 right-8 text-pink-400 animate-twinkle-4"><Star size={14} fill="currentColor" /></div>
            <div className="absolute bottom-24 left-12 text-emerald-400 animate-twinkle-2"><Star size={10} fill="currentColor" /></div>
            <div className="absolute bottom-28 right-12 text-blue-400 animate-twinkle-1"><Star size={14} fill="currentColor" /></div>

            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 blur-3xl rounded-t-[2.5rem]" />
            <div className="relative z-10">
              <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                {/* Rotating dashed ring */}
                <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-indigo-300 opacity-60 animate-rotate-slow" />
                {/* Rotating inner gradient ring */}
                <div className="absolute inset-2 rounded-full border-[3px] border-dashed border-purple-300 opacity-60 animate-rotate-slow-reverse" />
                
                <div className="relative z-10 w-24 h-24 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-xl shadow-indigo-200 border-4 border-white">
                  <span className="text-4xl font-black text-white">{levelUpData.level}</span>
                </div>
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Level Up!</h2>
              <p className="text-gray-500 font-medium mb-1">You've reached a new milestone.</p>
              <div className="bg-indigo-50 text-indigo-700 font-bold px-4 py-2 rounded-xl inline-block mt-2 mb-8 uppercase tracking-widest text-xs border border-indigo-100">
                {levelUpData.title}
              </div>
              <button 
                onClick={() => setShowLevelUpModal(false)}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                Keep Going
              </button>
            </div>
          </div>
        </div>
      )}
      {showSummary && lastSessionStats && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[130] animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl transform animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={48} className="text-indigo-600" />
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 mb-2">Session Complete!</h2>
            <p className="text-slate-500 font-medium mb-8">Great work on your {lastSessionStats.subject} session.</p>
            
            <div className="grid grid-cols-2 gap-4 w-full mb-8">
              <div className="bg-slate-50 p-6 rounded-[2rem]">
                <div className="text-3xl font-black text-indigo-600 mb-1">{lastSessionStats.pomodoros}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pomodoros</div>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem]">
                <div className="text-3xl font-black text-emerald-600 mb-1">+{lastSessionStats.xp}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">XP Gained</div>
              </div>
            </div>

            {lastSessionStats.newBadges.length > 0 && (
              <div className="w-full mb-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">New Achievements</p>
                <div className="flex justify-center gap-3">
                  {lastSessionStats.newBadges.map((badge, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border-2 border-amber-100">
                         <span className="text-xl">🏆</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setShowSummary(false);
                if (lastSessionStats.newBadges && lastSessionStats.newBadges.length > 0) {
                  setShowAchievementModal(true);
                  setCurrentAchievementIndex(0);
                } else {
                  setEarnedBadges([]);
                }
              }}
              className="w-full bg-indigo-600 text-white font-bold py-5 rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {showArchive && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[140] animate-in fade-in duration-300 p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Session Archive</h2>
                <p className="text-slate-500 text-sm font-medium">Your complete focus history</p>
              </div>
              <button 
                onClick={() => setShowArchive(false)}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    title={session.subject}
                    subtitle="Session"
                    time={`${new Date(session.startTime).toLocaleDateString()} • ${new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${session.durationMinutes} MIN`}
                    xp={(session.pomodorosCompleted || 0) * 50}
                    type={session.deepWork ? "Deep Focus" : "Standard"}
                  />
                ))}
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setShowArchive(false)}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all"
              >
                Close Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {showAchievementModal && earnedBadges.length > 0 && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-12 w-full max-w-lg shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            
            {/* Multi-colored time progress line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
               <div className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 ease-linear" style={{ width: '100%', transition: 'width 5000ms linear' }} key={currentAchievementIndex} />
            </div>

            {/* Twinkling Stars */}
            <div className="absolute top-8 left-12 text-yellow-400 animate-[pulse_0.8s_ease-in-out_infinite] text-2xl">✦</div>
            <div className="absolute bottom-24 right-10 text-yellow-400 animate-[pulse_1.2s_ease-in-out_infinite] delay-100 text-3xl">✦</div>
            <div className="absolute top-20 right-16 text-indigo-300 animate-[pulse_0.6s_ease-in-out_infinite] delay-300 text-xl">✧</div>
            <div className="absolute bottom-32 left-16 text-pink-300 animate-[pulse_1s_ease-in-out_infinite] delay-200 text-xl">✧</div>
            <div className="absolute top-32 left-8 text-purple-300 animate-[pulse_0.5s_ease-in-out_infinite] delay-500 text-sm">✦</div>
            <div className="absolute top-40 right-8 text-amber-300 animate-[pulse_1.5s_ease-in-out_infinite] delay-700 text-lg">✧</div>
            <div className="absolute top-12 right-32 text-pink-400 animate-[pulse_0.7s_ease-in-out_infinite] delay-150 text-xl">✦</div>
            <div className="absolute bottom-16 left-32 text-indigo-400 animate-[pulse_0.9s_ease-in-out_infinite] delay-400 text-2xl">✧</div>
            <div className="absolute top-48 left-16 text-yellow-300 animate-[pulse_1.1s_ease-in-out_infinite] delay-250 text-xl">✦</div>
            <div className="absolute bottom-48 right-16 text-purple-400 animate-[pulse_0.6s_ease-in-out_infinite] delay-600 text-lg">✧</div>
            <div className="absolute top-4 right-48 text-yellow-500 animate-[pulse_0.8s_ease-in-out_infinite] delay-350 text-lg">✦</div>
            <div className="absolute bottom-8 left-48 text-indigo-200 animate-[pulse_1.3s_ease-in-out_infinite] delay-800 text-xl">✧</div>

            <button onClick={() => { setShowAchievementModal(false); setEarnedBadges([]); }} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 z-20">
               <X size={24} />
            </button>
            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-6 relative z-10 animate-[pulse_1.5s_ease-in-out_infinite]">Achievement Unlocked</h2>
            
            {/* Revolving Outline Badge Container */}
            <div className="relative w-40 h-40 mb-6 flex items-center justify-center rounded-full overflow-hidden p-1.5">
              <div className="absolute w-[200%] h-[200%] bg-[conic-gradient(transparent,transparent,transparent,#633ECD,#ec4899)] animate-[spin_3s_linear_infinite]" />
              <div className="absolute inset-1.5 bg-white rounded-full z-0" />
              <div className="relative z-10 w-full h-full bg-indigo-50/50 rounded-full flex items-center justify-center overflow-hidden border border-indigo-100/50 backdrop-blur-sm">
                 {earnedBadges[currentAchievementIndex].imageUrl ? (
                   <img src={earnedBadges[currentAchievementIndex].imageUrl} alt={earnedBadges[currentAchievementIndex].displayName || earnedBadges[currentAchievementIndex].name} className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-6xl">🏆</span>
                 )}
              </div>
            </div>

            <h3 className="text-3xl font-black text-slate-900 mb-4 relative z-10">{earnedBadges[currentAchievementIndex].displayName || earnedBadges[currentAchievementIndex].name}</h3>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed relative z-10">
              {earnedBadges[currentAchievementIndex].description}
            </p>
            
            <div className="flex gap-2 mb-8 relative z-10">
              {earnedBadges.map((_, idx) => (
                <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${idx === currentAchievementIndex ? 'bg-indigo-600 w-6' : 'bg-slate-200 w-2'}`} />
              ))}
            </div>
            
            <button
              onClick={() => {
                if (currentAchievementIndex < earnedBadges.length - 1) {
                  setCurrentAchievementIndex(prev => prev + 1);
                } else {
                  setShowAchievementModal(false);
                  setEarnedBadges([]);
                }
              }}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 relative z-10"
            >
              {currentAchievementIndex < earnedBadges.length - 1 ? 'Next Achievement' : 'Awesome!'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudySessionDashboard;
