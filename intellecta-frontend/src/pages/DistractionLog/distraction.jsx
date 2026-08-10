import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  ChevronDown, 
  ExternalLink, 
  TimerOff, 
  Zap, 
  History, 
  Globe,
  Users,
  Utensils,
  Bell,
  //Lightbulb,
  MoreVertical,
  Filter,
  ArrowRight,
  Mail,
  Phone,
  LayoutGrid
} from 'lucide-react';

import Sidebar from '../../components/dashboard/StudentSidebar';
import Navbar from '../../components/dashboard/Navbar';
import api from '../../services/api';
import { getUserId } from '../../utils/auth';

// --- Trigger categorization (Bugs 2.1.1, 2.1.4, 2.3.3) ---------------------
// Single client-side scheme used for the Triggers card, the Filter Logs
// dropdown, and the log-table category chips. Mirrors the backend's
// AdminService.categorizeDistraction keyword buckets.

const categorizeReason = (reason) => {
  const l = (reason || '').toLowerCase();
  if (l.includes('social') || l.includes('video') || l.includes('watch') ||
      l.includes('instagram') || l.includes('reel') || l.includes('twitter') ||
      l.includes('tiktok') || l.includes('youtube') || l.includes('scroll')) {
    return 'Social Media';
  }
  if (l.includes('phone') || l.includes('notification') || l.includes('message') ||
      l.includes('chat') || l.includes('whatsapp') || l.includes('call')) {
    return 'Notifications';
  }
  if (l.includes('break') || l.includes('noise') || l.includes('tired') ||
      l.includes('snack') || l.includes('hunger') || l.includes('hungry') ||
      l.includes('chai') || l.includes('eat') || l.includes('food')) {
    return 'Physical Breaks';
  }
  return 'Other Distractions';
};

const TRIGGER_BUCKETS = {
  'Social Media':       { icon: Globe,       bar: 'bg-[#4F27B8]', chip: 'bg-[#4F27B8]/10 text-[#4F27B8]' },
  'Notifications':      { icon: Bell,        bar: 'bg-[#3B82F6]', chip: 'bg-[#3B82F6]/10 text-[#3B82F6]' },
  'Physical Breaks':    { icon: Utensils,    bar: 'bg-[#F97316]', chip: 'bg-[#F97316]/10 text-[#F97316]' },
  'Other Distractions': { icon: MoreVertical, bar: 'bg-[#9CA3AF]', chip: 'bg-[#9CA3AF]/10 text-[#9CA3AF]' },
};

// Bug 2.3.2: serialize/parse range inputs via LOCAL date parts — using
// toISOString() shifts dates by the UTC offset and `new Date('YYYY-MM-DD')`
// parses as UTC midnight, which silently drops one day from the range.
const toLocalDateInput = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const fromLocalDateInput = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};

// --- Components ---

