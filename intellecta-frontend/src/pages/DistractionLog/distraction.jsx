import React, { useState } from 'react';
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
  Lightbulb,
  MoreVertical,
  Filter,
  ArrowRight,
  Mail,
  Phone,
  LayoutGrid
} from 'lucide-react';

import Sidebar from '../../components/dashboard/StudentSidebar';
import Navbar from '../../components/dashboard/Navbar';

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

  return (
    <div className="relative h-80 w-full flex items-end justify-between gap-4 px-4 mt-10">
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-12">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-full border-t border-gray-100 border-dashed" />
        ))}
      </div>
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-5 group relative z-10 h-full justify-end">
          <div className="relative w-full flex flex-col items-center justify-end h-full">
            {/* Tooltip hint for desktop users */}
            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-[#1A1D1F] text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-lg mb-2 shadow-2xl translate-y-1 group-hover:translate-y-0 whitespace-nowrap">
                Analyze {item.day}
            </div>
            <div 
              onClick={() => handleBarClick(item)}
              className="w-full max-w-[48px] bg-[#4F27B8] rounded-t-xl transition-all duration-300 hover:bg-[#3b1d8a] cursor-pointer hover:scale-x-105 active:scale-95 shadow-sm"
              style={{ height: `${(item.value / maxVal) * 100}%`, minHeight: '6px' }}
            />
          </div>
          <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">{item.day}</span>
        </div>
      ))}
    </div>
  );
};

// --- Main Dashboard ---

