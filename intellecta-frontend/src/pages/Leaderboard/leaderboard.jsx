import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { Filter, Download, BarChart3, TrendingUp, MoreHorizontal, Award, Lightbulb, Globe, Zap, Target } from 'lucide-react';

const GlobalLeaderboard = () => {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [viewMode, setViewMode] = useState('global');
  
  const navigate = useNavigate(); // 2. Initialize navigate

  // DATA: GLOBAL (Your Original Data)
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

  // DATA: SECTIONAL
  const sectionalData = [
    { rank: '04', name: 'Lina Miller', univ: 'Sophomore', tag: 'Artificial Intelligence', progress: 85, color: 'bg-slate-800', initial: 'L' },
    { rank: '14', name: 'Alex RiverP', univ: 'Junior', tag: 'Software Engineering', progress: 70, color: 'bg-indigo-600', isYou: true, initial: 'YOU' },
    { rank: '15', name: 'Thomas Chen', univ: 'Junior', tag: 'Data Science', progress: 65, color: 'bg-slate-800', initial: 'T' },
    { rank: '16', name: 'Sarah White', univ: 'Senior', tag: 'Cybersecurity', progress: 60, color: 'bg-slate-800', initial: 'S' },
  ];

  const currentLeaderboard = viewMode === 'global' ? globalData : sectionalData;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Inter',_sans-serif] text-slate-900 antialiased pb-20">
      
      <main className="max-w-[1440px] mx-auto p-6 lg:p-10 pt-20">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-[#1e293b]">
              {viewMode === 'global' ? 'Global Standings' : 'Sectional Ranking'}
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              {viewMode === 'global' 
                ? 'Academic performance rankings across the Intellecta network.' 
                : <span>You're currently in the <span className="text-indigo-600 font-bold">Top 5%</span> of the Computer Science department this semester.</span>
              }
            </p>
          </div>

          <div className="flex flex-col items-end gap-5">
            <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <span className="text-[13px] font-bold text-slate-600">Anonymous Mode</span>
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  isAnonymous ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${isAnonymous ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex p-1 bg-slate-200/50 rounded-xl">
              {['global', 'sectional'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-10 py-2.5 text-[14px] font-black rounded-lg transition-all capitalize ${
                    viewMode === mode ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-12 items-start">
          
          {/* LEFT COLUMN */}
          <div className="space-y-16">
            {/* DYNAMIC PODIUM */}
            {viewMode === 'global' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                <PodiumCard rank="2" name="Sarah Jenkins" univ="Oxford University" pts="4,892" img="https://i.pravatar.cc/150?u=sarah" />
                <PodiumCard rank="1" name="David Park" univ="Stanford Academic Hub" pts="5,102" active img="https://i.pravatar.cc/150?u=david" />
                <PodiumCard rank="3" name="Elena Rossi" univ="Bocconi Milan" pts="4,750" img="https://i.pravatar.cc/150?u=elena" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                <PodiumCard rank="2" name="Julian D." univ="CS Junior" pts="12,450" img="https://i.pravatar.cc/150?u=julian" />
                <PodiumCard rank="1" name="AmPrPS." univ="CS Senior" pts="15,890" active img="https://i.pravatar.cc/150?u=amprps" />
                <PodiumCard rank="3" name="Ray K." univ="CS Freshman" pts="11,200" img="https://i.pravatar.cc/150?u=rayk" />
              </div>
            )}

            {/* PERFORMANCE INSIGHTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[40px] border border-slate-200/60 shadow-xl shadow-slate-200/40 flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><TrendingUp size={24}/></div>
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Avg Growth</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">+12.4%</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-slate-200/60 shadow-xl shadow-slate-200/40 flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Globe size={24}/></div>
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{viewMode === 'global' ? 'Regions' : 'Class size'}</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{viewMode === 'global' ? '42' : '180'}</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-slate-200/60 shadow-xl shadow-slate-200/40 flex items-center gap-5">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center"><Zap size={24}/></div>
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Live Now</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">1.2k</p>
                    </div>
                </div>
            </div>

            {/* TABLE SECTION */}
            <section className="bg-white rounded-[40px] p-10 shadow-2xl shadow-slate-200/60 border border-slate-200/50 overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    {viewMode === 'global' ? 'Community Rankings' : 'Full Leaderboard: Computer Science'}
                  </h2>
                  <p className="text-slate-400 font-medium">Updated every 15 minutes</p>
                </div>
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                    <Filter size={18}/> Filter
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                    <Download size={18}/> Export
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto mb-10">
                <table className="w-full text-left border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-8 py-2">Rank</th>
                      <th className="px-8 py-2">{viewMode === 'global' ? 'Scholar' : 'Student'}</th>
                      <th className="px-8 py-2">{viewMode === 'global' ? 'Discipline' : 'Specialization'}</th>
                      <th className="px-8 py-2">{viewMode === 'global' ? 'Status' : 'Focus Score'}</th>
                      <th className="px-8 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLeaderboard.map((row, i) => (
                      <tr key={i} className={`group transition-all duration-300 ${row.isYou ? 'bg-[#f4f3ff] scale-[1.01] shadow-xl shadow-indigo-100/40' : 'hover:bg-slate-50 hover:translate-x-1'}`}>
                        <td className={`px-8 py-6 first:rounded-l-[24px] font-mono text-xl font-black ${row.isYou ? 'text-indigo-600' : 'text-slate-300'}`}>
                          {row.rank}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-full ${row.color} flex items-center justify-center text-white font-black text-[12px] ring-4 ring-white shadow-lg`}>
                              {row.initial}
                            </div>
                            <div>
                              <p className={`font-black text-[17px] ${row.isYou ? 'text-indigo-800' : 'text-slate-900'}`}>{row.name}</p>
                              <p className="text-[13px] text-slate-400 font-semibold">{row.univ}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`text-[11px] font-black px-5 py-2 rounded-full tracking-wide uppercase border ${row.isYou ? 'bg-white border-indigo-200 text-indigo-600' : 'bg-[#eeebff] border-transparent text-[#512de3]'}`}>
                            {row.tag}
                          </span>
                        </td>
                        <td className="px-8 py-6 w-72">
                          <div className="flex items-center gap-4">
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner flex-1">
                                <div className={`h-full rounded-full transition-all duration-1000 ${row.isYou ? 'bg-indigo-600' : 'bg-indigo-400'}`} style={{width: `${row.progress}%`}} />
                            </div>
                            <span className="text-[13px] font-black text-slate-400">{row.progress}%</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 last:rounded-r-[24px] text-right text-slate-300">
                            <MoreHorizontal size={24} className="cursor-pointer hover:text-slate-600 transition-colors" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center pt-4 border-t border-slate-100">
                <button className="px-10 py-4 rounded-full border border-indigo-100 text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-all">
                  Load More Students
                </button>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN SIDEBAR */}
          <aside className="space-y-8 sticky top-12">
            <section className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-200/60">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <BarChart3 size={20} />
                </div>
                <h3 className="font-black text-lg tracking-tight">Peer Comparison</h3>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[24px] mb-8 relative border border-slate-100">
                <div className="text-center z-10">
                  <div className="w-14 h-14 bg-slate-900 rounded-full mx-auto mb-3 border-4 border-white shadow-md overflow-hidden">
                      <img src="https://i.pravatar.cc/150?u=alex" alt="Alex" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alex</p>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 opacity-20 text-slate-400 font-black italic text-2xl select-none">VS</div>
                <div className="text-center z-10">
                  <div className="w-14 h-14 bg-indigo-600 rounded-full mx-auto mb-3 border-4 border-white shadow-md overflow-hidden">
                       <img src="https://i.pravatar.cc/150?u=davidp" alt="David" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">David P.</p>
                </div>
              </div>

              <div className="mb-8 px-1">
                <div className="flex justify-between items-end h-24 gap-2">
                  {[45, 60, 55, 80, 100, 70, 95].map((h, i) => (
                    <div key={i} className={`flex-1 rounded-t-lg transition-all duration-700 ${i === 4 ? 'bg-indigo-600' : 'bg-indigo-100'}`} style={{height: `${h}%`}} />
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-4">
                  <span>Momentum</span>
                  <span className="text-indigo-600">Weekly</span>
                </div>
              </div>

              <div className="bg-[#512de3] text-white p-6 rounded-[24px]">
                <div className="flex items-center gap-2 mb-3">
                   <Award size={14} className="text-indigo-200" />
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-80">PRO Insight</p>
                </div>
                <p className="text-sm font-semibold leading-relaxed">David P. spends 2.4 more hours on focus sessions.</p>
              </div>
            </section>

            <section className="bg-slate-900 rounded-[32px] p-8 text-white border border-slate-800 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-2.5 bg-white/10 rounded-xl"><Target size={20} className="text-emerald-400"/></div>
                    <h3 className="font-black text-lg tracking-tight">Weekly Goal</h3>
                </div>
                <div className="space-y-5">
                    <div className="flex justify-between items-end">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Mastery Level</p>
                        <p className="text-lg font-black text-white tracking-tight">Platinum</p>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className="w-[75%] h-full bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.3)]"></div>
                    </div>
                </div>
            </section>

            {/* UPDATED: NAVIGATION TRIGGER */}
            <div 
              onClick={() => navigate('/peers')} // 3. Added onClick handler
              className="bg-white rounded-[32px] p-8 border border-slate-200 text-center cursor-pointer hover:border-indigo-400 hover:shadow-xl transition-all group"
            >
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <BarChart3 size={24} />
                </div>
                <p className="font-black text-slate-900 text-[16px]">Generate Full Report</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Export Detailed Performance Metrics</p>
            </div>

            <section className="bg-[#fee2d5] rounded-[40px] p-8 text-[#5c3d2e] relative overflow-hidden">
              <div className="mb-6 bg-white/40 w-10 h-10 rounded-xl flex items-center justify-center">
                <Lightbulb size={20} className="text-[#d97706]" />
              </div>
              <h3 className="text-2xl font-black leading-tight mb-3 tracking-tighter">
                Next Achievement:<br />'Global Scholar'
              </h3>
              <p className="text-sm font-medium opacity-80 mb-8 max-w-[200px]">
                Maintain your top 50 position for 2 more weeks to unlock.
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-4 border-[#fee2d5] shadow-sm ${
                      i === 1 ? 'bg-blue-200' : i === 2 ? 'bg-blue-300' : 'bg-slate-500'
                    }`} />
                  ))}
                </div>
                <p className="text-[10px] font-black uppercase tracking-tighter opacity-60">
                  12 others earned this
                </p>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

const PodiumCard = ({ rank, name, univ, pts, active, img }) => (
  <div className={`rounded-[56px] p-10 text-center flex flex-col items-center transition-all duration-500 hover:-translate-y-2 ${
    active 
      ? 'bg-[#512de3] text-white pt-24 pb-16 shadow-[0_50px_100px_-20px_rgba(81,45,227,0.4)] relative z-10 scale-110' 
      : 'bg-white text-slate-900 shadow-2xl shadow-slate-200/50 border border-slate-200/50'
  }`}>
    <div className="relative mb-8">
      <div className={`w-32 h-32 rounded-full overflow-hidden ${active ? 'ring-8 ring-indigo-400/30' : 'ring-4 ring-slate-100'}`}>
         <img src={img} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className={`absolute -bottom-3 -right-3 w-14 h-14 rounded-full flex items-center justify-center font-black text-lg shadow-2xl ${active ? 'bg-[#ffca00] text-slate-900' : 'bg-slate-100 text-slate-600'}`}>
        {rank}
      </div>
    </div>
    <h3 className="font-black text-2xl leading-tight mb-2 tracking-tight">{name}</h3>
    <p className={`text-[14px] font-semibold mb-12 ${active ? 'text-indigo-200 opacity-80' : 'text-slate-400'}`}>{univ}</p>
    <div className={`px-10 py-4 rounded-[24px] font-black text-[15px] ${active ? 'bg-white/20 backdrop-blur-xl border border-white/10' : 'bg-indigo-50 text-[#512de3]'}`}>
      {pts} pts
    </div>
  </div>
);

export default GlobalLeaderboard;