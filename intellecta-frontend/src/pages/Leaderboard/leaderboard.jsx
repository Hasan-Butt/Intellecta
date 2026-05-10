import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Download, BarChart3, TrendingUp, MoreHorizontal, Award, Lightbulb, Globe, Zap, Target } from 'lucide-react';

import Sidebar from '../../components/dashboard/StudentSidebar';
import Navbar from '../../components/dashboard/Navbar';
import api from '../../services/api';
import Avatar from '../../components/common/Avatar';

const GlobalLeaderboard = () => {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [viewMode, setViewMode] = useState('global');
  const navigate = useNavigate();

  const [globalData, setGlobalData] = useState([]);
  const [sectionalData, setSectionalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedPeerUserId, setSelectedPeerUserId] = useState(null);
  const [showPeerDropdown, setShowPeerDropdown] = useState(false);
  const PAGE_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/content/categories');
        const names = (res.data || []).map(c => c.name).filter(Boolean);
        setCategories(names);
        if (names.length > 0) setSelectedCategory(names[0]);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories(["Computer Science"]);
        setSelectedCategory("Computer Science");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchGlobal = async () => {
      try {
        const userId = parseInt(localStorage.getItem("userId") ?? "2");
        const globalRes = await api.get(`/leaderboards/global/${userId}`);
        setGlobalData(globalRes.data || []);
      } catch (err) {
        console.error('Error fetching global leaderboard:', err);
      }
    };
    fetchGlobal();
  }, []);

  useEffect(() => {
    const fetchSectional = async () => {
      if (!selectedCategory) return;
      setLoading(true);
      try {
        const userId = parseInt(localStorage.getItem("userId") ?? "2");
        const sectionalRes = await api.get(`/leaderboards/sectional/${userId}?category=${encodeURIComponent(selectedCategory)}`);
        setSectionalData(sectionalRes.data || []);
      } catch (err) {
        console.error('Error fetching sectional leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSectional();
  }, [selectedCategory]);

  // Reset visible count whenever the board or category changes
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [viewMode, selectedCategory]);

  const currentLeaderboard = viewMode === 'global' ? globalData : sectionalData;
  const visibleLeaderboard = currentLeaderboard.slice(0, visibleCount);
  const hasMore = visibleCount < currentLeaderboard.length;

  const top1 = currentLeaderboard[0] || { username: 'TBD', level: 1, xp: 0, discipline: 'General' };
  const top2 = currentLeaderboard[1] || { username: 'TBD', level: 1, xp: 0, discipline: 'General' };
  const top3 = currentLeaderboard[2] || { username: 'TBD', level: 1, xp: 0, discipline: 'General' };

  const getDisplayName = (row) => (isAnonymous && row.currentUser) ? "Anonymous" : (row.username || 'TBD');

  const resolveLevelTitle = (level) => {
    const l = level || 1;
    if (l <= 3) return "Beginner";
    if (l <= 6) return "Apprentice";
    if (l <= 10) return "Scholar";
    if (l <= 15) return "Expert";
    return "Master";
  };

  // Always use globalData for the current user's authoritative rank & XP
  const globalCurrentUser = globalData.find(r => r.currentUser);

  // Compute level fully on the frontend from XP — never trust the stale DB field
  const computeLevel = (xp) => {
    let lvl = 1;
    while (100.0 * Math.pow(lvl + 1, 1.5) <= xp) lvl++;
    return lvl;
  };
  const myLevel = computeLevel(globalCurrentUser?.xp ?? 0);

  // Sidebar comparison data (view-specific)
  const currentUser = currentLeaderboard.find(r => r.currentUser);
  const peers = currentLeaderboard.filter(r => !r.currentUser);
  const selectedPeer = peers.find(r => r.userId === selectedPeerUserId) || peers[0] || null;
  const xpGap = (selectedPeer && currentUser) ? Math.max(0, selectedPeer.xp - currentUser.xp) : 0;

  // Next competitor directly above current user in this board
  const competitorAbove = currentUser
    ? currentLeaderboard
        .filter(r => r.rank < currentUser.rank)
        .sort((a, b) => b.rank - a.rank)[0] || null
    : null;
  const xpToOvertake = competitorAbove ? Math.max(0, competitorAbove.xp - currentUser.xp + 1) : 0;
  const rankBelowCompetitor = currentLeaderboard
    .filter(r => competitorAbove && r.rank > competitorAbove.rank)
    .sort((a, b) => a.rank - b.rank)[0];
  const baseXp = rankBelowCompetitor ? rankBelowCompetitor.xp : 0;
  const overtakeRange = competitorAbove ? Math.max(1, competitorAbove.xp - baseXp) : 1;
  const overtakePct = currentUser && competitorAbove
    ? Math.min(100, Math.round(((currentUser.xp - baseXp) / overtakeRange) * 100))
    : 100;

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
                    : <span>You're in the <span className="text-indigo-600 font-bold">Top 5%</span> of {selectedCategory}.</span>
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
                    <PodiumCard rank="2" name={getDisplayName(top2)} univ={`Lv.${top2.level} ${resolveLevelTitle(top2.level)} • ${top2.discipline || 'General'}`} pts={top2.xp} avatarUrl={top2.avatarUrl}/>
                    <PodiumCard rank="1" name={getDisplayName(top1)} univ={`Lv.${top1.level} ${resolveLevelTitle(top1.level)} • ${top1.discipline || 'General'}`} pts={top1.xp} active avatarUrl={top1.avatarUrl}/>
                    <PodiumCard rank="3" name={getDisplayName(top3)} univ={`Lv.${top3.level} ${resolveLevelTitle(top3.level)} • ${top3.discipline || 'General'}`} pts={top3.xp} avatarUrl={top3.avatarUrl}/>
                </div>

                {/* TABLE SECTION */}
                <section className="bg-white rounded-[32px] p-6 md:p-8 shadow-xl border border-slate-200/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">{viewMode === 'global' ? 'Community Rankings' : `Full Leaderboard: ${selectedCategory}`}</h2>
                      <p className="text-xs text-slate-400 font-medium">Updated every 15 minutes</p>
                    </div>
                    {viewMode !== 'global' && (
                      <div className="flex gap-2">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-600 bg-white hover:bg-slate-50 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                          <th className="px-4 py-2">Rank</th>
                          <th className="px-4 py-2">{viewMode === 'global' ? 'Scholar' : 'Student'}</th>
                          {viewMode !== 'global' && <th className="px-4 py-2">Discipline</th>}
                          <th className="px-4 py-2">Level</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleLeaderboard.map((row, i) => (
                          <tr key={i} className={`group transition-all ${row.currentUser ? 'bg-indigo-50/60 outline outline-2 outline-indigo-500 rounded-2xl relative z-10 shadow-sm' : 'hover:bg-slate-50'}`}>
                            <td className={`px-4 py-4 first:rounded-l-2xl font-mono text-lg font-black ${row.currentUser ? 'text-indigo-600' : 'text-slate-300'}`}>{(row.rank || i + 1).toString().padStart(2, '0')}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar src={row.avatarUrl} name={getDisplayName(row)} />
                                <div>
                                  <p className={`font-black text-sm ${row.currentUser ? 'text-indigo-800' : 'text-slate-900'}`}>{getDisplayName(row)}</p>
                                  <p className="text-[11px] text-slate-400 font-semibold">{row.xp} XP</p>
                                </div>
                              </div>
                            </td>
                            {/* RE-ADDED DISCIPLINE COLUMN WITH WHITESPACE-NOWRAP */}
                            {viewMode !== 'global' && (
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="text-[10px] font-black px-3 py-1 rounded-full border bg-white text-indigo-600 border-indigo-100 uppercase">
                                  {row.discipline || 'General'}
                                </span>
                              </td>
                            )}
                            <td className="px-4 py-4 w-40 lg:w-48">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 transition-all" style={{width: `${row.xpProgressPct || 0}%`}} />
                                </div>
                                <span className="text-[11px] font-black text-slate-400">Lv.{row.level || 1} {resolveLevelTitle(row.level)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 last:rounded-r-2xl text-right">
                                {viewMode !== 'global' && <MoreHorizontal size={18} className="cursor-pointer text-slate-300 hover:text-slate-600" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-col items-center gap-2 pt-6 border-t border-slate-50">
                    {hasMore ? (
                      <>
                        <button
                          onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                          className="px-8 py-3 rounded-full border border-indigo-100 text-indigo-600 font-bold text-[12px] hover:bg-indigo-50 transition-all"
                        >
                          Load More Students
                        </button>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Showing {visibleCount} of {currentLeaderboard.length}
                        </p>
                      </>
                    ) : (
                      <p className="text-[11px] text-slate-400 font-semibold py-1">
                        All {currentLeaderboard.length} students shown
                      </p>
                    )}
                  </div>
                </section>
              </div>

              {/* RIGHT ASIDE */}
              <aside className="space-y-6 sticky top-6">
                {/* Peer Comparison */}
                <section className="bg-white rounded-[24px] p-6 shadow-lg border border-slate-200/60">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 size={18} className="text-indigo-600" />
                    <h3 className="font-black text-[15px] tracking-tight">Peer Comparison</h3>
                  </div>
                  {currentUser && selectedPeer ? (
                    <>
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl mb-4 relative border border-slate-100">
                        {/* Current user */}
                        <div className="text-center z-10">
                          <Avatar src={currentUser.avatarUrl} name={isAnonymous ? 'You' : currentUser.username} size="w-11 h-11 mx-auto mb-2" />
                          <p className="text-[9px] font-black uppercase text-slate-400">{isAnonymous ? 'You' : currentUser.username}</p>
                          <p className="text-[10px] font-black text-indigo-600">{currentUser.xp} XP</p>
                        </div>

                        <div className="absolute left-1/2 -translate-x-1/2 opacity-20 text-slate-400 font-black italic text-lg">VS</div>

                        {/* Peer — clickable to switch */}
                        <div className="text-center z-10 relative">
                          <button
                            onClick={() => setShowPeerDropdown(v => !v)}
                            className="group flex flex-col items-center focus:outline-none"
                            title="Click to change peer"
                          >
                            <Avatar src={selectedPeer.avatarUrl} name={selectedPeer.username} size="w-11 h-11 mx-auto mb-2" />
                            <p className="text-[9px] font-black uppercase text-indigo-600 flex items-center gap-1">
                              {selectedPeer.username}
                              <span className="text-[7px] opacity-60">▼</span>
                            </p>
                            <p className="text-[10px] font-black text-indigo-600">{selectedPeer.xp} XP</p>
                          </button>

                          {/* Peer selector dropdown */}
                          {showPeerDropdown && (
                            <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 min-w-[160px] overflow-hidden">
                              <p className="text-[9px] font-black uppercase text-slate-400 px-3 pt-3 pb-1">Compare with</p>
                              {peers.map(peer => (
                                <button
                                  key={peer.userId}
                                  onClick={() => { setSelectedPeerUserId(peer.userId); setShowPeerDropdown(false); }}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-indigo-50 transition-colors ${
                                    peer.userId === selectedPeer.userId ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                                  }`}
                                >
                                  <Avatar src={peer.avatarUrl} name={peer.username} size="w-6 h-6" />
                                  <div>
                                    <p className="text-[11px] font-bold leading-none">{peer.username}</p>
                                    <p className="text-[9px] text-slate-400">Rank #{peer.rank} · {peer.xp} XP</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-[#512de3] text-white p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <Award size={12} className="text-indigo-200" />
                          <p className="text-[9px] font-black uppercase opacity-80">Insight</p>
                        </div>
                        {currentUser.xp >= selectedPeer.xp
                          ? <p className="text-[12px] font-semibold leading-snug">You're ahead of {selectedPeer.username} by <strong>{(currentUser.xp - selectedPeer.xp).toLocaleString()} XP</strong>!</p>
                          : <p className="text-[12px] font-semibold leading-snug">{selectedPeer.username} leads by <strong>{xpGap.toLocaleString()} XP</strong>. Close the gap!</p>
                        }
                      </div>
                    </>
                  ) : (
                    <p className="text-[12px] text-slate-400 text-center py-4">No data available</p>
                  )}
                </section>

                {/* Your Standing */}
                {globalCurrentUser && (
                  <section className="bg-slate-900 rounded-[24px] p-6 text-white shadow-xl">
                    <div className="flex items-center gap-3 mb-5">
                      <Target size={18} className="text-emerald-400"/>
                      <h3 className="font-black text-[15px]">Your Standing</h3>
                    </div>
                    <div className="space-y-4">
                      {/* Rank + Level */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Global Rank</p>
                          <p className="text-2xl font-black text-white">#{globalCurrentUser.rank}</p>
                          <p className="text-[10px] text-slate-500 font-bold">{globalCurrentUser.xp.toLocaleString()} XP</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Level</p>
                          <p className="text-base font-black text-emerald-400">{resolveLevelTitle(myLevel)}</p>
                          <p className="text-[10px] text-slate-500 font-bold">Lv. {myLevel}</p>
                        </div>
                      </div>

                      {/* Progress toward overtaking competitor above */}
                      {competitorAbove ? (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Progress to Rank #{competitorAbove.rank}</p>
                            <p className="text-[9px] font-black text-emerald-400">{overtakePct}%</p>
                          </div>
                          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 rounded-full transition-all"
                              style={{width: `${overtakePct}%`}}
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 font-semibold mt-2">
                            {xpToOvertake > 0
                              ? <><span className="text-white font-black">{xpToOvertake.toLocaleString()} XP</span> needed to beat {competitorAbove.username}</>
                              : <span className="text-emerald-400 font-black">You've overtaken {competitorAbove.username}!</span>
                            }
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[10px] text-emerald-400 font-black">🏆 You're at the top! No one to beat.</p>
                          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-emerald-400 rounded-full w-full" />
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                <div
                  onClick={() => {
                    const userId = localStorage.getItem('userId') ?? '2';
                    if (selectedPeer && selectedPeer.userId) {
                      navigate(`/peers?userId=${userId}&peerId=${selectedPeer.userId}`);
                    } else {
                      navigate('/peers');
                    }
                  }}
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
                  <h3 className="text-lg font-black leading-tight mb-2 tracking-tight">Next: '{resolveLevelTitle((currentUser?.level || 1) + 1)}'</h3>
                  <p className="text-[11px] font-medium opacity-80 mb-4">Keep earning XP to reach the next tier.</p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {currentLeaderboard.filter(r => !r.currentUser).slice(0, 3).map((peer, i) => (
                        <Avatar key={i} src={peer.avatarUrl} name={peer.username} size="w-7 h-7" className="border-[#fee2d5]" />
                      ))}
                    </div>
                    <p className="text-[8px] font-black uppercase opacity-60">{currentLeaderboard.length - 1} others competing</p>
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

const PodiumCard = ({ rank, name, univ, pts, active, avatarUrl }) => (
  <div className={`rounded-[36px] p-5 text-center flex flex-col items-center transition-all duration-500 ${
    active 
      ? 'bg-[#512de3] text-white pt-10 pb-8 shadow-2xl relative z-10 scale-105' 
      : 'bg-white text-slate-900 shadow-md border border-slate-200/50'
  }`}>    
    <div className="relative mb-4">
      <Avatar src={avatarUrl} name={name} size="w-20 h-20" className={active ? 'ring-4 ring-indigo-400/30' : 'ring-2 ring-slate-100'} />
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