const AnalyticsDashboard = () => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const logData = [
    { time: "09:42 AM", duration: "12 min", category: { label: "Social Media", icon: Globe, color: "text-[#4F27B8]" }, description: "Checking Instagram notifications.", context: "NEURO-ARCHITECTURE", impact: { label: "SEVERE", color: "bg-red-50 text-red-600 border-red-100" } },
    { time: "11:15 AM", duration: "05 min", category: { label: "Notifications", icon: Mail, color: "text-blue-500" }, description: "Clicked on Slack DM.", context: "GRANT WRITING", impact: { label: "MODERATE", color: "bg-orange-50 text-orange-600 border-orange-100" } },
    { time: "04:10 PM", duration: "18 min", category: { label: "Phone Call", icon: Phone, color: "text-emerald-500" }, description: "Unexpected delivery call.", context: "BRAINSTORMING", impact: { label: "SEVERE", color: "bg-red-50 text-red-600 border-red-100" } }
  ];

  const triggerData = [
    { icon: Globe, label: 'Social Media', percentage: 42, colorClass: 'bg-[#4F27B8]' },
    { icon: Users, label: 'Family', percentage: 28, colorClass: 'bg-[#7C3AED]' },
    { icon: Utensils, label: 'Physical Hunger', percentage: 18, colorClass: 'bg-[#F97316]' },
    { icon: Bell, label: 'Notifications', percentage: 12, colorClass: 'bg-[#3B82F6]' },
  ];

  const weeklyTrend = [
    { day: 'Mon', value: 65 }, { day: 'Tue', value: 45 }, { day: 'Wed', value: 95 },
    { day: 'Thu', value: 75 }, { day: 'Fri', value: 90 }, { day: 'Sat', value: 35 }, { day: 'Sun', value: 25 },
  ];

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

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)} 
                className="flex items-center gap-4 bg-white hover:border-purple-200 transition-all px-6 py-4 rounded-2xl border border-gray-200 shadow-sm group"
              >
                <Calendar size={20} className="text-[#4F27B8] group-hover:scale-110 transition-transform" />
                <span className="text-base font-semibold text-[#1A1D1F] tabular-nums">Oct 12 - Oct 19, 2023</span>
                <ChevronDown size={18} className={`text-[#6F767E] transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
              </button>
              <button className="bg-[#1A1D1F] hover:bg-black text-white px-8 py-4 rounded-2xl font-bold text-[15px] shadow-xl shadow-gray-200 transition-all flex items-center gap-3 tracking-wide">
                <ExternalLink size={18} />
                Export
              </button>
            </div>
          </section>

          {/* Top Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Time Lost Today', value: '1h 42m', sub: '+12% vs last wk', icon: TimerOff, color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Prime Trigger', value: 'Instagram', sub: '14 occurrences', icon: Zap, color: 'text-[#4F27B8]', bg: 'bg-purple-50' },
              { label: 'Recovery Latency', value: '18.5m', sub: '-4m improvement', icon: History, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
                <div className="flex justify-between items-start mb-8">
                  <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}><stat.icon size={28} /></div>
                  <span className={`text-[11px] font-bold px-3.5 py-1.5 rounded-xl uppercase tracking-wider ${stat.color} ${stat.bg} border border-current border-opacity-10`}>{stat.sub}</span>
                </div>
                <h3 className="text-[11px] font-bold text-[#6F767E] uppercase tracking-[0.12em] mb-2">{stat.label}</h3>
                <p className="text-4xl font-[800] text-[#1A1D1F] tracking-tight tabular-nums">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Main Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-bold text-[#1A1D1F] tracking-tight">Triggers</h2>
                  <button className="text-[#6F767E] hover:text-[#1A1D1F] transition-colors"><MoreVertical size={24}/></button>
              </div>
              <div className="space-y-9">{triggerData.map((item, idx) => (<TriggerItem key={idx} {...item} />))}</div>
            </div>
            
            <div className="lg:col-span-7 bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1D1F] tracking-tight">Focus Leaks Trend</h2>
                  <p className="text-xs text-[#9CA3AF] font-bold uppercase tracking-widest mt-1">Click a bar to explore data</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#4F27B8]" /><span className="text-[10px] font-bold text-[#1A1D1F] uppercase tracking-widest">Hours Lost</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-200" /><span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Baseline</span></div>
                </div>
              </div>
              <WeeklyBarChart data={weeklyTrend} />
            </div>
          </div>

          {/* Log Table */}
          <section className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
            <div className="px-10 py-8 flex items-center justify-between border-b border-gray-50">
              <h2 className="text-2xl font-bold text-[#1A1D1F] tracking-tight">Distraction Log</h2>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-5 py-3 hover:bg-gray-50 rounded-xl transition-colors text-[#6F767E] border border-gray-100 font-bold text-xs uppercase tracking-widest">
                  <Filter size={18} />
                  Filter Logs
                </button>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] text-[11px] font-bold text-[#6F767E] uppercase tracking-[0.15em]">
                    <th className="px-10 py-5">Time</th>
                    <th className="px-10 py-5">Duration</th>
                    <th className="px-10 py-5">Category</th>
                    <th className="px-10 py-5">Description</th>
                    <th className="px-10 py-5">Context</th>
                    <th className="px-10 py-5 text-right">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-all">
                      <td className="px-10 py-7 text-[15px] font-bold text-[#1A1D1F] tabular-nums">
                        {row.time.split(' ')[0]} <span className="text-xs font-medium text-[#9CA3AF] ml-1">{row.time.split(' ')[1]}</span>
                      </td>
                      <td className="px-10 py-7 text-[15px] text-[#1A1D1F] font-semibold tabular-nums">{row.duration}</td>
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-3">
                          <row.category.icon size={18} className={row.category.color} />
                          <span className="text-[15px] font-semibold text-[#1A1D1F] tracking-tight">{row.category.label}</span>
                        </div>
                      </td>
                      <td className="px-10 py-7 text-[15px] text-[#6F767E] italic leading-relaxed">"{row.description}"</td>
                      <td className="px-10 py-7">
                        <span className="bg-[#F0F2FF] text-[#4F27B8] text-[11px] font-bold px-4 py-1.5 rounded-full border border-purple-100 tracking-wide">
                          {row.context}
                        </span>
                      </td>
                      <td className="px-10 py-7 text-right">
                        <span className={`${row.impact.color} border text-[11px] font-bold px-4 py-1.5 rounded-xl tracking-wide`}>
                          {row.impact.label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-[#F9FAFB] py-8 text-center border-t border-gray-50">
              <button className="inline-flex items-center gap-3 text-[15px] font-bold text-[#4F27B8] hover:gap-5 transition-all tracking-wide">
                View Extended History <ArrowRight size={20} />
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;