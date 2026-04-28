import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Download, BarChart3, TrendingUp, MoreHorizontal, Award, Lightbulb, Globe, Zap, Target } from 'lucide-react';

import Sidebar from '../../components/dashboard/StudentSidebar';
import Navbar from '../../components/dashboard/Navbar';

const GlobalLeaderboard = () => {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [viewMode, setViewMode] = useState('global');
  const navigate = useNavigate();

  // ALL ORIGINAL DATA PRESERVED
  const globalData = [
    { rank: '01', name: 'David Park', univ: 'Stanford Hub', tag: 'Quantum Phys', progress: 98, color: 'bg-amber-500', initial: 'D' },
    { rank: '04', name: 'Marcus Thorne', univ: 'LSE London', tag: 'Linguistics', progress: 90, color: 'bg-cyan-950', initial: 'M' },
    { rank: '05', name: 'Anya Petrova', univ: 'St. Petersburg', tag: 'Algorithms', progress: 80, color: 'bg-slate-800', initial: 'A' },
    { rank: '09', name: 'James Wilson', univ: 'MIT Boston', tag: 'Architecture', progress: 78, color: 'bg-rose-600', initial: 'J' },
    { rank: '14', name: 'Alex Chen', univ: 'Sophomore', tag: 'Neuroscience', progress: 75, color: 'bg-indigo-600', isYou: true, initial: 'YOU' },
    { rank: '15', name: 'Sofia G.', univ: 'UCL London', tag: 'Fine Arts', progress: 72, color: 'bg-emerald-600', initial: 'S' },
    { rank: '22', name: 'Kenji Sato', univ: 'Tokyo Uni', tag: 'Robotics', progress: 65, color: 'bg-orange-500', initial: 'K' },
    { rank: '28', name: 'Liam Neeson', univ: 'Dublin Tech', tag: 'History', progress: 58, color: 'bg-blue-900', initial: 'L' },
    { rank: '31', name: 'Chloe Simard', univ: 'Sorbonne', tag: 'Economics', progress: 52, color: 'bg-pink-700', initial: 'C' },
  ];

  const sectionalData = [
    { rank: '04', name: 'Lina Miller', univ: 'Sophomore', tag: 'Artificial Intelligence', progress: 85, color: 'bg-slate-800', initial: 'L' },
    { rank: '14', name: 'Alex RiverP', univ: 'Junior', tag: 'Software Engineering', progress: 70, color: 'bg-indigo-600', isYou: true, initial: 'YOU' },
    { rank: '15', name: 'Thomas Chen', univ: 'Junior', tag: 'Data Science', progress: 65, color: 'bg-slate-800', initial: 'T' },
    { rank: '16', name: 'Sarah White', univ: 'Senior', tag: 'Cybersecurity', progress: 60, color: 'bg-slate-800', initial: 'S' },
  ];

  const currentLeaderboard = viewMode === 'global' ? globalData : sectionalData;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Inter',_sans-serif] text-slate-900 antialiased flex flex-col">
      <Navbar />

      <div className="flex flex-1 relative items-start">
        <Sidebar />

        <main className="flex-1 min-w-0 p-4 lg:p-8">
          <div className="max-w-[1300px] mx-auto">
            
            {/* HEADER AREA */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#1e293b]">
                  {viewMode === 'global' ? 'Global Standings' : 'Sectional Ranking'}
                </h1>
                <p className="text-slate-500 font-medium text-sm md:text-base">
                  {viewMode === 'global' 
                    ? 'Academic performance rankings across the Intellecta network.' 
                    : <span>You're in the <span className="text-indigo-600 font-bold">Top 5%</span> of Computer Science.</span>
                  }
                </p>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-[12px] font-bold">
                  <span className="text-slate-600">Anonymous Mode</span>
                  <button
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${isAnonymous ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${isAnonymous ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex p-1 bg-slate-200/50 rounded-xl">
                  {['global', 'sectional'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-8 py-2 text-[13px] font-black rounded-lg transition-all capitalize ${
                        viewMode === mode ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">
              
              <div className="space-y-12 min-w-0">
                {/* PODIUM */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2 items-end">
                    <PodiumCard rank="2" name={viewMode === 'global' ? "Sarah J." : "Julian D."} univ={viewMode === 'global' ? "Oxford" : "CS Junior"} pts={viewMode === 'global' ? "4,892" : "12,450"} img={viewMode === 'global' ? "https://i.pravatar.cc/150?u=sarah" : "https://i.pravatar.cc/150?u=celia"}/>
                    <PodiumCard rank="1" name={viewMode === 'global' ? "David Park" : "AmPrPS."} univ={viewMode === 'global' ? "Stanford" : "CS Senior"} pts={viewMode === 'global' ? "5,102" : "15,890"} active img={viewMode === 'global' ? "https://i.pravatar.cc/150?u=david" : "https://i.pravatar.cc/150?u=katie"}/>
                    <PodiumCard rank="3" name={viewMode === 'global' ? "Elena Rossi" : "Ray K."} univ={viewMode === 'global' ? "Bocconi" : "CS Freshman"} pts={viewMode === 'global' ? "4,750" : "11,200"} img={viewMode === 'global' ? "https://i.pravatar.cc/150?u=elena" : "https://i.pravatar.cc/150?u=ray"}/>
                </div>

                {/* STATS STRIP */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-[28px] border border-slate-200/60 shadow-lg flex items-center gap-4">
                        <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><TrendingUp size={20}/></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Growth</p>
                            <p className="text-xl font-black text-slate-900 tracking-tight">+12.4%</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[28px] border border-slate-200/60 shadow-lg flex items-center gap-4">
                        <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Globe size={20}/></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{viewMode === 'global' ? 'Regions' : 'Class size'}</p>
                            <p className="text-xl font-black text-slate-900 tracking-tight">{viewMode === 'global' ? '42' : '180'}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[28px] border border-slate-200/60 shadow-lg flex items-center gap-4">
                        <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Zap size={20}/></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Now</p>
                            <p className="text-xl font-black text-slate-900 tracking-tight">1.2k</p>
                        </div>
                    </div>
                </div>

                {/* TABLE SECTION */}
                <section className="bg-white rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-200/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">{viewMode === 'global' ? 'Community Rankings' : 'Full Leaderboard: CS'}</h2>
                      <p className="text-xs text-slate-400 font-medium">Updated every 15 minutes</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all"><Filter size={14}/> Filter</button>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all"><Download size={14}/> Export</button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                          <th className="px-4 py-2">Rank</th>
                          <th className="px-4 py-2">{viewMode === 'global' ? 'Scholar' : 'Student'}</th>
                          <th className="px-4 py-2">Discipline</th>
                          <th className="px-4 py-2">Focus Score</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentLeaderboard.map((row, i) => (
                          <tr key={i} className={`group transition-all ${row.isYou ? 'bg-indigo-50/60' : 'hover:bg-slate-50'}`}>
                            <td className={`px-4 py-4 first:rounded-l-2xl font-mono text-lg font-black ${row.isYou ? 'text-indigo-600' : 'text-slate-300'}`}>{row.rank}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full ${row.color} flex items-center justify-center text-white font-black text-[10px]`}>{row.initial}</div>
                                <div>
                                  <p className={`font-black text-sm ${row.isYou ? 'text-indigo-800' : 'text-slate-900'}`}>{row.name}</p>
                                  <p className="text-[11px] text-slate-400 font-semibold">{row.univ}</p>
                                </div>
                              </div>
                            </td>
                            {/* RE-ADDED DISCIPLINE COLUMN WITH WHITESPACE-NOWRAP */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-[10px] font-black px-3 py-1 rounded-full border bg-white text-indigo-600 border-indigo-100 uppercase">
                                {row.tag}
                              </span>
                            </td>
                            <td className="px-4 py-4 w-40 lg:w-48">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 transition-all" style={{width: `${row.progress}%`}} />
                                </div>
                                <span className="text-[11px] font-black text-slate-400">{row.progress}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 last:rounded-r-2xl text-right">
                                <MoreHorizontal size={18} className="cursor-pointer text-slate-300 hover:text-slate-600" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-center pt-6 border-t border-slate-50">
                    <button className="px-8 py-3 rounded-full border border-indigo-100 text-indigo-600 font-bold text-[12px] hover:bg-indigo-50 transition-all">Load More Students</button>
                  </div>
                </section>
              </div>

              {/* RIGHT ASIDE */}
              <aside className="space-y-6 sticky top-6">
                <section className="bg-white rounded-[24px] p-6 shadow-lg border border-slate-200/60">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 size={18} className="text-indigo-600" />
                    <h3 className="font-black text-[15px] tracking-tight">Peer Comparison</h3>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl mb-6 relative border border-slate-100">
                    <div className="text-center z-10">
                      <div className="w-11 h-11 bg-slate-900 rounded-full mx-auto mb-2 border-2 border-white shadow-sm overflow-hidden">
                          <img src="https://i.pravatar.cc/150?u=alex" alt="Alex" />
                      </div>
                      <p className="text-[9px] font-black uppercase text-slate-400">Alex</p>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 opacity-20 text-slate-400 font-black italic text-lg">VS</div>
                    <div className="text-center z-10">
                      <div className="w-11 h-11 bg-indigo-600 rounded-full mx-auto mb-2 border-2 border-white shadow-sm overflow-hidden">
                           <img src="https://i.pravatar.cc/150?u=davidp" alt="David" />
                      </div>
                      <p className="text-[9px] font-black uppercase text-indigo-600">David P.</p>
                    </div>
                  </div>
                  <div className="bg-[#512de3] text-white p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                       <Award size={12} className="text-indigo-200" />
                       <p className="text-[9px] font-black uppercase opacity-80">PRO Insight</p>
                    </div>
                    <p className="text-[12px] font-semibold leading-snug">David P. spends 2.4 more hours on focus sessions.</p>
                  </div>
                </section>

                <section className="bg-slate-900 rounded-[24px] p-6 text-white shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Target size={18} className="text-emerald-400"/>
                        <h3 className="font-black text-[15px]">Weekly Goal</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Mastery</p>
                            <p className="text-base font-black text-white">Platinum</p>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div className="w-[75%] h-full bg-emerald-400 rounded-full"></div>
                        </div>
                    </div>
                </section>

                <div 
                  onClick={() => navigate('/peers')}
                  className="bg-white rounded-[24px] p-6 border border-slate-200 text-center cursor-pointer hover:border-indigo-400 transition-all group"
                >
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <BarChart3 size={20} />
                    </div>
                    <p className="font-black text-slate-900 text-sm">Generate Full Report</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Export Metrics</p>
                </div>

                <section className="bg-[#fee2d5] rounded-[30px] p-6 text-[#5c3d2e] relative overflow-hidden">
                  <div className="mb-4 bg-white/40 w-8 h-8 rounded-lg flex items-center justify-center">
                    <Lightbulb size={16} className="text-[#d97706]" />
                  </div>
                  <h3 className="text-lg font-black leading-tight mb-2 tracking-tight">Next: 'Global Scholar'</h3>
                  <p className="text-[11px] font-medium opacity-80 mb-4">Maintain Top 50 for 2 more weeks.</p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-7 h-7 rounded-full border-2 border-[#fee2d5] bg-slate-400" />
                      ))}
                    </div>
                    <p className="text-[8px] font-black uppercase opacity-60">12 others earned this</p>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const PodiumCard = ({ rank, name, univ, pts, active, img }) => (
  <div className={`rounded-[36px] p-5 text-center flex flex-col items-center transition-all duration-500 ${
    active 
      ? 'bg-[#512de3] text-white pt-10 pb-8 shadow-2xl relative z-10 scale-105' 
      : 'bg-white text-slate-900 shadow-md border border-slate-200/50'
  }`}>    
    <div className="relative mb-4">
      <div className={`w-20 h-20 rounded-full overflow-hidden ${active ? 'ring-4 ring-indigo-400/30' : 'ring-2 ring-slate-100'}`}>
         <img src={img} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className={`absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shadow-lg ${active ? 'bg-[#ffca00] text-slate-900' : 'bg-slate-100 text-slate-600'}`}>
        {rank}
      </div>
    </div>
    <h3 className="font-black text-lg leading-tight mb-1 tracking-tight">{name}</h3>
    <p className={`text-[12px] font-semibold mb-6 ${active ? 'text-indigo-200 opacity-80' : 'text-slate-400'}`}>{univ}</p>
    <div className={`px-6 py-2 rounded-xl font-black text-[13px] ${active ? 'bg-white/20 backdrop-blur-xl' : 'bg-indigo-50 text-[#512de3]'}`}>
      {pts} pts
    </div>
  </div>
);

export default GlobalLeaderboard;