const TriggerItem = ({ icon: Icon, label, percentage, barClass, chipClass }) => (
  <div className="group cursor-default">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        {/* Bug 2.1.2: chip uses a real bg tint (e.g. bg-[#4F27B8]/10) + a text color */}
        <div className={`p-2 rounded-xl ${chipClass}`}>
          <Icon size={18} />
        </div>
        <span className="text-[15px] font-semibold text-[#1A1D1F] tracking-tight">{label}</span>
      </div>
      <span className="text-[15px] font-bold text-[#1A1D1F] tabular-nums">{percentage}%</span>
    </div>
    <div className="w-full h-3 bg-[#F4F6F8] rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-1000 ease-out ${barClass}`} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

const WeeklyBarChart = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.value));
  const hasData = data.some(d => d.value > 0);

  const yTicks = 5;
  const safeMax = maxVal || 1;

  // Bug 2.2.3: all-zero days render a proper empty state instead of stubs
  if (!hasData) {
    return (
      <div className="relative flex-1 w-full mt-4 flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-100">
        <div className="text-center">
          <p className="text-sm font-black text-[#9CA3AF] uppercase tracking-widest">
            No leaks in this period
          </p>
          <p className="text-[10px] font-medium text-[#C4C9D1] mt-2">
            Log a distraction to start the trend.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 w-full mt-4 flex flex-row">
      {/* Y-axis labels */}
      <div className="flex flex-col justify-between pb-10 pr-4 shrink-0 text-right min-w-[40px]">
        {[...Array(yTicks)].map((_, i) => {
          const val = Math.round((safeMax / (yTicks - 1)) * (yTicks - 1 - i));
          return (
            <span key={i} className="text-[10px] font-bold text-[#9CA3AF] tabular-nums whitespace-nowrap leading-none">
              {val}m
            </span>
          );
        })}
      </div>

      {/* Chart area */}
      <div className="relative flex-1 flex flex-col min-w-0">
        {/* Bars and Grid Lines Container */}
        <div className="relative flex-1 flex items-end justify-between gap-2 md:gap-4 px-2">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[...Array(yTicks)].map((_, i) => (
              <div key={i} className="w-full border-t border-gray-100 border-dashed first:border-none" />
            ))}
          </div>

          {/* Actual Bars */}
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center group relative z-10 h-full justify-end min-w-0">
              <div className="relative w-full flex flex-col items-center justify-end h-full">
                <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-all bg-[#1A1D1F] text-white text-[10px] font-bold uppercase tracking-widest py-2 px-3 rounded-xl mb-2 shadow-2xl translate-y-1 group-hover:translate-y-0 whitespace-nowrap z-50 pointer-events-none text-center">
                  <div className="text-[#9CA3AF] mb-1">{item.day} Breakdown</div>
                  <div>{item.value}m lost • {item.count} leaks</div>
                </div>
                <div
                  className="w-full max-w-[48px] bg-[#4F27B8] rounded-t-xl transition-all duration-300 hover:bg-[#3b1d8a] hover:scale-x-105 shadow-sm"
                  style={{ height: `${(item.value / safeMax) * 100}%`, minHeight: '4px' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* X-axis Labels */}
        <div className="flex justify-between items-center gap-2 md:gap-4 px-2 mt-5">
          {data.map((item, index) => (
            <div key={index} className="flex-1 text-center min-w-0">
              <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em] block truncate">
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main Dashboard ---

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    return { start, end, label: 'Last 7 Days' };
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [logData, setLogData] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const userId = getUserId();
        if (!userId) { navigate('/login'); return; }
        const res = await api.get(`/distractions/user/${userId}/logs`);
        const formattedLogs = res.data.map((item) => {
           const label = item.reason || "Unknown";
           const lowerLabel = label.toLowerCase();
           let icon = Zap, color = 'text-[#4F27B8]';

           if (lowerLabel.includes('social')) {
              icon = Globe; color = 'text-[#4F27B8]';
           } else if (lowerLabel.includes('family') || lowerLabel.includes('friend')) {
              icon = Users; color = 'text-[#7C3AED]';
           } else if (lowerLabel.includes('hunger') || lowerLabel.includes('food')) {
              icon = Utensils; color = 'text-[#F97316]';
           } else if (lowerLabel.includes('notification') || lowerLabel.includes('phone')) {
              icon = Bell; color = 'text-[#3B82F6]';
           } else if (lowerLabel === 'others') {
              icon = MoreVertical; color = 'text-[#9CA3AF]';
           }

           const dateObj = new Date(item.loggedAt);
           const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

           const rawImpact = item.impact || "MODERATE";
           const impactLabel = rawImpact.toUpperCase();
           let impactColor = "bg-gray-50 text-gray-600 border-gray-100";
           
           if (impactLabel === "SEVERE" || impactLabel === "HIGH") {
               impactColor = "bg-red-50 text-red-600 border-red-100";
           } else if (impactLabel === "MODERATE") {
               impactColor = "bg-orange-50 text-orange-600 border-orange-100";
           } else if (impactLabel === "LOW" || impactLabel === "MINOR") {
               impactColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
           }

           // Bug 2.3.1: parse an explicit minutes value; null durations show "—"
           // and never contribute to time sums or averages.
           let durationMins = null;
           if (item.duration) {
             const parsed = parseInt(item.duration.replace(/[^0-9]/g, ''), 10);
             if (!Number.isNaN(parsed)) durationMins = parsed;
           }
           const durationStr = durationMins !== null ? `${durationMins} min` : "—";

           const dateObj2 = new Date(item.loggedAt);
           const dateStr = dateObj2.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

           return {
             id: item.id,
             time: timeStr,
             date: dateStr,
             rawDate: item.loggedAt,
             duration: durationStr,
             durationMins,
             category: {
               label,
               bucket: categorizeReason(label),
               icon,
               color
             },
             impact: { label: impactLabel, color: impactColor }
           };
        });
        const sorted = formattedLogs.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
        setLogData(sorted);
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    };
    fetchLogs();
  }, []);

  const filteredByDateLogs = React.useMemo(() => {
    return logData.filter(row => {
      if (!row.rawDate) return false;
      const d = new Date(row.rawDate);
      const start = new Date(dateRange.start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999);
      return d >= start && d <= end;
    });
  }, [logData, dateRange]);

  // Bug 2.3.3: filter by trigger bucket (category), not raw reason text
  const filteredLogData = selectedCategory === 'All' 
    ? filteredByDateLogs 
    : filteredByDateLogs.filter(row => row.category.bucket === selectedCategory);

  // Bug 2.4.1: all three cards read from the same selected date range
  const timeLostInRange = React.useMemo(() => {
    const totalMins = filteredByDateLogs.reduce((sum, row) => sum + (row.durationMins || 0), 0);
    if (totalMins === 0) return '0m';
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [filteredByDateLogs]);

  const distractionsInRange = filteredByDateLogs.length;

  const avgDistractionTime = React.useMemo(() => {
    // Bug 2.3.1: entries without a duration are excluded from the average
    const withDuration = filteredByDateLogs.filter(row => row.durationMins != null);
    if (withDuration.length === 0) return '0m';
    const totalMins = withDuration.reduce((sum, row) => sum + row.durationMins, 0);
    const avg = Math.round(totalMins / withDuration.length);
    if (avg === 0) return '< 1m';
    const h = Math.floor(avg / 60);
    const m = avg % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [filteredByDateLogs]);


  // Bug 2.1.1/2.4.1: triggers aggregate the selected date range's entries
  // by centralized bucket, so chips, the Triggers card, and the log-table
  // categories all describe the same sets of logs.
  const triggerData = React.useMemo(() => {
    const totalCount = filteredByDateLogs.length;
    if (totalCount === 0) return [];

    const counts = filteredByDateLogs.reduce((acc, row) => {
      const bucket = row.category.bucket;
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([bucket, count]) => {
        const meta = TRIGGER_BUCKETS[bucket] || TRIGGER_BUCKETS['Other Distractions'];
        return {
          icon: meta.icon,
          label: bucket,
          percentage: Math.round((count / totalCount) * 100),
          barClass: meta.bar,
          chipClass: meta.chip,
          count,
        };
      })
      .sort((a, b) => b.count - a.count); // Most frequent first
  }, [filteredByDateLogs]);

  // Bug 2.2.2: weekly trend is built from the selected date range's entries
  // (filteredByDateLogs), not the unfiltered logData — the chart now tracks
  // the same data that the stat cards and table show.
  const weeklyTrend = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { day: days[d.getDay()], dateStr: d.toDateString(), value: 0, count: 0 };
    });

    filteredByDateLogs.forEach(row => {
      if (!row.rawDate) return;
      const entryDateStr = new Date(row.rawDate).toDateString();
      const slot = result.find(r => r.dateStr === entryDateStr);
      if (slot) {
        slot.value += row.durationMins || 0;
        slot.count += 1;
      }
    });

    return result;
  }, [filteredByDateLogs]);

  return (
    <div className="bg-[#F8F9FB] min-h-screen font-sans selection:bg-purple-100 antialiased text-[#1A1D1F]">
      <style>{`
        @import url('https://rsms.me/inter/inter.css');
        html { font-family: 'Inter', sans-serif; }
      `}</style>

      <Navbar />

      <div className="flex flex-1">
        
        <Sidebar />
      
          <main className="flex-1 min-w-0 px-4 md:px-4 lg:px-20 max-w-[1500px] mx-auto py-8 space-y-12">
          
          {/* Header Controls */}
          <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#4F27B8] font-bold text-xs uppercase tracking-[0.15em] mb-1">
                  <LayoutGrid size={16} />
                  <span>Performance Insights</span>
              </div>
              <h1 className="text-5xl font-[800] text-[#1A1D1F] tracking-[-0.03em] leading-tight">Distraction Analytics</h1>
              <p className="text-[#6F767E] text-xl font-medium tracking-tight">Deep-dive into your cognitive leaks and focus sessions.</p>
            </div>

            <div className="flex items-center mb-1.5 relative">
              <button 
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)} 
                className="flex items-center gap-3 neu-btn bg-transparent transition-all px-4 py-2.5 rounded-xl group"
              >
                <Calendar size={18} className="text-[#4F27B8] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-[#1A1D1F] tabular-nums">
                  {dateRange.label || `${dateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </span>
                <ChevronDown size={14} className={`text-[#6F767E] transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDatePickerOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 neu z-50 p-4 space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: 'Today', days: 0 },
                      { label: 'Last 7 Days', days: 6 },
                      { label: 'Last 30 Days', days: 29 }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          const end = new Date();
                          const start = new Date();
                          start.setDate(end.getDate() - preset.days);
                          setDateRange({ start, end, label: preset.label });
                          setIsDatePickerOpen(false);
                        }}
                        className={`text-left px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${dateRange.label === preset.label ? 'bg-purple-50 text-[#4F27B8]' : 'text-[#1A1D1F] hover:bg-gray-50'}`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-gray-50 space-y-3">
                    <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Custom Range</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#6F767E] ml-1">Start</label>
                        <input 
                          type="date" 
                          className="w-full text-[12px] p-2 rounded-lg border border-gray-100"
                          // Bug 2.3.2: local date parts, no toISOString
                          value={dateRange.start ? toLocalDateInput(dateRange.start) : ''}
                          onChange={(e) => e.target.value && setDateRange(prev => ({ ...prev, start: fromLocalDateInput(e.target.value), label: null }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#6F767E] ml-1">End</label>
                        <input 
                          type="date" 
                          className="w-full text-[12px] p-2 rounded-lg border border-gray-100"
                          // Bug 2.3.2: local date parts, no toISOString
                          value={dateRange.end ? toLocalDateInput(dateRange.end) : ''}
                          onChange={(e) => e.target.value && setDateRange(prev => ({ ...prev, end: fromLocalDateInput(e.target.value), label: null }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Top Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Time Lost', value: timeLostInRange, sub: `${distractionsInRange} distraction${distractionsInRange !== 1 ? 's' : ''} in range`, icon: TimerOff, color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Prime Trigger', value: triggerData.length > 0 ? triggerData[0].label : '-', sub: `${triggerData.length > 0 ? triggerData[0].count : 0} occurrences`, icon: Zap, color: 'text-[#4F27B8]', bg: 'bg-purple-50' },
              { label: 'Avg. Distraction', value: avgDistractionTime, sub: (() => {
                  if (filteredByDateLogs.length === 0) return 'no data yet';
                  const counts = filteredByDateLogs.reduce((acc, row) => {
                    const k = row.impact?.label || 'MODERATE';
                    acc[k] = (acc[k] || 0) + 1;
                    return acc;
                  }, {});
                  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'MODERATE';
                  return `mostly ${dominant.toLowerCase()} impact`;
                })(), icon: History, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            ].map((stat, i) => (
              <div key={i} className="neu p-7 transition-all group min-h-[160px] flex flex-col justify-between hover:scale-[1.02]">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className={`p-4 rounded-2xl shrink-0 ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}><stat.icon size={28} /></div>
                  <span className={`text-[11px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider ml-auto whitespace-nowrap ${stat.color} ${stat.bg} border border-current border-opacity-10`}>{stat.sub}</span>
                </div>
                <div>
                  <h3 className="text-[11px] font-bold text-[#6F767E] uppercase tracking-[0.12em] mb-2">{stat.label}</h3>
                  <p className="text-4xl font-[800] text-[#1A1D1F] tracking-tight tabular-nums">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 neu p-6 h-[375px] flex flex-col">
              <div className="mb-4">
                  <h2 className="text-2xl font-bold text-[#1A1D1F] tracking-tight">Triggers</h2>
              </div>
              <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar pr-3">
                {triggerData.length > 0 ? (
                  triggerData.map((item, idx) => (<TriggerItem key={idx} {...item} />))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                    <div className="bg-purple-50 p-4 rounded-full mb-4">
                      <Zap size={24} className="text-[#4F27B8] opacity-50" />
                    </div>
                    <span className="text-[#1A1D1F] font-bold text-lg mb-1">No Triggers Found</span>
                    <span className="text-[#6F767E] text-sm font-medium">Log a distraction to start tracking!</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-7 neu p-6 h-[375px] flex flex-col">
              <div className="flex flex-row justify-between items-center mb-2 gap-4">
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold text-[#1A1D1F] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                    Focus Leaks Trend <span className="text-[#6F767E] text-sm font-medium ml-2">(Last 7 Days)</span>
                  </h2>
                  <p className="text-xs text-[#9CA3AF] font-bold uppercase tracking-widest mt-1 truncate">Click a bar to explore data</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#4F27B8]" /><span className="text-[9px] font-bold text-[#1A1D1F] uppercase tracking-widest whitespace-nowrap">Minutes Lost</span></div>
                  {/* Bug 2.2.1: phantom "Baseline" legend removed — the chart has only one series */}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <WeeklyBarChart data={weeklyTrend} />
              </div>
            </div>
          </div>

          {/* Log Table */}
          <section className="neu overflow-hidden">
            <div className="px-10 py-8 flex items-center justify-between border-b border-gray-50">
              <h2 className="text-2xl font-bold text-[#1A1D1F] tracking-tight">Distraction Log</h2>
              <div className="flex items-center gap-4 relative">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 px-5 py-3 hover:bg-gray-50 rounded-xl transition-colors text-[#6F767E] border border-gray-100 font-bold text-xs uppercase tracking-widest">
                  <Filter size={18} />
                  {selectedCategory === 'All' ? 'Filter Logs' : selectedCategory}
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 neu z-50 overflow-hidden">
                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                      {/* Bug 2.1.1/2.3.3: dropdown options are the centralized trigger buckets */}
                      {['All', ...Object.keys(TRIGGER_BUCKETS)].map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm font-semibold hover:bg-gray-50 transition-colors ${selectedCategory === cat ? 'text-[#4F27B8] bg-purple-50/50' : 'text-[#1A1D1F]'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full overflow-x-auto min-h-[200px] max-h-[350px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse table-fixed lg:table-auto">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#F9FAFB] text-[10px] font-bold text-[#6F767E] uppercase tracking-[0.12em] shadow-sm">
                  <th className="px-4 lg:px-6 py-4 w-[120px]">Date</th>
                  <th className="px-4 lg:px-6 py-4 w-[100px]">Time</th>
                  <th className="px-4 lg:px-6 py-4 w-[90px]">Duration</th>
                  <th className="px-4 lg:px-6 py-4 w-[140px]">Category</th>
                  <th className="px-4 lg:px-6 py-4 text-right w-[110px]">Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-4 lg:px-6 py-5 text-[13px] font-semibold text-[#6F767E] whitespace-nowrap">{row.date}</td>
                    <td className="px-4 lg:px-6 py-5 text-[14px] font-bold text-[#1A1D1F] tabular-nums whitespace-nowrap">
                      {row.time.split(' ')[0]} <span className="text-[10px] font-medium text-[#9CA3AF]">{row.time.split(' ')[1]}</span>
                    </td>
                    <td className="px-4 lg:px-6 py-5 text-[14px] text-[#1A1D1F] font-semibold whitespace-nowrap">{row.duration}</td>
                    <td className="px-4 lg:px-6 py-5">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                      {/* Bug 2.3.3: chip is styled from the row's trigger bucket, so
                          table chips and trigger-card bars share colors/labels */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg ${TRIGGER_BUCKETS[row.category.bucket].chip} text-[11px] font-bold`}>
                        <row.category.icon size={13} />
                        {row.category.label}
                      </span>
                    </div>
                    </td>
                    <td className="px-4 lg:px-6 py-5 text-right">
                      <span className={`${row.impact.color} border text-[10px] font-bold px-3 py-1 rounded-lg uppercase`}>
                        {row.impact.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;