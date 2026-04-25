import React, { useState } from 'react';
import { 
  TrendingUp, Brain, Zap, Calendar, AlertCircle, 
  AlertTriangle, Tablet, ShieldCheck 
} from 'lucide-react';

// 1. CORRECT PATHS: Step out of /pages/Dashboard (../..) to reach /components/dashboard/
import Sidebar from '../../components/dashboard/Sidebar';
import Navbar from '../../components/dashboard/Navbar';
import intellectaLogo from '../../assets/intellectaLogo.jpeg';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  const heatmapCells = [
    0, 0, 1, 2, 2, 0, 1, 2, 3, 4, 2, 1, 2, 3, 4, 3, 1, 1, 2, 3, 2, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ];

  const alerts = [
    { id: 1, title: "Anomalous Session Duration", desc: "User ID: 88219 logged 18+ consecutive focus hours.", time: "2 min ago", type: "CRITICAL", icon: AlertTriangle, color: "text-red-500", bgColor: "bg-red-50", badgeColor: "bg-red-500" },
    { id: 2, title: "API Latency Spike", desc: "EU-West node experiencing >400ms response times.", time: "14 min ago", type: "WARNING", icon: Tablet, color: "text-gray-500", bgColor: "bg-gray-50", badgeColor: "bg-gray-400" },
    { id: 3, title: "Account Safeguard Triggered", desc: "Multiple login attempts from unverified IP (Beijing, CN).", time: "1 hr ago", type: "RESOLVED", icon: ShieldCheck, color: "text-emerald-500", bgColor: "bg-emerald-50", badgeColor: "bg-emerald-500" }
  ];

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] font-inter">
      
      {/* 2. PROPS: Passing state to Sidebar so it knows which button is highlighted */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col">
        
        {/* 3. PROPS: Passing the logo to the Navbar */}
        <Navbar intellectaLogo={intellectaLogo} />

        <main className="p-10 space-y-10">
          <div className="max-w-[1400px] mx-auto space-y-10">
            
            {/* PLATFORM OVERVIEW SECTION */}
            <section>
              <div className="mb-8">
                <h2 className="text-4xl font-black text-[#111827] tracking-tight">Platform Overview</h2>
                <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold uppercase text-[11px] tracking-widest">
                  <Calendar size={14} className="text-[#6C5DD3]" />
                  <span>Last Update: Today, Oct 24, 14:32 PM</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-[#6C5DD3] rounded-[40px] p-10 text-white shadow-2xl shadow-indigo-100">
                  <p className="text-[12px] font-bold uppercase tracking-[0.2em] opacity-80">Active Engagement</p>
                  <h3 className="text-7xl font-black mt-6 tracking-tighter">24,812</h3>
                  <div className="mt-10 flex items-center gap-4">
                    <div className="bg-[#34D399] text-[#064E3B] px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
                      <TrendingUp size={16} strokeWidth={3} /><span className="text-sm font-black">14.2%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-400">Avg Focus Score</p>
                      <div className="flex items-baseline gap-2 mt-6">
                        <h3 className="text-6xl font-black text-[#111827]">8.4</h3><span className="text-2xl font-bold text-gray-300">/ 10</span>
                      </div>
                    </div>
                    <div className="bg-[#F5F6FF] p-4 rounded-3xl text-[#6C5DD3]"><Brain size={32} /></div>
                  </div>
                  <div className="mt-6">
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: '84%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="bg-gray-50 p-6 rounded-full mb-8 border border-gray-100">
                    <Zap size={40} className="text-gray-100 stroke-gray-500 fill-gray-100" strokeWidth={1.5} />
                  </div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-400">Concurrent Sessions</p>
                  <h3 className="text-6xl font-black text-[#111827] mt-2">5,102</h3>
                </div>
              </div>
            </section>

            {/* CHARTS SECTION */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-black text-[#111827] mb-12">Weekly Study Velocity</h3>
                <div className="relative flex items-end justify-between h-64 w-full px-2">
                   {[55, 68, 40, 92, 60, 35, 30].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center mx-2 justify-end group">
                        <div className={`w-full rounded-md transition-all duration-300 ${h === 92 ? 'bg-[#6C5DD3]' : 'bg-[#E3E0F7]'}`} style={{ height: `${h}%` }}></div>
                        <span className="text-[11px] font-black mt-4 text-gray-400 uppercase tracking-tighter">{['MON','TUE','WED','THU','FRI','SAT','SUN'][i]}</span>
                      </div>
                   ))}
                </div>
              </div>

              <div className="lg:col-span-4 bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm flex flex-col">
                <h3 className="text-2xl font-black text-[#111827] mb-8">Peak Study Times</h3>
                <div className="grid grid-cols-6 gap-2 flex-1">
                  {heatmapCells.map((val, i) => (
                    <div key={i} className={`aspect-square rounded-md ${val === 0 ? 'bg-gray-100' : val === 1 ? 'bg-[#6C5DD3]/20' : val === 2 ? 'bg-[#6C5DD3]/40' : val === 3 ? 'bg-[#6C5DD3]/70' : 'bg-[#6C5DD3]'}`}></div>
                  ))}
                </div>
              </div>
            </section>

            {/* ALERTS SECTION */}
            <section className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-black text-[#111827] mb-10">Flagging & Alerts</h3>
              <div className="space-y-6">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between border-b border-gray-50 pb-6 last:border-0">
                    <div className="flex items-center gap-5">
                      <div className={`${alert.bgColor} ${alert.color} p-4 rounded-2xl`}><alert.icon size={24} /></div>
                      <div>
                        <h4 className="text-base font-black text-[#111827]">{alert.title}</h4>
                        <p className="text-sm font-bold text-gray-400">{alert.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <span className={`${alert.badgeColor} text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest`}>{alert.type}</span>
                        <span className="text-sm font-bold text-gray-400">{alert.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;