import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Timer, BrainCircuit, Play, FileText, AlertCircle } from 'lucide-react';

import Sidebar from '../../components/dashboard/StudentSidebar';
import Navbar from '../../components/dashboard/Navbar';
import Avatar from '../../components/common/Avatar';
import api from '../../services/api';

// --- START: HEATMAP COMPONENTS ---

const HeatmapSquare = ({ intensity }) => {
  const bgColors = [
    'bg-[#F1F3F9]', 
    'bg-[#E2E4F0]', 
    'bg-[#B5A9F0]', 
    'bg-[#8E79E3]', 
    'bg-[#5D2ECC]', 
  ];

  return (
    <div 
      className={`w-full aspect-square rounded-sm transition-all duration-200 hover:ring-2 hover:ring-offset-1 hover:ring-purple-200 cursor-pointer ${bgColors[intensity]}`}
    />
  );
};

const HeatmapSection = ({ name, label, data, isUser }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div className="flex-1 min-w-[350px]">
      <div className="flex justify-between items-end mb-6">
        <h3 className={`text-xs font-bold tracking-[0.2em] uppercase ${isUser ? 'text-[#8E79E3]' : 'text-[#4c35b5]'}`}>
          {name} {isUser && <span className="opacity-70">(YOU)</span>}
        </h3>
        <span className="text-xs text-gray-400 font-medium">{label}</span>
      </div>
      
      <div className="grid grid-cols-7 gap-3 mb-2">
        {days.map((day, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {data.map((val, idx) => (
          <div key={idx} title={`${idx < 7 ? 'Last Week' : 'This Week'}, ${days[idx % 7]}`}>
            <HeatmapSquare intensity={val} />
          </div>
        ))}
      </div>
    </div>
  );
};

const WeeklyFocusHeatmap = ({ data }) => {
  const [filter, setFilter] = useState('high-focus');

  if (!data) return null;
  
  // Apply a visual filter mask based on state. If 'idle', invert the heatmap visuals (4 - val)
  const transformData = (sourceData) => {
    const defaultData = [1, 2, 2, 3, 1, 0, 4, 2, 3, 1, 1, 2, 4, 0];
    const target = sourceData || defaultData;
    return filter === 'idle' ? target.map(val => 4 - val) : target;
  };

  const peerData = transformData(data.peer.heatmap);
  const meData = transformData(data.me.heatmap);

  return (

    <section className="bg-white p-10 md:p-14 rounded-[40px] border border-gray-100 shadow-sm mt-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Weekly Focus Heatmaps</h2>
          <p className="text-gray-500 text-base mt-2">Comparing temporal density of high-focus study hours</p>
        </div>

        <div className="flex items-center gap-3 bg-[#F8FAFC] p-1.5 rounded-full border border-gray-100">
          <button 
            onClick={() => setFilter('high-focus')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              filter === 'high-focus' ? 'bg-white shadow-md text-[#5D2ECC]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#5D2ECC]" />
            High Focus
          </button>
          <button 
            onClick={() => setFilter('idle')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              filter === 'idle' ? 'bg-white shadow-md text-gray-500' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#E2E4F0]" />
            Idle
          </button>
        </div>
      </header>

      <div className="flex flex-col xl:flex-row gap-16">
        <HeatmapSection 
          name={data.peer.username} 
          label="Consistent" 
          data={peerData} 
          isUser={false} 
        />
        <HeatmapSection 
          name="You" 
          label="Active" 
          data={meData} 
          isUser={true} 
        />
      </div>

      <div className="mt-12 flex items-center justify-end gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        <span>Less</span>
        <div className="flex gap-1.5 mx-1">
          {[0, 1, 2, 3, 4].map(val => (
            <div key={val} className="w-3 h-3 rounded-[2px] overflow-hidden">
               <HeatmapSquare intensity={val} />
            </div>
          ))}
        </div>
        <span>More</span>
      </div>
    </section>
  );
};

// --- Peer Comparison Page Title Section ---
const PeerComparisonTitle = ({ data }) => {
  if (!data || !data.me || !data.peer) return null;

  const participants = [
    { id: 1, name: data.me.username || 'You', avatarUrl: data.me.avatarUrl },
    { id: 2, name: data.peer.username || 'Peer', avatarUrl: data.peer.avatarUrl }
  ];

  return (
    <section className="w-full mb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#4c35b5]">
            Deep Peer Comparison
          </h1>
          <p className="text-gray-500 text-lg md:text-xl font-normal">
            Detailed performance breakdown between you and {data.peer.username}.
          </p>
        </div>

        <div className="flex items-center gap-5 bg-[#f4f7f9] rounded-2xl p-5 border border-gray-100 shadow-sm self-start md:self-center">
          {/* Avatars */}
          <div className="flex -space-x-4 shrink-0">
            {participants.map((user) => (
              <div key={user.id} className="relative inline-block">
                <Avatar src={user.avatarUrl} name={user.name} size="w-12 h-12" className="ring-4 ring-[#f4f7f9]" />
              </div>
            ))}
          </div>

          <div className="h-10 w-[1px] bg-gray-200 shrink-0" aria-hidden="true" />

          {/* Stats */}
          <div className="flex gap-3">
            <div className="bg-white rounded-xl px-4 py-2.5 text-center border border-gray-100 shadow-sm min-w-[80px]">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] block mb-1">Rank Delta</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-xl font-black text-[#4c35b5] leading-none">
                  {Math.abs((data.me.globalRank || 0) - (data.peer.globalRank || 0))}
                </span>
                <span className="text-[10px] font-bold text-gray-400">pos</span>
              </div>
            </div>
            <div className="bg-white rounded-xl px-4 py-2.5 text-center border border-gray-100 shadow-sm min-w-[80px]">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] block mb-1">Level Gap</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-xl font-black text-[#b8b0e8] leading-none">
                  {Math.abs((data.me.level || 0) - (data.peer.level || 0))}
                </span>
                <span className="text-[10px] font-bold text-gray-400">lvls</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Dashboard Card Wrapper ---
const Card = ({ title, subtitle, badge, children }) => (
  <section className="bg-white p-10 md:p-12 rounded-[40px] border border-gray-100 shadow-sm flex flex-col h-full min-h-[500px]">
    <div className="flex justify-between items-start mb-10">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h3>
        <p className="text-base text-gray-500 mt-2">{subtitle}</p>
      </div>
      {badge && (
        <span className="px-4 py-1.5 text-xs font-bold text-[#4c35b5] uppercase tracking-widest bg-[#f4f3ff] rounded-full">
          {badge}
        </span>
      )}
    </div>
    <div className="flex-1 flex flex-col justify-center">
      {children}
    </div>
  </section>
);

// --- Subject Proficiency (Radar) ---
const SubjectProficiency = ({ data, dbCategories }) => {
  if (!data || !dbCategories || dbCategories.length === 0) return null;

  // Number of axes is exactly the number of actual database categories
  const nAxes = dbCategories.length;
  
  // Angle step in radians
  const angleStep = (2 * Math.PI) / nAxes;

  // Generate radar points based on XP (normalized)
  const getPoints = (stats) => {
    // Determine max XP across all categories to scale properly. Cap minimum denominator at 100 to avoid dividing by zero.
    const maxXP = Math.max(...dbCategories.map(c => stats.sectionalXp?.[c] || 0), 100); 
    
    return dbCategories.map((c, i) => {
      // Start at top (-90 degrees)
      const angle = i * angleStep - (Math.PI / 2);
      const val = (stats.sectionalXp?.[c] || 0) / maxXP;
      // Provide a small minimum radius so it doesn't entirely collapse to a dot
      const radius = 80 * Math.max(0.15, val); 
      return `${100 + radius * Math.cos(angle)},${100 + radius * Math.sin(angle)}`;
    }).join(" ");
  };

  const peerPoints = getPoints(data.peer);
  const mePoints = getPoints(data.me);

  return (
    <Card title="Subject Proficiency" subtitle="Skill distribution based on Sectional XP">
      <div className="relative flex flex-col items-center justify-center flex-1 py-6">
        <svg viewBox="0 0 200 200" className="w-72 h-72 md:w-80 md:h-80 overflow-visible">
          {/* Concentric rings */}
          {[0.25, 0.5, 0.75, 1].map((scale) => (
            <circle key={scale} cx="100" cy="100" r={80 * scale} fill="none" stroke="#E5E7EB" strokeDasharray="4 4" />
          ))}
          
          {/* Axis lines and category labels */}
          {dbCategories.map((c, i) => {
            const angle = i * angleStep - (Math.PI / 2);
            const x2 = 100 + 80 * Math.cos(angle);
            const y2 = 100 + 80 * Math.sin(angle);
            
            // Push text slightly further out than the maximum radius
            const textRadius = 95;
            const tx = 100 + textRadius * Math.cos(angle);
            const ty = 100 + textRadius * Math.sin(angle);
            
            // Determine text anchor based on X position to prevent clipping
            let anchor = "middle";
            if (Math.abs(tx - 100) > 10) {
              anchor = tx > 100 ? "start" : "end";
            }

            return (
              <React.Fragment key={c}>
                <line x1="100" y1="100" x2={x2} y2={y2} stroke="#E5E7EB" />
                <text x={tx} y={ty + 4} textAnchor={anchor} className="text-[10px] fill-gray-500 font-bold">
                  {c}
                </text>
              </React.Fragment>
            );
          })}

          <polygon points={peerPoints} fill="#4c35b5" fillOpacity="0.1" stroke="#4c35b5" strokeWidth="2.5" />
          <polygon points={mePoints} fill="none" stroke="#b8b0e8" strokeWidth="2.5" strokeDasharray="4 2" />
        </svg>

        <div className="flex gap-8 mt-12">
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-[#4c35b5]" />
            <span className="text-sm font-bold text-gray-700">{data.peer.username}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full border-2 border-[#b8b0e8]" />
            <span className="text-sm font-bold text-gray-700">You</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

// --- Daily Focus Intensity (Line) ---
const DailyFocusIntensity = ({ data }) => {
  if (!data) return null;

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const weekDays = [...days, ...days];

  // Use heatmap data (all 14 days)
  const peerHeatmap = data.peer.heatmap || [1, 2, 2, 3, 1, 0, 4, 2, 3, 1, 1, 2, 4, 0];
  const meHeatmap = data.me.heatmap || [2, 1, 3, 2, 4, 2, 1, 3, 1, 2, 1, 0, 1, 3];

  const peerWeek = peerHeatmap.slice(0, 14);
  const meWeek = meHeatmap.slice(0, 14);

  // SVG Chart Dimensions
  const w = 400;
  const h = 160;

  // Map values to coordinates
  const mapPoints = (arr) => arr.map((val, i) => ({
    x: (i / 13) * w,
    y: h - (val / 4) * h
  }));

  // Generate smooth cubic bezier curve
  const getSmoothPath = (points) => {
    if (points.length === 0) return "";
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const cx = (p1.x + p2.x) / 2;
      path += ` C ${cx},${p1.y} ${cx},${p2.y} ${p2.x},${p2.y}`;
    }
    return path;
  };

  const peerPath = getSmoothPath(mapPoints(peerWeek));
  const mePath = getSmoothPath(mapPoints(meWeek));

  const peerAvg = Math.round((peerWeek.reduce((a, b) => a + b, 0) / (14 * 4)) * 100);
  const meAvg = Math.round((meWeek.reduce((a, b) => a + b, 0) / (14 * 4)) * 100);

  return (
    <Card title="Daily Focus Intensity" subtitle="Cognitive load tracking over the last 14 days" badge="14-DAY VIEW">
      <div className="flex-1 flex flex-col justify-between mt-6">
        
        {/* Chart Area */}
        <div className="relative w-full h-[220px]">
          {/* Axis decorations mimicking design L-shape */}
          <div className="absolute left-0 top-0 bottom-6 w-3 bg-[#f1f3f9] rounded-sm" />
          <div className="absolute left-3 right-0 top-0 h-3 bg-[#f1f3f9] rounded-sm" />
          
          <div className="absolute inset-0 pb-8 pl-4 pt-4 pr-2">
            <svg viewBox={`0 -10 ${w} ${h + 20}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <path d={mePath} fill="none" stroke="#b8b0e8" strokeWidth="4" strokeDasharray="8 6" strokeLinecap="round" strokeLinejoin="round" />
              <path d={peerPath} fill="none" stroke="#4c35b5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="absolute bottom-0 left-4 right-2 flex justify-between">
            {weekDays.map((day, i) => (
              <span key={i} className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest ${i % 2 === 0 ? '' : 'invisible'}`}>{day}</span>
            ))}
          </div>
        </div>

        {/* Avg Intensity Boxes */}
        <div className="grid grid-cols-2 gap-6 mt-8">
          <div className="bg-[#f4f7f9] p-5 rounded-2xl border border-gray-50 flex flex-col justify-center">
            <span className="text-[11px] font-medium text-gray-500 mb-2">Avg. Daily Intensity</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#4c35b5]">{peerAvg}%</span>
              <span className="text-xs font-semibold text-gray-500 truncate" title={data.peer.username}>{data.peer.username}</span>
            </div>
          </div>
          <div className="bg-[#f4f7f9] p-5 rounded-2xl border border-gray-50 flex flex-col justify-center">
            <span className="text-[11px] font-medium text-gray-500 mb-2">Avg. Daily Intensity</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#b8b0e8]">{meAvg}%</span>
              <span className="text-xs font-semibold text-gray-500 truncate" title="You">You</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// --- Behavioral Insights ---
const BehavioralInsights = ({ data }) => {
  if (!data) return null;

  const getInsight = () => {
    const diffMinutes = (data.me.focusMinutes || 0) - (data.peer.focusMinutes || 0);
    const formatDuration = (mins) => {
      const m = Math.abs(mins);
      if (m === 0) return '0 minutes';
      const h = Math.floor(m / 60);
      const r = m % 60;
      return h > 0 ? (r > 0 ? `${h}h ${r}m` : `${h} hours`) : `${m} minutes`;
    };
    if (diffMinutes > 0) {
        return {
            title: "Focus Champion",
            description: `You have ${formatDuration(diffMinutes)} more focus time than ${data.peer.username}. Keep up the deep work!`,
            icon: <Timer className="w-8 h-8" />,
            variant: "primary"
        };
    } else if (diffMinutes < 0) {
        return {
            title: "Focus Gap",
            description: `${data.peer.username} has accumulated ${formatDuration(diffMinutes)} more focus time. Try scheduling more study sessions!`,
            icon: <Timer className="w-8 h-8" />,
            variant: "secondary"
        };
    }
    return {
        title: "Evenly Matched",
        description: `You and ${data.peer.username} have logged the same amount of focus time. Keep the competition alive!`,
        icon: <Timer className="w-8 h-8" />,
        variant: "secondary"
    };
  };

  const getNotesInsight = () => {
    if (data.me.totalNotes > data.peer.totalNotes) {
        return {
            title: "Diligent Note Taker",
            description: `You've created ${data.me.totalNotes} notes compared to their ${data.peer.totalNotes}. Your documentation is superior.`,
            icon: <FileText className="w-8 h-8" />,
            variant: "secondary"
        };
    } else {
        return {
            title: "Note Taking Gap",
            description: `${data.peer.username} relies heavily on notes (${data.peer.totalNotes}). Consider taking more notes during your sessions.`,
            icon: <FileText className="w-8 h-8" />,
            variant: "secondary"
        };
    }
  };

  const getPomodoroInsight = () => {
      const diff = Math.abs(data.me.totalPomodoros - data.peer.totalPomodoros);
      const more = data.me.totalPomodoros > data.peer.totalPomodoros;
      return {
          title: "Pomodoro Technique",
          description: `You've completed ${data.me.totalPomodoros} Pomodoro sessions, which is ${diff} ${more ? 'more' : 'fewer'} than ${data.peer.username}.`,
          icon: <BrainCircuit className="w-8 h-8" />,
          variant: "secondary"
      }
  };

  const insights = [
    { id: 1, ...getInsight() },
    { id: 2, ...getNotesInsight() },
    { id: 3, ...getPomodoroInsight() }
  ];

  return (
    <section className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {insights.map((item) => (
        <div
          key={item.id}
          className={`p-10 rounded-[40px] border transition-all duration-300 hover:scale-[1.02] ${
            item.variant === 'primary'
              ? "bg-[#4c35b5] text-white border-[#4c35b5] shadow-xl shadow-purple-100"
              : "bg-white text-gray-900 border-gray-100 shadow-sm"
          }`}
        >
          <div className={`mb-8 ${item.variant === 'primary' ? "text-white" : "text-[#4c35b5]"}`}>
            {item.icon}
          </div>
          <h3 className="text-2xl font-bold tracking-tight mb-4">
            {item.title}
          </h3>
          <p className={`text-base leading-relaxed ${
            item.variant === 'primary' ? "text-purple-100" : "text-gray-500"
          }`}>
            {item.description}
          </p>
        </div>
      ))}
    </section>
  );
};

const ComparisonCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="bg-white p-16 md:p-20 rounded-[40px] border border-gray-100 shadow-sm mt-10 flex flex-col items-center text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight max-w-2xl">
        Ready to Close the Gap?
      </h2>
      
      <p className="text-gray-600 text-lg md:text-xl mt-6 mb-12 max-w-3xl leading-relaxed">
        Start a Focus Session to remove the gap, then in the Schedule Optimization tab, apply the suggested changes to align your study blocks with your natural circadian rhythm.
      </p>

      <div className="flex flex-col sm:flex-row gap-6">
        <button onClick={() => navigate('/schedule')} className="flex items-center gap-3 px-10 py-5 rounded-full text-white bg-[#5D2ECC] hover:bg-[#4c35b5] transition-all hover:scale-105 shadow-xl shadow-purple-200 text-base font-bold">
          <Play className="w-6 h-6 fill-current" />
          Apply Schedule Optimization
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-3 px-10 py-5 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-base font-bold">
          <FileText className="w-6 h-6 text-gray-500" />
          Download PDF Report
        </button>
      </div>
    </section>
  );
};


// --- Full Page Layout ---
const PeerComparisonPage = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const userId = searchParams.get('userId');
      const peerId = searchParams.get('peerId');
      
      if (!userId || !peerId) {
        setError("Please select a peer from the Peer Comparison tab (above Your Standing) on the Leaderboard page to generate a report.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch both comparison data and available categories concurrently
        const [resCompare, resCategories] = await Promise.all([
          api.get(`/leaderboards/compare/${userId}/${peerId}`),
          api.get('/leaderboards/sectional/categories')
        ]);
        
        setData(resCompare.data);
        const names = (resCategories.data || []).filter(Boolean);
        setDbCategories(names.length > 0 ? names : ["Computer Science", "Mathematics", "Physics"]); // Fallback just in case
        
      } catch (err) {
        console.error("Failed to fetch peer comparison data", err);
        setError("Failed to load peer comparison data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfdfe] font-sans">
          <Navbar />
          
          <div className="flex flex-1">
            <Sidebar />

        <main className="p-4 sm:p-8 md:p-16 max-w-[1600px] mx-auto w-full">
          {loading && (
             <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D2ECC]"></div>
             </div>
          )}

          {error && !loading && (
             <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-4">
                <AlertCircle />
                <p className="font-medium">{error}</p>
             </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Header Section */}
              <PeerComparisonTitle data={data} />
              
              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
                <div className="lg:col-span-5">
                  <SubjectProficiency data={data} dbCategories={dbCategories} />
                </div>
                <div className="lg:col-span-7">
                  <DailyFocusIntensity data={data} />
                </div>
              </div>

              {/* Behavioral Insights Cards */}
              <BehavioralInsights data={data} />

              {/* Weekly Focus Heatmap Section */}
              <WeeklyFocusHeatmap data={data} />

              {/* CTA Section */}
              <ComparisonCTA />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default PeerComparisonPage;