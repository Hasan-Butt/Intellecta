import React, { useState } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  TrendingDown, 
  Activity, 
  Zap, 
  Target 
} from 'lucide-react';

// --- Updated Import Paths ---
import Sidebar from '../../components/dashboard/StudentSidebar';
import Navbar from '../../components/dashboard/Navbar';

// --- Sub-components ---

const IntensityCell = ({ intensity }) => {
  const [hovered, setHovered] = useState(false);
  const bgColors = [
    'bg-gray-50', 'bg-indigo-100', 'bg-indigo-300', 
    'bg-indigo-500', 'bg-indigo-600', 'bg-indigo-700',
  ];

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`h-12 w-full rounded-md transition-all duration-200 cursor-pointer ${bgColors[intensity]} ${
        hovered ? 'ring-2 ring-indigo-400 ring-offset-2 scale-110 z-10 shadow-lg' : ''
      }`}
    />
  );
};

const MasteryItem = ({ title, subtitle, percentage, type }) => {
  const isCritical = type === 'critical';
  return (
    <div className="group flex items-center justify-between p-6 mb-4 bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-300 cursor-default">
      <div className="flex items-center gap-5">
        <div className={`p-4 rounded-xl ${isCritical ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
          {isCritical ? <AlertTriangle size={22} /> : <TrendingDown size={22} />}
        </div>
        <div>
          <h4 className="text-[16px] font-bold text-gray-800 tracking-tight">{title}</h4>
          <p className="text-[14px] text-gray-500 font-medium">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden hidden md:block">
          <div 
            className={`h-full rounded-full ${isCritical ? 'bg-red-500' : 'bg-orange-500'}`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-right min-w-[80px]">
          <div className={`text-2xl font-black ${isCritical ? 'text-red-700' : 'text-[#7C4119]'}`}>
            {percentage}%
          </div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
            Proficiency
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---

const PerformanceDashboard = () => {
  const [isHovered, setIsHovered] = useState(false);
  const timeLabels = ["06:00 AM", "09:00 AM", "12:00 PM", "03:00 PM", "06:00 PM", "09:00 PM", "12:00 AM"];
  const heatmapData = [
    [0, 1, 2, 4, 1, 0, 0, 1, 2, 4, 1, 0],
    [1, 4, 5, 4, 2, 1, 1, 4, 5, 4, 2, 1],
  ];

  const radius = 100;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar - Fixed Left */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Navbar */}
        <Navbar />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 font-inter">
          <div className="max-w-[1400px] mx-0"> {/* Align left-ish for a clean sidebar flow */}
            
            {/* Header Section */}
            <header className="mb-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em]">System Active</span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Performance Dashboard</h1>
            </header>

            <div className="grid grid-cols-12 gap-8">
              
              {/* Focus Chart Card */}
              <section 
                className="col-span-12 lg:col-span-8 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-xl"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className="p-10 flex justify-between items-start">
                  <header>
                    <h2 className="text-[28px] font-bold tracking-tight text-[#4F39C3] leading-none">Focus Intensity</h2>
                    <p className="mt-3 text-[16px] text-gray-500 font-medium tracking-wide">Biometric tracking of cognitive load over 24h</p>
                  </header>
                  <button className={`px-6 py-2.5 rounded-full text-[11px] font-black tracking-[0.15em] uppercase transition-all duration-300 ${isHovered ? 'bg-[#3f2da1] -translate-y-1 shadow-indigo-200 shadow-xl' : 'bg-[#4F39C3]'} text-white shadow-lg`}>
                    Live Tracking
                  </button>
                </div>

                <div className="relative h-72 w-full px-2">
                  <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full">
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4F39C3" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#4F39C3" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,160 C100,140 150,155 250,150 C300,145 320,110 380,105 C450,100 500,145 600,140 C750,135 800,80 900,100 C950,110 1000,140 1000,160 L1000,200 L0,200 Z" fill="url(#areaGradient)" />
                    <path d="M0,160 C100,140 150,155 250,150 C300,145 320,110 380,105 C450,100 500,145 600,140 C750,135 800,80 900,100 C950,110 1000,140 1000,160" fill="none" stroke="#4F39C3" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="absolute bottom-6 w-full px-10 flex justify-between border-t border-gray-50 pt-6">
                    {timeLabels.map((time, index) => (
                      <span key={index} className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{time}</span>
                    ))}
                  </div>
                </div>
              </section>

              {/* Session Power Card */}
              <section className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                <div className="bg-[#4F39C3] rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/10 rounded-2xl"><Zap size={24} /></div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60">Session Power</span>
                  </div>
                  <div>
                    <div className="text-5xl font-black mb-2">92%</div>
                    <p className="text-indigo-100 text-sm font-medium leading-relaxed">Your focus consistency is 12% higher than your weekly average.</p>
                  </div>
                </div>
              </section>

              {/* Heatmap Card */}
              <section className="col-span-12 lg:col-span-4 bg-white rounded-[32px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100 h-fit">
                <header className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Clock size={18} /></div>
                    <h2 className="text-[14px] font-black text-gray-800 uppercase tracking-[0.15em]">Peak Windows</h2>
                  </div>
                </header>
                <div className="grid grid-cols-6 gap-3">
                  {heatmapData.flat().map((intensity, idx) => (
                    <IntensityCell key={idx} intensity={intensity} />
                  ))}
                </div>
                <footer className="mt-10 pt-8 border-t border-gray-50 flex justify-between items-center">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Prime Slot</span>
                    <span className="text-lg font-bold text-gray-800 tracking-tight">08:00 — 12:00</span>
                  </div>
                  <span className="px-4 py-2 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-xl">Optimal Flow</span>
                </footer>
              </section>

              {/* Mastery Deficits Card */}
              <section className="col-span-12 lg:col-span-8 bg-white rounded-[32px] p-10 shadow-[0_20px_50_rgba(0,0,0,0.02)] border border-gray-100">
                <header className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-lg text-red-600"><Target size={18} /></div>
                    <h2 className="text-[14px] font-black text-gray-800 uppercase tracking-[0.15em]">Mastery Deficits</h2>
                  </div>
                  <span className="text-sm font-bold text-indigo-600 cursor-pointer hover:underline">View Detailed Analysis</span>
                </header>
                <nav className="space-y-2">
                  <MasteryItem title="Quantum Mechanics" subtitle="Schrödinger's Equation logic gaps" percentage={42} type="critical" />
                  <MasteryItem title="Multivariate Calculus" subtitle="Triple integral volume calculations" percentage={58} type="warning" />
                </nav>
              </section>

              {/* Focus Allocation Card */}
              <section className="col-span-12 lg:col-span-5 bg-white rounded-[32px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between min-h-[520px]">
                <h2 className="font-black text-2xl tracking-tight text-[#2D2D5F] uppercase border-b border-gray-50 pb-4">
                  Focus Allocation
                </h2>
                
                <div className="relative flex items-center justify-center my-8">
                  <svg className="w-72 h-72 transform -rotate-90" viewBox="0 0 250 250">
                    <circle cx="125" cy="125" r="100" stroke="#E2E2F2" strokeWidth="28" fill="transparent" />
                    <circle
                      cx="125" cy="125" r="100" stroke="#A5A6F6" strokeWidth="28" fill="transparent"
                      strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * 0.85)}
                      strokeLinecap="round"
                    />
                    <circle
                      cx="125" cy="125" r="100" stroke="#5D5FEF" strokeWidth="28" fill="transparent"
                      strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * 0.60)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-[#2D2D5F] tracking-tight">8.2h</span>
                    <span className="text-[11px] font-bold tracking-[0.25em] text-gray-400 mt-2 uppercase">Total Focused</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-5">
                  {[
                    { label: 'Physics', value: 60, color: 'bg-[#5D5FEF]' },
                    { label: 'Math', value: 25, color: 'bg-[#A5A6F6]' },
                    { label: 'Ethics', value: 15, color: 'bg-[#E2E2F2]' }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm font-semibold text-gray-600">{item.label} ({item.value}%)</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Analytical Charts Section */}
              <div className="col-span-12 lg:col-span-7 flex flex-col gap-8">
                <section className="bg-[#5D5FEF] rounded-[32px] p-10 text-white flex flex-col justify-between h-[250px] relative overflow-hidden shadow-xl shadow-indigo-100">
                  <div className="flex justify-between items-start relative z-10">
                    <h2 className="font-black text-xl tracking-tight uppercase">Daily Delta</h2>
                    <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                      <span className="text-[10px] font-black">+12% vs. Yesterday</span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-3 h-28 relative z-10 px-2">
                    {[40, 60, 30, 75, 55, 100, 65].map((h, i) => (
                      <div 
                        key={i} 
                        className={`w-full rounded-xl transition-all duration-700 ${h === 100 ? 'bg-white' : 'bg-white/30'}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </section>

                <section className="bg-white rounded-[32px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col justify-center h-[242px]">
                  <h2 className="font-black text-xl tracking-tight text-[#4F39C3] uppercase mb-6">Weekly Sanctuary Score</h2>
                  <div className="flex items-center gap-8 mb-6">
                    <div className="flex-1 h-5 bg-[#E2E2F2] rounded-full overflow-hidden p-1">
                      <div className="h-full bg-gradient-to-r from-[#5D5FEF] to-[#A5A6F6] rounded-full" style={{ width: '85%' }} />
                    </div>
                    <span className="text-5xl font-black text-[#4A4AB1]">78</span>
                  </div>
                  <p className="text-[15px] text-gray-400 font-medium">
                    You are in the <span className="text-[#5D5FEF] font-black italic">Top 5%</span> of focused learners this week.
                  </p>
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