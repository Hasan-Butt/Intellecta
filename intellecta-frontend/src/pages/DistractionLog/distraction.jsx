import React, { useState, useEffect } from 'react';
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

// --- Components ---

const TriggerItem = ({ icon: Icon, label, percentage, colorClass }) => (
  <div className="group cursor-default">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${colorClass.replace('bg-', 'bg-opacity-10 text-')}`}>
          <Icon size={18} />
        </div>
        <span className="text-[15px] font-semibold text-[#1A1D1F] tracking-tight">{label}</span>
      </div>
      <span className="text-[15px] font-bold text-[#1A1D1F] tabular-nums">{percentage}%</span>
    </div>
    <div className="w-full h-3 bg-[#F4F6F8] rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

const WeeklyBarChart = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.value));

  const handleBarClick = (item) => {
    // 1. Store the selected day so your /focus page can read it
    sessionStorage.setItem('selectedFocusDay', JSON.stringify(item));
    
    // 2. Standard navigation to your existing route
    window.location.href = '/focusSession';
  };

  const yTicks = 5;
  const safeMax = maxVal || 1;

  return (
    <div className="relative h-80 w-full mt-10 flex gap-2">
      {/* Y-axis labels */}
      <div className="flex flex-col justify-between items-end pb-12 pr-2 shrink-0">
        {[...Array(yTicks)].map((_, i) => {
          const val = Math.round((safeMax / (yTicks - 1)) * (yTicks - 1 - i));
          return (
            <span key={i} className="text-[10px] font-bold text-[#9CA3AF] tabular-nums whitespace-nowrap">
              {val}m
            </span>
          );
        })}
      </div>

      {/* Chart area */}
      <div className="relative flex-1 flex items-end justify-between gap-4 px-2">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-12">
          {[...Array(yTicks)].map((_, i) => (
            <div key={i} className="w-full border-t border-gray-100 border-dashed" />
          ))}
        </div>
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-5 group relative z-10 h-full justify-end">
            <div className="relative w-full flex flex-col items-center justify-end h-full">
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-[#1A1D1F] text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-lg mb-2 shadow-2xl translate-y-1 group-hover:translate-y-0 whitespace-nowrap">
                {item.value}m — Analyze {item.day}
              </div>
              <div
                onClick={() => handleBarClick(item)}
                className="w-full max-w-[48px] bg-[#4F27B8] rounded-t-xl transition-all duration-300 hover:bg-[#3b1d8a] cursor-pointer hover:scale-x-105 active:scale-95 shadow-sm"
                style={{ height: `${(item.value / safeMax) * 100}%`, minHeight: '6px' }}
              />
            </div>
            <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Dashboard ---

const AnalyticsDashboard = () => {
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
        const userId = localStorage.getItem('userId') || '2';
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

           const durationStr = item.duration 
             ? (item.duration.includes("min") ? item.duration : `${item.duration} min`) 
             : "5 min";

           const dateObj2 = new Date(item.loggedAt);
           const dateStr = dateObj2.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

           return {
             id: item.id,
             time: timeStr,
             date: dateStr,
             rawDate: item.loggedAt,
             duration: durationStr,
             category: { label, icon, color },
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

  const filteredLogData = selectedCategory === 'All' 
    ? filteredByDateLogs 
    : filteredByDateLogs.filter(row => row.category.label === selectedCategory);

  // Compute total minutes lost today from log entries
  const timeLostToday = React.useMemo(() => {
    const todayStr = new Date().toDateString();
    const totalMins = logData
      .filter(row => {
        // Always compute 'Today' card from raw logData for 'Today' specifically
        return row.rawDate && new Date(row.rawDate).toDateString() === todayStr;
      })
      .reduce((sum, row) => {
        const match = row.duration?.match(/(\d+)/);
        return sum + (match ? parseInt(match[1]) : 0);
      }, 0);
    if (totalMins === 0) return '0m';
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [logData]);

  const distractionsToday = React.useMemo(() => {
    const todayStr = new Date().toDateString();
    return logData.filter(row => row.rawDate && new Date(row.rawDate).toDateString() === todayStr).length;
  }, [logData]);

  const avgDistractionTime = React.useMemo(() => {
    // Use filteredByDateLogs for Average to match the selected range
    if (filteredByDateLogs.length === 0) return '0m';
    const totalMins = filteredByDateLogs.reduce((sum, row) => {
      const match = row.duration?.match(/(\d+)/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);
    const avg = Math.round(totalMins / filteredByDateLogs.length);
    if (avg === 0) return '< 1m';
    const h = Math.floor(avg / 60);
    const m = avg % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [filteredByDateLogs]);


  const triggerData = React.useMemo(() => {
    if (filteredByDateLogs.length === 0) return [];
    
    // Group by reason
    const counts = filteredByDateLogs.reduce((acc, row) => {
      const label = row.category.label;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    const totalCount = filteredByDateLogs.length;

    return Object.entries(counts)
      .map(([label, count], index) => {
        let icon, colorClass;
        const lowerLabel = label.toLowerCase();
        
        if (lowerLabel.includes('social')) {
           icon = Globe; colorClass = 'bg-[#4F27B8]';
        } else if (lowerLabel.includes('family') || lowerLabel.includes('friend')) {
           icon = Users; colorClass = 'bg-[#7C3AED]';
        } else if (lowerLabel.includes('hunger') || lowerLabel.includes('food')) {
           icon = Utensils; colorClass = 'bg-[#F97316]';
        } else if (lowerLabel.includes('notification') || lowerLabel.includes('phone')) {
           icon = Bell; colorClass = 'bg-[#3B82F6]';
        } else if (lowerLabel === 'others') {
           icon = MoreVertical; colorClass = 'bg-[#9CA3AF]';
        } else {
           const colors = ['bg-[#4F27B8]', 'bg-[#7C3AED]', 'bg-[#F97316]', 'bg-[#3B82F6]'];
           icon = Zap; colorClass = colors[index % colors.length];
        }

        return { 
          icon, 
          label, 
          percentage: Math.round((count / totalCount) * 100), 
          colorClass, 
          count 
        };
      })
      .sort((a, b) => b.count - a.count); // Most frequent first
  }, [filteredByDateLogs]);

  const weeklyTrend = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { day: days[d.getDay()], dateStr: d.toDateString(), value: 0 };
    });

    logData.forEach(row => {
      if (!row.rawDate) return;
      const entryDateStr = new Date(row.rawDate).toDateString();
      const slot = result.find(r => r.dateStr === entryDateStr);
      if (slot) {
        const match = row.duration?.match(/(\d+)/);
        slot.value += match ? parseInt(match[1]) : 0;
      }
    });

    return result;
  }, [logData]);

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
                className="flex items-center gap-3 bg-white hover:border-purple-200 transition-all px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm group"
              >
                <Calendar size={18} className="text-[#4F27B8] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-[#1A1D1F] tabular-nums">
                  {dateRange.label || `${dateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </span>
                <ChevronDown size={14} className={`text-[#6F767E] transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDatePickerOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-4 space-y-4">
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
                          value={dateRange.start.toISOString().split('T')[0]}
                          onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value), label: null }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#6F767E] ml-1">End</label>
                        <input 
                          type="date" 
                          className="w-full text-[12px] p-2 rounded-lg border border-gray-100"
                          value={dateRange.end.toISOString().split('T')[0]}
                          onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value), label: null }))}
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
              { label: 'Time Lost Today', value: timeLostToday, sub: `${distractionsToday} distraction${distractionsToday !== 1 ? 's' : ''} today`, icon: TimerOff, color: 'text-red-500', bg: 'bg-red-50' },
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
              <div key={i} className="bg-white p-7 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all group min-h-[180px] flex flex-col justify-between">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm min-h-[580px] flex flex-col">
              <div className="mb-10">
                  <h2 className="text-2xl font-bold text-[#1A1D1F] tracking-tight">Triggers</h2>
              </div>
              <div className="space-y-10 flex-1 overflow-y-auto custom-scrollbar pr-3">
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
            
            <div className="lg:col-span-7 bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm min-h-[580px] flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1D1F] tracking-tight">Focus Leaks Trend <span className="text-[#6F767E] text-sm font-medium ml-2">(Last 7 Days)</span></h2>
                  <p className="text-xs text-[#9CA3AF] font-bold uppercase tracking-widest mt-1">Click a bar to explore data</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#4F27B8]" /><span className="text-[10px] font-bold text-[#1A1D1F] uppercase tracking-widest">Hours Lost</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-200" /><span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Baseline</span></div>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <WeeklyBarChart data={weeklyTrend} />
              </div>
            </div>
          </div>

          {/* Log Table */}
          <section className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
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
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                      {['All', ...new Set(logData.map(item => item.category.label))].map((cat, idx) => (
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

            <div className="w-full overflow-x-auto min-h-[400px] max-h-[400px] overflow-y-auto custom-scrollbar">
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
                        <row.category.icon size={16} className={row.category.color} />
                        <span className="text-[14px] font-semibold text-[#1A1D1F]">{row.category.label}</span>
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