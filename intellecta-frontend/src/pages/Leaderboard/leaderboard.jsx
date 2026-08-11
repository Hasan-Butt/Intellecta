import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Download, BarChart3, TrendingUp, Award, Lightbulb, Globe, Zap, Target, Trophy, ChevronRight, Search } from 'lucide-react';

import Sidebar from '../../components/dashboard/StudentSidebar';
import Navbar from '../../components/dashboard/Navbar';
import api from '../../services/api';
import Avatar from '../../components/common/Avatar';
import { getUserId } from '../../utils/auth';
import { calculateLevel } from '../../utils/levels';

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
  const [peerSearch, setPeerSearch] = useState("");
  const [nextAchievement, setNextAchievement] = useState(null);

  const fetchGlobal = async () => {
    try {
      const userId = getUserId();
      if (!userId) return;
      const globalRes = await api.get(`/leaderboards/global/${userId}`);
      setGlobalData(globalRes.data || []);
    } catch (err) {
      console.error('Error fetching global leaderboard:', err);
    }
  };

  const fetchSectional = async () => {
    if (!selectedCategory) return;
    setLoading(true);
    try {
      const userId = getUserId();
      if (!userId) return;
      const sectionalRes = await api.get(`/leaderboards/sectional/${userId}?category=${encodeURIComponent(selectedCategory)}`);
      setSectionalData(sectionalRes.data || []);
    } catch (err) {
      console.error('Error fetching sectional leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = getUserId();
        if (!userId) return;
        const res = await api.get(`/users/${userId}/profile`);
        if (res.data && res.data.anonymousMode !== undefined) {
          setIsAnonymous(res.data.anonymousMode);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const userId = getUserId();
        if (!userId) return;
        const res = await api.get(`/achievements/user/${userId}/all`);
        const unearned = res.data.find(a => !a.earned);
        setNextAchievement(unearned);
      } catch (err) {
        console.error("Error fetching next achievement:", err);
      }
    };
    fetchAchievements();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/leaderboards/sectional/categories');
        const names = (res.data || []).filter(Boolean);
        setCategories(names);
        if (names.length > 0) setSelectedCategory(names[0]);
      } catch (err) {
        console.error('Error fetching sectional categories:', err);
        setCategories(["Computer Science"]);
        setSelectedCategory("Computer Science");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchGlobal();
  }, []);

  useEffect(() => {
    fetchSectional();
  }, [selectedCategory]);

  const handleToggleAnonymous = async () => {
    const nextVal = !isAnonymous;
    setIsAnonymous(nextVal);
    try {
      const userId = getUserId();
      if (!userId) return;
      await api.put(`/users/${userId}/profile`, { anonymousMode: nextVal });
      await fetchGlobal();
      if (selectedCategory) await fetchSectional();
    } catch (err) {
      console.error("Failed to update anonymous mode:", err);
    }
  };

  const currentLeaderboard = viewMode === 'global' ? globalData : sectionalData;
  const visibleLeaderboard = currentLeaderboard;

  const top1 = currentLeaderboard[0] || { username: 'TBD', level: 1, xp: 0, discipline: 'General' };
  const top2 = currentLeaderboard[1] || { username: 'TBD', level: 1, xp: 0, discipline: 'General' };
  const top3 = currentLeaderboard[2] || { username: 'TBD', level: 1, xp: 0, discipline: 'General' };

  const getDisplayName = (row) => row.username || 'TBD';

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

  // Sidebar comparison data (view-specific)
  const currentUser = currentLeaderboard.find(r => r.currentUser);
  const peers = currentLeaderboard.filter(r => !r.currentUser);
  const filteredPeers = peers.filter(p =>
    (p.username || "").toLowerCase().includes(peerSearch.toLowerCase().trim())
  );
  const selectedPeer = peers.find(r => r.userId === selectedPeerUserId) || peers[0] || null;
  const xpGap = (selectedPeer && currentUser) ? Math.max(0, selectedPeer.xp - currentUser.xp) : 0;

  // The user's standing: the active board's entry, falling back to the global one
  const standingUser = currentUser || globalCurrentUser;
  // Compute level fully on the frontend from XP — never trust the stale DB field
  const myLevel = calculateLevel(standingUser?.xp ?? 0);

  // Next competitor directly above current user in this board
  const competitorAbove = currentUser
    ? currentLeaderboard
        .filter(r => r.rank < currentUser.rank)
        .sort((a, b) => b.rank - a.rank)[0] || null
    : null;
  const xpToOvertake = competitorAbove ? Math.max(0, competitorAbove.xp - currentUser.xp + 1) : 0;
  // Floor of the user's own bracket = the person directly BELOW them, so the
  // progress bar measures the gap they actually need to close (previously it
  // used the person below the competitor, which made the bar sit at 0%)
  const rankBelowUser = currentLeaderboard
    .filter(r => currentUser && r.rank > currentUser.rank)
    .sort((a, b) => a.rank - b.rank)[0];
  const baseXp = rankBelowUser ? rankBelowUser.xp : (currentUser ? currentUser.xp : 0);
  const overtakeRange = competitorAbove ? Math.max(1, competitorAbove.xp - baseXp) : 1;
  const overtakePct = currentUser && competitorAbove
    ? Math.min(100, Math.round(((currentUser.xp - baseXp) / overtakeRange) * 100))
    : 100;

  return (
    <div className="min-h-screen bg-[var(--color-base)] text-slate-900 flex flex-col">
      <Navbar />

      <div className="flex flex-1 relative items-start">
        <Sidebar />

        <main className="flex-1 min-w-0 p-4 lg:p-8">
          <div className="max-w-[1300px] mx-auto">
            
            {/* HEADER AREA */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                  {viewMode === 'global' ? 'Global Standings' : 'Sectional Ranking'}
                </h1>
                <p className="text-gray-500 text-base mt-2 max-w-md leading-relaxed">
                  {viewMode === 'global' 
                    ? 'Academic performance rankings across the Intellecta network.' 
                    : (() => {
                        const total = currentLeaderboard.length;
                        const myRank = currentUser?.rank;
                        return (
                          <span>
                            {myRank && currentUser
                              ? <>You are <span className="text-indigo-600 font-bold">Rank {myRank}/{total}</span> in {selectedCategory}.</>
                              : <>Sectional ranking for <span className="text-indigo-600 font-bold">{selectedCategory}</span>.</>
                            }
                          </span>
                        );
                      })()
                  }
                </p>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-[12px] font-bold">
                  <span className="text-slate-600">Anonymous Mode</span>
                  <button
                    onClick={handleToggleAnonymous}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${isAnonymous ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${isAnonymous ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex p-1 neu-inset rounded-xl">
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
                <section className="neu p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">{viewMode === 'global' ? 'Community Rankings' : `Full Leaderboard: ${selectedCategory}`}</h2>
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

                  <div className="overflow-x-auto overflow-y-auto max-h-[480px] custom-scrollbar pr-1">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                          <th className="px-4 py-2">Rank</th>
                          <th className="px-4 py-2">{viewMode === 'global' ? 'Scholar' : 'Student'}</th>
                          {viewMode !== 'global' && <th className="px-4 py-2">Discipline</th>}
                          <th className="px-4 py-2">Level</th>
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
                                <div className="flex-1 xp-track">
                                    <div className="xp-fill" style={{width: `${row.xpProgressPct || 0}%`}} />
                                </div>
                                <span className="text-[11px] font-black text-slate-400">Lv.{row.level || 1} {resolveLevelTitle(row.level)}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              {/* RIGHT ASIDE */}
              <aside className="space-y-6 sticky top-6">
                {/* Peer Comparison */}
                <section className="neu p-6">
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
                            onClick={() => { setShowPeerDropdown(v => !v); setPeerSearch(""); }}
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
                            <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 w-64 overflow-hidden">
                              <div className="p-2 pb-0">
                                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                                  <Search size={12} className="text-slate-400 shrink-0" />
                                  <input
                                    value={peerSearch}
                                    onChange={(e) => setPeerSearch(e.target.value)}
                                    placeholder="Search students..."
                                    className="w-full bg-transparent outline-none text-[11px] font-semibold text-slate-700 placeholder:text-slate-400"
                                  />
                                </div>
                              </div>
                              <p className="text-[9px] font-black uppercase text-slate-400 px-3 pt-2.5 pb-1">Compare with</p>
                              <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                                {filteredPeers.length > 0 ? (
                                  filteredPeers.map(peer => (
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
                                  ))
                                ) : (
                                  <p className="px-3 py-4 text-[11px] font-semibold text-slate-400 text-center">
                                    No students found
                                  </p>
                                )}
                              </div>
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
                {viewMode === 'sectional' && !currentUser ? (
                  <section className="neu p-6 text-slate-900">
                    <div className="flex items-center gap-3 mb-5">
                      <Target size={18} className="text-emerald-600"/>
                      <h3 className="font-black text-[15px]">Your Standing</h3>
                    </div>
                    <p className="text-[12px] text-slate-500 font-semibold leading-relaxed">
                      You're not ranked in <span className="text-indigo-600 font-black">{selectedCategory}</span> yet.
                      Attempt a quiz in this category to start earning sectional XP.
                    </p>
                  </section>
                ) : standingUser && (
                  <section className="neu p-6 text-slate-900">
                    <div className="flex items-center gap-3 mb-5">
                      <Target size={18} className="text-emerald-600"/>
                      <h3 className="font-black text-[15px]">Your Standing</h3>
                    </div>
                    <div className="space-y-4">
                      {/* Rank + Level */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                            {viewMode === 'global' ? 'Global Rank' : `Rank in ${selectedCategory}`}
                          </p>
                          <p className="text-2xl font-black text-indigo-600">#{standingUser.rank}</p>
                          <p className="text-[10px] text-slate-500 font-bold">{standingUser.xp.toLocaleString()} XP</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Level</p>
                          <p className="text-base font-black text-emerald-600">{resolveLevelTitle(myLevel)}</p>
                          <p className="text-[10px] text-slate-500 font-bold">Lv. {myLevel}</p>
                        </div>
                      </div>

                      {/* Progress toward overtaking competitor above */}
                      {competitorAbove ? (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Progress to Rank #{competitorAbove.rank}</p>
                            <p className="text-[9px] font-black text-emerald-600">{overtakePct}%</p>
                          </div>
                          <div className="w-full xp-track">
                            <div
                              className="xp-fill"
                              style={{width: `${overtakePct}%`}}
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 font-semibold mt-2">
                            {xpToOvertake > 0
                              ? <><span className="text-slate-900 font-black">{xpToOvertake.toLocaleString()} XP</span> needed to beat {competitorAbove.username}</>
                              : <span className="text-emerald-600 font-black">You've overtaken {competitorAbove.username}!</span>
                            }
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[10px] text-emerald-600 font-black">🏆 You're at the top! No one to beat.</p>
                          <div className="w-full xp-track mt-2">
                            <div className="xp-fill w-full" style={{width: '100%'}} />
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                <div
                  onClick={() => {
                    const userId = getUserId();
                    if (!userId) return;
                    if (selectedPeer && selectedPeer.userId) {
                      navigate(`/peers?userId=${userId}&peerId=${selectedPeer.userId}`);
                    } else {
                      navigate('/peers');
                    }
                  }}
                  className="neu p-6 text-center cursor-pointer hover:scale-105 transition-all group"
                >
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <BarChart3 size={20} />
                    </div>
                    <p className="font-black text-slate-900 text-sm">Generate Full Report</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Export Metrics</p>
                </div>

                <section 
                  onClick={() => navigate('/achievements')}
                  className="neu p-6 relative overflow-hidden cursor-pointer hover:scale-105 transition-all group"
                >
                  <div className="mb-4 bg-white/40 w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-white/60 transition-colors">
                    <Trophy size={16} className="text-[#d97706]" />
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
  <div className={`p-5 text-center flex flex-col items-center transition-all duration-500 ${
    active 
      ? 'glass-card text-[#512de3] pt-10 pb-8 relative z-10 scale-105 border-2 border-indigo-200' 
      : 'neu text-slate-900'
  }`}>    
    <div className="relative mb-4">
      <Avatar src={avatarUrl} name={name} size="w-20 h-20" className={active ? 'ring-4 ring-indigo-400/30' : 'ring-2 ring-slate-100'} />
      <div className={`absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shadow-lg ${active ? 'bg-[#ffca00] text-slate-900' : 'bg-slate-100 text-slate-600'}`}>
        {rank}
      </div>
    </div>
    <h3 className="font-black text-lg leading-tight mb-1 tracking-tight">{name}</h3>
    <p className={`text-[12px] font-semibold mb-6 ${active ? 'text-slate-500' : 'text-slate-400'}`}>{univ}</p>
    <div className={`px-6 py-2 rounded-xl font-black text-[13px] ${active ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-50 text-[#512de3]'}`}>
      {pts} pts
    </div>
  </div>
);

export default GlobalLeaderboard;