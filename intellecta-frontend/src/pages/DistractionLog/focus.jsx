import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  AlertTriangle,
  TrendingDown,
  //Activity,
  Zap,
  Target,
} from "lucide-react";

// --- Updated Import Paths ---
import Sidebar from "../../components/dashboard/StudentSidebar";
import Navbar from "../../components/dashboard/Navbar";
import api from "../../services/api";
import { getUserId } from "../../utils/auth";
import "../../styles/global.css";

// --- Sub-components ---

const IntensityCell = ({ intensity }) => {
  const [hovered, setHovered] = useState(false);
  const bgColors = [
    'bg-gray-200', 'bg-indigo-100', 'bg-indigo-300', 
    'bg-indigo-500', 'bg-indigo-600', 'bg-indigo-700',
  ];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`w-full aspect-square rounded-[4px] transition-all duration-200 cursor-pointer ${bgColors[intensity]} ${
        hovered ? 'ring-2 ring-indigo-400 ring-offset-1 scale-110 z-10 shadow-lg' : ''
      }`}
    />
  );
};

const MasteryItem = ({ title, subtitle, percentage, type }) => {
  const isCritical = type === "critical";
  const isSuccess = type === "success";
  
  return (
    <div className="group flex items-center justify-between p-6 mb-4 neu rounded-3xl hover:scale-[1.01] transition-all duration-300 cursor-default">
      <div className="flex items-center gap-5">
        <div
          className={`p-4 rounded-xl ${
            isCritical ? "bg-red-50 text-red-500" : 
            isSuccess ? "bg-emerald-50 text-emerald-500" : 
            "bg-orange-50 text-orange-500"
          }`}
        >
          {isCritical ? <AlertTriangle size={24} /> : isSuccess ? <Zap size={24} fill="currentColor" /> : <TrendingDown size={24} />}
        </div>
        <div>
          <h4 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
            {title}
          </h4>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:block w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isCritical ? "bg-red-500" : isSuccess ? "bg-emerald-500" : "bg-orange-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`text-2xl font-black ${
          isCritical ? "text-red-500" : isSuccess ? "text-emerald-500" : "text-orange-500"
        }`}>
          {percentage}%
        </span>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---

const PerformanceDashboard = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [distractions, setDistractions] = useState([]);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) { navigate('/login'); return; }
    
    // Fetch sessions
    api.get(`/sessions/user/${userId}`)
      .then(res => setSessions(res.data || []))
      .catch(err => console.error("Error fetching sessions:", err));

    // Fetch quiz attempts
    api.get(`/quizzes/attempts/user/${userId}`)
      .then(res => setAttempts(res.data || []))
      .catch(err => console.error("Error fetching quiz attempts:", err));

    // Fetch distractions
    api.get(`/distractions/user/${userId}/logs`)
      .then(res => setDistractions(res.data || []))
      .catch(err => console.error("Error fetching distractions:", err));
  }, []);

  const { allocationData, totalHours, totalSessions, maxSessionDuration } = useMemo(() => {
    if (sessions.length === 0) {
      return { allocationData: [], totalHours: 0 };
    }

    const groups = sessions.reduce((acc, s) => {
      const subject = s.subject || "General";
      const duration = s.durationMinutes || 0;
      acc[subject] = (acc[subject] || 0) + duration;
      return acc;
    }, {});

    const totalMinutes = Object.values(groups).reduce((a, b) => a + b, 0);
    const colors = ["#5D5FEF", "#A5A6F6", "#E2E2F2", "#C7D2FE", "#818CF8"];

    const data = Object.entries(groups)
      .map(([label, mins], i) => ({
        label,
        value: Math.round((mins / totalMinutes) * 100),
        color: colors[i % colors.length],
        bgClass: `bg-[${colors[i % colors.length]}]`, // fallback
        rawColor: colors[i % colors.length]
      }))
      .sort((a, b) => b.value - a.value);

    const deepSessions = sessions.filter(s => s.deepWork).length;
    const ratio = sessions.length > 0 ? Math.round((deepSessions / sessions.length) * 100) : 0;
    const avg = sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0;
    const maxSession = sessions.length > 0 ? Math.max(...sessions.map(s => s.durationMinutes || 0)) : 0;

    return { 
      allocationData: data, 
      totalHours: (totalMinutes / 60).toFixed(1),
      totalSessions: sessions.length,
      avgSessionDuration: avg,
      maxSessionDuration: maxSession
    };
  }, [sessions]);

  const masteryDeficits = useMemo(() => {
    // Bug 1.2.1: ungraded (PENDING_REVIEW) attempts have score 0 — never
    // treat them as mastery failures.
    const gradedAttempts = attempts.filter(a => a.graded === true);
    if (gradedAttempts.length === 0) return [];

    const scoresByTopic = {};
    gradedAttempts.forEach(a => {
      // Bug 1.2.4: group by topic first, then category.
      const topic = a.quiz?.topic || a.quiz?.category || "General";
      if (!scoresByTopic[topic]) scoresByTopic[topic] = [];
      // Bug 1.2.3: score only counts OBJECTIVE questions; divide by the
      // objective count, not by totalQuestions (which includes descriptive).
      const objectiveCount = (a.quiz?.questions || [])
        .filter(q => q.questionType === 'OBJECTIVE').length;
      const denominator = objectiveCount > 0 ? objectiveCount : (a.totalQuestions || 0);
      const pct = denominator > 0 ? (a.score / denominator) * 100 : 0;
      scoresByTopic[topic].push(pct);
    });

    return Object.entries(scoresByTopic)
      .map(([topic, scores]) => {
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        let type = "warning";
        let subtitle = "Improvement needed";

        if (avg >= 90) {
          type = "success";
          subtitle = "Concept mastered";
        } else if (avg < 60) {
          type = "critical";
          subtitle = "Requires immediate review";
        }

        return {
          title: topic,
          percentage: avg,
          type: type,
          subtitle: subtitle
        };
      })
      .sort((a, b) => a.percentage - b.percentage) // Show lowest first (deficits)
      .slice(0, 4);
  }, [attempts]);

  const intensityPathData = useMemo(() => {
    // We want to map 06:00 AM to 12:00 AM (18 hours)
    // Let's create 19 points (one for each hour)
    const points = Array.from({ length: 19 }, (_, i) => {
      const hour = 6 + i;
      const intensity = sessions.reduce((acc, s) => {
        const start = new Date(s.startTime);
        const end = new Date(s.endTime || (start.getTime() + (s.durationMinutes || 30) * 60000));
        
        // Check if session falls within this hour slot
        const slotStart = new Date(start); slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(start); slotEnd.setHours(hour + 1, 0, 0, 0);
        
        if (start < slotEnd && end > slotStart) {
          return acc + (s.deepWork ? 80 : 50);
        }
        return acc;
      }, 0);
      return Math.min(100, intensity);
    });

    // Convert points to SVG path
    // Width is 1000, height is 200. Y=0 is top, Y=200 is bottom.
    // Higher intensity means LOWER Y value.
    const coords = points.map((val, i) => ({
      x: (i / 18) * 1000,
      y: 165 - (val / 100) * 145 // Higher baseline, more room for peaks
    }));

    if (coords.length === 0) return { line: "", area: "" };

    let d = `M${coords[0].x},${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      d += ` C${cp1x},${curr.y} ${cp1x},${next.y} ${next.x},${next.y}`;
    }

    return {
      line: d,
      area: `${d} L1000,165 L0,165 Z`
    };
  }, [sessions]);
  const timeLabels = [
    "06:00 AM",
    "09:00 AM",
    "12:00 PM",
    "03:00 PM",
    "06:00 PM",
    "09:00 PM",
    "12:00 AM",
  ];
  const { heatmapData, dayLabels, primeSlot, behavioralInsights } = useMemo(() => {
    // Generate past 7 days (including today)
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    const grid = Array.from({ length: 7 }, () => Array(12).fill(0));
    
    sessions.forEach(s => {
      const sDate = new Date(s.startTime);
      const dayIdx = days.findIndex(d => 
        d.getDate() === sDate.getDate() && 
        d.getMonth() === sDate.getMonth() && 
        d.getFullYear() === sDate.getFullYear()
      );
      
      if (dayIdx !== -1) {
        const hour = sDate.getHours();
        let slot = Math.floor((hour - 6 + 24) % 24 / 2);
        if (slot >= 0 && slot < 12) {
          grid[dayIdx][slot] += (s.deepWork ? 3 : 1);
        }
      }
    });

    // All-sessions slot grid for the audit's Circadian Rhythm — same scope as
    // Sustainability / Depth / Velocity (Bug 1.1.3: one scope for all four metrics)
    const allTimeSlots = Array(12).fill(0);
    sessions.forEach(s => {
      const sDate = new Date(s.startTime);
      const hour = sDate.getHours();
      let slot = Math.floor((hour - 6 + 24) % 24 / 2);
      if (slot >= 0 && slot < 12) {
        allTimeSlots[slot] += (s.deepWork ? 3 : 1);
      }
    });

    const labels = days.map(d => 
      d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
    );

    const formatHour = (h) => `${h.toString().padStart(2, '0')}:00`;

    // Circadian Rhythm — prime slot over ALL sessions (Bug 1.1.3)
    let maxAllIntensity = -1;
    let allPrimeSlotIdx = 0;
    for (let c = 0; c < 12; c++) {
      if (allTimeSlots[c] > maxAllIntensity) {
        maxAllIntensity = allTimeSlots[c];
        allPrimeSlotIdx = c;
      }
    }
    const allStartHour = (6 + allPrimeSlotIdx * 2) % 24;
    const allEndHour = (allStartHour + 2) % 24;
    const circadianRhythm = maxAllIntensity > 0
      ? `${formatHour(allStartHour)} — ${formatHour(allEndHour)}`
      : "No data yet";

    // Deduce Prime Slot (column with highest sum over the last 7 days)
    // Bug 1.1.2: never fabricate a window when that week has no data
    let maxIntensity = -1;
    let primeSlotIdx = 0;
    for (let c = 0; c < 12; c++) {
      let colSum = 0;
      for (let r = 0; r < 7; r++) {
        colSum += grid[r][c];
      }
      if (colSum > maxIntensity) {
        maxIntensity = colSum;
        primeSlotIdx = c;
      }
    }

    const hasPrimeSlotData = maxIntensity > 0;
    const startHour = (6 + primeSlotIdx * 2) % 24;
    const endHour = (startHour + 2) % 24;
    const primeSlotStr = hasPrimeSlotData
      ? `${formatHour(startHour)} — ${formatHour(endHour)}`
      : "No data yet";

    // Mastery vs Focus Correlation (Efficiency)
    const subjectStats = {};
    sessions.forEach(s => {
      const sub = s.subject || "General";
      if (!subjectStats[sub]) subjectStats[sub] = { hours: 0, mastery: 0, attempts: 0 };
      subjectStats[sub].hours += (s.durationMinutes || 30) / 60;
    });

    // Bug 1.2.1/1.2.3: same grading/denominator discipline as Mastery Deficits
    attempts.filter(a => a.graded === true).forEach(a => {
      const sub = a.quiz?.topic || a.quiz?.category || "General";
      if (!subjectStats[sub]) subjectStats[sub] = { hours: 0, mastery: 0, attempts: 0 };
      const objectiveCount = (a.quiz?.questions || [])
        .filter(q => q.questionType === 'OBJECTIVE').length;
      const denominator = objectiveCount > 0 ? objectiveCount : (a.totalQuestions || 0);
      const pct = denominator > 0 ? (a.score / denominator) * 100 : 0;
      subjectStats[sub].mastery = (subjectStats[sub].mastery * subjectStats[sub].attempts + pct) / (subjectStats[sub].attempts + 1);
      subjectStats[sub].attempts += 1;
    });

    // Behavioral Insights Calculation (Distraction-Aware)
    const totalDuration = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    
    // A session is 'Concentrated' if 0 distractions occurred during its timeframe
    const concentratedSessions = sessions.filter(s => {
      const sStart = new Date(s.startTime);
      const sEnd = new Date(s.endTime || (sStart.getTime() + (s.durationMinutes || 0) * 60000));
      
      const sessionDistractions = distractions.filter(d => {
        const dTime = new Date(d.loggedAt);
        return dTime >= sStart && dTime <= sEnd;
      });
      
      return sessionDistractions.length === 0;
    });

    const concentrationQuality = sessions.length > 0 
      ? Math.round((concentratedSessions.length / sessions.length) * 100) 
      : 0;
    
    const avgDuration = sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0;
    
    const activeDays = new Set(sessions.map(s => new Date(s.startTime).toDateString())).size;
    const velocity = activeDays > 0 ? (totalDuration / 60 / activeDays).toFixed(1) : 0;

    return {
      heatmapData: grid.map(row => row.map(val => Math.min(5, val))),
      dayLabels: labels,
      primeSlot: primeSlotStr,
      behavioralInsights: {
        circadianRhythm,
        sustainability: `${avgDuration}m`,
        depth: `${concentrationQuality}%`,
        velocity: `${velocity}h/day`
      }
    };
  }, [sessions, attempts, distractions]);

  const hourLabels = ["06", "08", "10", "12", "02", "04", "06", "08", "10", "12", "02", "04"];

  const radius = 100;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-inter selection:bg-indigo-100 antialiased">
        {/* Navbar */}
      <Navbar />

      <div className="flex flex-1">
      {/* Sidebar - Fixed Left */}
        <Sidebar />

        {/* Scrollable Content Area */}
        <main className="flex-1 p-6 lg:p-10">
          <div className="max-w-[1400px] mx-0">
            {" "}
            {/* Align left-ish for a clean sidebar flow */}
            {/* Header Section */}
            <header className="mb-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em]">
                  System Active
                </span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                Performance Dashboard
              </h1>
            </header>
            <div className="grid grid-cols-12 gap-8">
              {/* Focus Chart Card */}
              <section
                className="col-span-12 lg:col-span-8 neu overflow-hidden transition-all duration-500 hover:scale-[1.01]"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className="p-10 flex justify-between items-start">
                  <header>
                    <h2 className="text-[28px] font-bold tracking-tight text-[#4F39C3] leading-none">
                      Focus Intensity
                    </h2>
                    <p className="mt-3 text-[16px] text-gray-500 font-medium tracking-wide">
                      Biometric tracking of cognitive load over 24h
                    </p>
                  </header>
                  <button
                    className={`px-6 py-2.5 rounded-full text-[11px] font-black tracking-[0.15em] uppercase transition-all duration-300 ${isHovered ? "bg-[#3f2da1] -translate-y-1 shadow-indigo-200 shadow-xl" : "bg-[#4F39C3]"} text-white shadow-lg`}
                  >
                    Live Tracking
                  </button>
                </div>

                <div className="relative h-72 w-full px-2">
                  <svg
                    viewBox="0 0 1000 200"
                    preserveAspectRatio="none"
                    className="w-full h-full"
                  >
                    <defs>
                      <linearGradient
                        id="areaGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#4F39C3"
                          stopOpacity="0.18"
                        />
                        <stop
                          offset="100%"
                          stopColor="#4F39C3"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d={intensityPathData.area}
                      fill="url(#areaGradient)"
                    />
                    <path
                      d={intensityPathData.line}
                      fill="none"
                      stroke="#4F39C3"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="absolute bottom-6 w-full px-2">
                    <div className="grid grid-cols-7 w-full border-t border-gray-50 pt-6">
                      {timeLabels.map((time, index) => (
                        <div key={index} className="text-center">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block transform -translate-x-1/2 ml-[50%] whitespace-nowrap">
                            {time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-6">
                <div className="bg-[#4F39C3] rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/10 rounded-2xl">
                      <Zap size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                      Total Sessions
                    </span>
                  </div>
                  <div>
                    <div className="text-4xl font-black mb-1">{totalSessions}</div>
                    <p className="text-indigo-100 text-[12px] font-medium leading-tight">
                      Cumulative focus sessions logged in the system.
                    </p>
                  </div>
                </div>

                <div className="neu p-8 text-gray-800 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                      <Clock size={20} />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Longest Session
                    </span>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-gray-900 mb-1">{maxSessionDuration}m</div>
                    <p className="text-gray-500 text-[12px] font-medium leading-tight">
                      Your personal best for a single focus block.
                    </p>
                  </div>
                </div>
              </section>

              {/* Heatmap Card */}
              <section className="col-span-12 lg:col-span-4 neu p-10 h-fit">
                <header className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <Clock size={18} />
                    </div>
                    <h2 className="text-[14px] font-black text-gray-800 uppercase tracking-[0.15em]">
                      Peak Windows (Past 7 Days)
                    </h2>
                  </div>
                </header>
                <div className="flex flex-col gap-4">
                  {/* Heatmap rows with labels */}
                  <div className="space-y-1.5">
                    {heatmapData.map((row, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-4">
                        <span className="w-8 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          {dayLabels[rIdx]}
                        </span>
                        <div className="flex-1 grid grid-cols-12 gap-1.5">
                          {row.map((intensity, cIdx) => (
                            <IntensityCell key={`${rIdx}-${cIdx}`} intensity={intensity} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* X-Axis Labels (Hours) */}
                  <div className="flex items-center gap-4">
                    <div className="w-8" /> {/* Offset for day labels */}
                    <div className="flex-1 grid grid-cols-12 text-[9px] font-black text-gray-400">
                      {hourLabels.map((hour, idx) => (
                        <span key={idx} className="text-center">{hour}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <footer className="mt-10 pt-8 border-t border-gray-50 flex flex-row items-center justify-between gap-4">
                  {/* The left side container */}
                  <div className="flex items-center gap-4"> 
                    <div>
                      <span className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">
                        Prime Slot
                      </span>
                      <span className="text-lg font-bold text-gray-800 tracking-tight whitespace-nowrap">
                        {primeSlot}
                      </span>
                    </div>
                  </div>

                  {/* The right side badge */}
                  <span className="translate-y-2 flex-shrink-0 px-4 py-2 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-xl">
                    Optimal Flow
                  </span>
                </footer>
              </section>

              {/* Mastery Deficits Card */}
              <section className="col-span-12 lg:col-span-8 neu p-10">
                <header className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-lg text-red-600">
                      <Target size={18} />
                    </div>
                    <h2 className="text-[14px] font-black text-gray-800 uppercase tracking-[0.15em]">
                      Mastery Deficits
                    </h2>
                  </div>
                </header>
                <nav className="space-y-2 overflow-y-auto max-h-[450px] pr-4 custom-scrollbar">
                  {masteryDeficits.length > 0 ? (
                    masteryDeficits.map((item, idx) => (
                      <MasteryItem
                        key={idx}
                        title={item.title}
                        subtitle={item.subtitle}
                        percentage={item.percentage}
                        type={item.type}
                      />
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <p className="text-sm font-bold uppercase tracking-widest">No quiz data available yet.</p>
                    </div>
                  )}
                </nav>
              </section>

              {/* Focus Allocation Card */}
              <section className="col-span-12 lg:col-span-5 neu p-10 flex flex-col justify-between min-h-[520px]">
                <h2 className="font-black text-2xl tracking-tight text-[#2D2D5F] uppercase border-b border-gray-50 pb-4">
                  Focus Allocation
                </h2>

                <div className="relative flex items-center justify-center my-8">
                  <svg
                    className="w-72 h-72 transform -rotate-90"
                    viewBox="0 0 250 250"
                  >
                    <circle
                      cx="125"
                      cy="125"
                      r="100"
                      stroke="#F8FAFC"
                      strokeWidth="28"
                      fill="transparent"
                    />
                    {allocationData.reduce((acc, item, i) => {
                      const dashOffset = circumference - (circumference * item.value) / 100;
                      const rotation = (acc.offset / 100) * 360;
                      const element = (
                        <circle
                          key={i}
                          cx="125"
                          cy="125"
                          r="100"
                          stroke={item.rawColor}
                          strokeWidth="28"
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                          strokeLinecap="round"
                          style={{ 
                            transform: `rotate(${rotation}deg)`,
                            transformOrigin: 'center',
                            transition: 'all 1s ease-out'
                          }}
                        />
                      );
                      return { 
                        elements: [...acc.elements, element], 
                        offset: acc.offset + item.value 
                      };
                    }, { elements: [], offset: 0 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-[#2D2D5F] tracking-tight">
                      {totalHours}h
                    </span>
                    <span className="text-[11px] font-bold tracking-[0.25em] text-gray-400 mt-2 uppercase">
                      Total Focused
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-5">
                  {allocationData.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.rawColor }} />
                      <span className="text-sm font-semibold text-gray-600">
                        {item.label} ({item.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Analytical Charts Section */}
              <div className="col-span-12 lg:col-span-7 flex flex-col gap-8">
                <section className="neu p-10 flex flex-col h-[520px]">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h2 className="font-black text-xl tracking-tight text-[#4F39C3] uppercase">
                        Cognitive Behavioral Audit
                      </h2>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        Analyzing your psychological study patterns
                      </p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                      <Target size={20} />
                    </div>
                  </div>

                  {sessions.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center rounded-3xl border-2 border-dashed border-gray-100">
                      <div className="text-center">
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
                          No study data available yet.
                        </p>
                        <p className="text-[10px] font-medium text-gray-300 mt-2">
                          Complete a focus session to unlock this audit.
                        </p>
                      </div>
                    </div>
                  ) : (
                  <div className="flex-1 grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-3xl p-6 flex flex-col justify-between group hover:bg-indigo-600 transition-all duration-500">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white/60 transition-colors">Circadian Rhythm</span>
                      <div>
                        <span className="text-2xl font-black text-gray-900 block group-hover:text-white transition-colors">{behavioralInsights.circadianRhythm}</span>
                        <span className="text-[10px] font-medium text-gray-500 group-hover:text-white/60 transition-colors mt-1 block">Peak Cognitive Window</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-3xl p-6 flex flex-col justify-between group hover:bg-indigo-600 transition-all duration-500">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white/60 transition-colors">Focus Sustainability</span>
                      <div>
                        <span className="text-2xl font-black text-gray-900 block group-hover:text-white transition-colors">{behavioralInsights.sustainability}</span>
                        <span className="text-[10px] font-medium text-gray-500 group-hover:text-white/60 transition-colors mt-1 block">Avg. Session Duration</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-3xl p-6 flex flex-col justify-between group hover:bg-indigo-600 transition-all duration-500">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white/60 transition-colors">Deep Work Depth</span>
                      <div>
                        <span className="text-2xl font-black text-gray-900 block group-hover:text-white transition-colors">{behavioralInsights.depth}</span>
                        <span className="text-[10px] font-medium text-gray-500 group-hover:text-white/60 transition-colors mt-1 block">Concentration Quality</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-3xl p-6 flex flex-col justify-between group hover:bg-indigo-600 transition-all duration-500">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white/60 transition-colors">Study Velocity</span>
                      <div>
                        <span className="text-2xl font-black text-gray-900 block group-hover:text-white transition-colors">{behavioralInsights.velocity}</span>
                        <span className="text-[10px] font-medium text-gray-500 group-hover:text-white/60 transition-colors mt-1 block">Focus Hours per Day</span>
                      </div>
                    </div>
                  </div>
                  )}

                  <div className="mt-10 pt-8 border-t border-gray-50">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <Zap size={16} />
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic">
                        "Your <span className="text-indigo-600 font-black">Concentration Quality</span> is based on uninterrupted focus blocks. Zero distractions during a session increases this score."
                      </p>
                    </div>
                  </div>
                </section>


              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
