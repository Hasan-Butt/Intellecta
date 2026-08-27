import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/dashboard/StudentSidebar';
import Navbar from '../../components/dashboard/Navbar';
import badgeService from '../../services/badgeService';
import { 
  Trophy, 
  Award, 
  Lock, 
  ChevronRight, 
  Star
} from 'lucide-react';

const AchievementsPage = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    const fetchMyAchievements = async () => {
      try {
        const data = await badgeService.getMyAchievements();
        setBadges(data);
      } catch (error) {
        console.error("Failed to fetch achievements", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyAchievements();
  }, []);

  const earnedCount = badges.filter(b => b.earned).length;
  const totalCount = badges.length;
  const progressPct = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <div className="bg-[#f8f9fc] min-h-screen flex w-full">
          <StudentSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#451ebb]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />
      <div className="flex min-h-screen bg-[#f8f9fc] font-inter">
        <StudentSidebar />
        
        <main className="flex-1 p-8 overflow-y-auto">
        {/* Header Stats */}
        <div className="neu p-10 mb-12 flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-zinc-900 mb-4 uppercase tracking-tight">Hall of Fame</h2>
            <p className="text-gray-500 font-medium mb-8">You've unlocked <span className="text-[#451ebb] font-black">{earnedCount}</span> out of <span className="font-bold">{totalCount}</span> collectible milestones.</p>
            
            <div className="flex items-center gap-6">
              <div className="flex-1 w-80 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#451ebb] to-[#6c5dd3] rounded-full transition-all duration-1000"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-lg font-black text-[#451ebb]">{Math.round(progressPct)}%</span>
            </div>
          </div>

          <div className="w-48 h-48 bg-indigo-50 rounded-full flex items-center justify-center relative shrink-0">
            <Trophy className="text-[#451ebb]" size={80} strokeWidth={1.5} />
            <div className="absolute top-4 right-4 animate-bounce">
              <Star className="text-amber-400 fill-amber-400" size={24} />
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#451ebb]/5 rounded-bl-full" />
        </div>

        {/* Categories Section */}
        <div className="space-y-16 pb-20">
          
          {/* Rare/Legendary Earned */}
          {badges.some(b => b.earned && b.rarity === 'LEGENDARY') && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-amber-400 rounded-full" />
                <h3 className="text-xl font-black text-zinc-900 tracking-tight uppercase">Legendary Feats</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                {badges.filter(b => b.earned && b.rarity === 'LEGENDARY').map(badge => (
                  <AchievementCard key={badge.badgeKey} badge={badge} onClick={() => setSelectedBadge(badge)} />
                ))}
              </div>
            </div>
          )}

          {/* Collection Grid */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-6 bg-[#451ebb] rounded-full" />
              <h3 className="text-xl font-black text-zinc-900 tracking-tight uppercase">Milestone Collection</h3>
            </div>
            
            <div className="grid grid-cols-6 gap-6">
              {badges.map(badge => (
                <div 
                  key={badge.badgeKey}
                  onClick={() => setSelectedBadge(badge)}
                  className={`group relative p-6 rounded-3xl border transition-all cursor-pointer text-center ${
                    badge.earned 
                    ? 'bg-white border-gray-100 hover:shadow-xl hover:-translate-y-1' 
                    : 'bg-gray-50/50 border-gray-100/50 opacity-60'
                  }`}
                >
                  <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center transition-all overflow-hidden border-2 ${
                    badge.earned ? 'bg-indigo-50 group-hover:scale-110 border-white shadow-sm' : 'bg-gray-200 grayscale border-transparent'
                  }`}>
                    {badge.imageUrl ? (
                      <img src={badge.imageUrl} alt={badge.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <Award className={badge.earned ? 'text-[#451ebb]' : 'text-gray-400'} size={32} />
                    )}
                  </div>

                  {!badge.earned && (
                    <div className="absolute top-4 right-4 bg-white rounded-full p-1 shadow-sm">
                      <Lock size={12} className="text-gray-400" />
                    </div>
                  )}

                  <h4 className={`text-[11px] font-black uppercase tracking-tight mb-1 line-clamp-1 ${
                    badge.earned ? 'text-zinc-900' : 'text-gray-400'
                  }`}>
                    {badge.displayName}
                  </h4>
                  
                  <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                    badge.rarity === 'LEGENDARY' ? 'bg-amber-100 text-amber-700' :
                    badge.rarity === 'EPIC' ? 'bg-purple-100 text-violet-700' :
                    badge.rarity === 'RARE' ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {badge.rarity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedBadge(null)} />
          
          <div className="neu w-full max-w-lg overflow-hidden relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="p-12 text-center">
              <div className={`w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl ${
                selectedBadge.earned ? 'bg-gradient-to-br from-[#451ebb] to-[#6c5dd3]' : 'bg-gray-100'
              }`}>
                {selectedBadge.imageUrl ? (
                  <img src={selectedBadge.imageUrl} alt="Badge" className={`w-full h-full object-cover ${!selectedBadge.earned && 'grayscale opacity-40'}`} />
                ) : (
                  <Award className={selectedBadge.earned ? 'text-white' : 'text-gray-300'} size={60} />
                )}
              </div>

              <span className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4 ${
                selectedBadge.rarity === 'LEGENDARY' ? 'bg-amber-50 text-amber-600' :
                selectedBadge.rarity === 'EPIC' ? 'bg-purple-50 text-violet-700' : 'bg-indigo-50 text-indigo-600'
              }`}>
                {selectedBadge.rarity}
              </span>

              <h3 className="text-3xl font-black text-zinc-900 uppercase tracking-tight mb-4">
                {selectedBadge.displayName}
              </h3>
              
              <p className="text-gray-500 leading-relaxed mb-10 px-6">
                {selectedBadge.description}
              </p>

              {selectedBadge.earned ? (
                <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Earned On</p>
                  <p className="text-lg font-black text-zinc-900 italic">
                    {new Date(selectedBadge.earnedAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                    <Lock size={14} /> Requirement
                  </p>
                  <p className="text-sm font-bold text-amber-900 leading-snug">
                    Keep studying and pushing your limits to unlock this prestigious milestone!
                  </p>
                </div>
              )}

              <button 
                onClick={() => setSelectedBadge(null)}
                className="mt-10 w-full bg-zinc-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.1em] text-xs hover:bg-black transition-all"
              >
                Close Achievement
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

const AchievementCard = ({ badge, onClick }) => (
  <div 
    onClick={onClick}
    className="group neu p-8 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-8"
  >
    <div className="w-28 h-28 rounded-full bg-[#f5f6ff] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden border-4 border-white shadow-md">
      {badge.imageUrl ? (
        <img src={badge.imageUrl} alt={badge.displayName} className="w-full h-full object-cover" />
      ) : (
        <Award className="text-[#451ebb]" size={40} />
      )}
    </div>
    
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-2">
        <span className={`px-2 py-0.5 rounded text-xs font-black uppercase tracking-wider ${
          badge.rarity === 'LEGENDARY' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-violet-700'
        }`}>
          {badge.rarity}
        </span>
        <span className="text-[10px] font-bold text-gray-400 italic">Unlocked</span>
      </div>
      <h4 className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-2">{badge.displayName}</h4>
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 italic">{badge.description}</p>
    </div>
    
    <div className="bg-gray-50 rounded-full p-2 group-hover:bg-[#451ebb] group-hover:text-white transition-colors">
      <ChevronRight size={20} />
    </div>
  </div>
);

export default AchievementsPage;
