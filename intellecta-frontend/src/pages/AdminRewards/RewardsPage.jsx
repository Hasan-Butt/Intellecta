import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import Navbar from '../../components/dashboard/Navbar';
import badgeService from '../../services/badgeService';
import { 
  Award, 
  Plus, 
  Filter, 
  LayoutGrid, 
  PieChart, 
  Search, 
  MoreVertical,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Edit,
  Upload,
  Trash2,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';

const RewardsPage = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBadge, setEditingBadge] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newBadge, setNewBadge] = useState({ badgeKey: '', displayName: '', description: '', rarity: 'COMMON', ruleType: 'TOTAL_SESSIONS', ruleThreshold: 1, targetPercentage: 0 });
  const [newBadgeImage, setNewBadgeImage] = useState(null);
  const [newBadgeImagePreview, setNewBadgeImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const data = await badgeService.getAllBadgeDefs();
      setBadges(data);
    } catch (error) {
      console.error("Failed to fetch badges", error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeBadgeForEdit = (badge) => ({
    ...badge,
    displayName: badge?.displayName ?? '',
    description: badge?.description ?? '',
    rarity: badge?.rarity ?? 'COMMON',
    targetPercentage: Number.isFinite(badge?.targetPercentage) ? badge.targetPercentage : 0
  });

  const handleEdit = (badge) => {
    setEditingBadge(normalizeBadgeForEdit(badge));
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await badgeService.updateBadgeDef(editingBadge.badgeKey, {
        displayName: editingBadge.displayName,
        description: editingBadge.description,
        rarity: editingBadge.rarity,
        targetPercentage: editingBadge.targetPercentage,
        ruleType: editingBadge.ruleType,
        ruleThreshold: editingBadge.ruleThreshold
      });
      setIsModalOpen(false);
      fetchBadges();
    } catch (error) {
      alert("Failed to save badge");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!newBadge.badgeKey.trim() || !newBadge.displayName.trim()) {
      setCreateError('Badge Key and Display Name are required.');
      return;
    }
    try {
      setUploading(true);
      await badgeService.createBadgeDef(newBadge);
      
      if (newBadgeImage) {
        const finalKey = newBadge.badgeKey.toUpperCase().replace(/ /g, "_");
        await badgeService.uploadBadgeImage(finalKey, newBadgeImage);
      }

      setIsCreating(false);
      setNewBadge({ badgeKey: '', displayName: '', description: '', rarity: 'COMMON', ruleType: 'TOTAL_SESSIONS', ruleThreshold: 1, targetPercentage: 0 });
      setNewBadgeImage(null);
      setNewBadgeImagePreview(null);
      fetchBadges();
    } catch (error) {
      setCreateError(error?.response?.data?.message || 'Failed to create badge. Badge key may already exist.');
    } finally {
      setUploading(false);
    }
  };

  const handleNewBadgeImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewBadgeImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewBadgeImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      await badgeService.uploadBadgeImage(editingBadge.badgeKey, file);
      
      // Fetch fresh data
      const updated = await badgeService.getAllBadgeDefs();
      const currentBadgeKey = editingBadge.badgeKey;
      
      // Add cache buster to URLs to force browser to reload changed assets if the URL is static
      const cacheBuster = `?t=${Date.now()}`;
      const processedBadges = updated.map(b => ({
        ...b,
        imageUrl: b.imageUrl ? `${b.imageUrl}${b.imageUrl.includes('?') ? '&' : '?'}${Date.now()}` : null
      }));
      
      setBadges(processedBadges);
      const newBadge = processedBadges.find(b => b.badgeKey === currentBadgeKey);
      if (newBadge) {
        setEditingBadge(normalizeBadgeForEdit(newBadge));
      }
      
      // Reset input so same file can be uploaded again if needed
      e.target.value = '';
    } catch (error) {
      console.error("Upload failed", error);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const legendaryBadges = badges.filter(b => b.rarity === 'LEGENDARY');
  const epicBadges = badges.filter(b => b.rarity === 'EPIC');
  const others = badges.filter(b => b.rarity !== 'LEGENDARY' && b.rarity !== 'EPIC');

  const totalBadges = badges.length;
  const legendaryCount = legendaryBadges.length;
  const epicCount = epicBadges.length;
  const rareCount = badges.filter(b => b.rarity === 'RARE').length;
  const commonCount = badges.filter(b => b.rarity === 'COMMON').length;

  const totalUnlocks = badges.reduce((sum, b) => sum + (b.unlockCount || 0), 0);
  const avgUnlockRate = totalBadges > 0 
    ? (badges.reduce((sum, b) => sum + (b.unlockPercentage || 0), 0) / totalBadges) 
    : 0;

  const stats = [
    { label: 'LEGENDARY TIERS', value: legendaryCount, sub: 'Rare Collections', subColor: 'text-[#B41340]' },
    { label: 'TOTAL BADGES', value: totalBadges, sub: 'Active Rewards', subColor: 'text-gray-400' }
  ];

  const distribution = [
    { type: 'COMMON (70% TARGET)', target: 70, current: totalBadges > 0 ? Math.round((commonCount / totalBadges) * 100) : 0 },
    { type: 'RARE (20% TARGET)', target: 20, current: totalBadges > 0 ? Math.round((rareCount / totalBadges) * 100) : 0 },
    { type: 'EPIC (8% TARGET)', target: 8, current: totalBadges > 0 ? Math.round((epicCount / totalBadges) * 100) : 0 },
    { type: 'LEGENDARY (2% TARGET)', target: 2, current: totalBadges > 0 ? Math.round((legendaryCount / totalBadges) * 100) : 0 },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <div className="bg-[#f8f9fc] min-h-screen flex w-full">
          <Sidebar />
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
        <Sidebar />
        
        <main className="flex-1 p-8 overflow-y-auto">
        {/* Header Stats Bento */}
        <div className="flex gap-6 mb-12">
          {/* Main Stats Card */}
          <div className="flex-1 bg-gradient-to-br from-[#633ECD] to-[#572FC1] rounded-2xl p-10 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
            <div className="relative z-10">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Global Engagement</p>
              <h2 className="text-5xl font-extrabold mb-8 leading-tight">{avgUnlockRate.toFixed(1)}% Unlock Rate</h2>
              
              <div className="flex items-center gap-4 max-w-sm">
                <div className="flex-1 h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-[#3FFF8B] transition-all duration-1000" style={{ width: `${avgUnlockRate}%` }} />
                </div>
                <span className="text-sm font-bold opacity-90 whitespace-nowrap">System Average</span>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          </div>

          {/* Quick Stat Cards */}
          {stats.map((stat, i) => (
            <div key={i} className="w-64 bg-white rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{stat.label}</p>
              <h3 className="text-5xl font-black text-[#161c27] mb-3">{stat.value}</h3>
              <p className={`text-xs font-bold ${stat.subColor}`}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Management Tools */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex gap-3">
            <button
              onClick={() => setIsCreating(true)}
              className="bg-[#633ECD] text-white px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-[#572FC1] transition-all">
              <Plus size={18} />
              Create New Reward
            </button>
            <button className="bg-white text-[#633ECD] border border-gray-100 px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-gray-50 transition-all">
              <Filter size={18} />
              Filter Logic
            </button>
          </div>

          <div className="bg-gray-100 p-1.5 rounded-xl flex gap-1">
            <button className="bg-white shadow-sm text-[#633ECD] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
              <LayoutGrid size={14} /> Hierarchy View
            </button>
            <button className="text-gray-500 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
              <PieChart size={14} /> Distribution Map
            </button>
          </div>
        </div>

        {/* Top-Tier Rarities Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-[#B41340] rounded-full" />
            <h3 className="text-xl font-black text-zinc-900 tracking-tight">Top-Tier Rarities</h3>
            <span className="bg-[#FEF3F2] text-[#B41340] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">High Impact</span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[...legendaryBadges, ...epicBadges].map((badge) => (
              <div 
                key={badge.badgeKey}
                onClick={() => handleEdit(badge)}
                className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="flex gap-6 relative z-10">
                 <div className="w-32 h-32 rounded-2xl bg-[#E9E8E7] overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
  {badge.imageUrl ? (
    <img src={badge.imageUrl} alt={badge.displayName} className="w-full h-full object-cover" />
  ) : (
                      <Award className="text-gray-400" size={48} />
                    )}
                  </div>

                  <div className="flex-1 pt-1">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                        badge.rarity === 'LEGENDARY' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {badge.rarity}
                      </span>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                        {badge.unlockPercentage}% Earned
                      </span>
                    </div>

                    <h4 className="text-lg font-black text-zinc-900 uppercase tracking-tight mb-2 group-hover:text-[#633ECD] transition-colors line-clamp-1">
                      {badge.displayName}
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                      {badge.description}
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${badge.badgeKey}${i}`} alt="Earner" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{badge.unlockCount} Total Earners</span>
                    </div>
                  </div>
                </div>
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>

        {/* Operational Hierarchy Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[#A88FFF] rounded-full" />
              <h3 className="text-xl font-black text-zinc-900 tracking-tight">Operational Hierarchy</h3>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Displaying {others.length} of {totalBadges}</p>
          </div>

          <div className="grid grid-cols-6 gap-5">
            {others.map((badge) => (
              <div 
                key={badge.badgeKey}
                onClick={() => handleEdit(badge)}
                className="group bg-white rounded-2xl p-6 text-center border border-gray-100 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="w-20 h-20 rounded-full bg-[#E9E8E7] mx-auto mb-5 overflow-hidden flex items-center justify-center group-hover:bg-[#f5f6ff] transition-colors">
  {badge.imageUrl ? (
    <img src={badge.imageUrl} alt={badge.displayName} className="w-full h-full object-cover" />
  ) : (
                    <Award className="text-gray-400" size={32} />
                  )}
                </div>
                <span className={`inline-block px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider mb-2 ${
                  badge.rarity === 'RARE' ? 'bg-blue-50 text-blue-700' : 'bg-zinc-100 text-zinc-600'
                }`}>
                  {badge.rarity}
                </span>
                <h5 className="text-[11px] font-black text-zinc-900 uppercase tracking-tight mb-1 line-clamp-1 group-hover:text-[#633ECD] transition-colors">
                  {badge.displayName}
                </h5>
              </div>
            ))}

            <div
              onClick={() => setIsCreating(true)}
              className="bg-white rounded-2xl p-6 text-center border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3 hover:border-[#633ECD] transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                <Plus size={24} className="text-gray-300 group-hover:text-[#633ECD]" />
              </div>
              <div>
                <p className="text-[11px] font-black text-gray-300 uppercase tracking-tight group-hover:text-[#633ECD]">Add Badge</p>
                <p className="text-[9px] font-bold text-gray-300">Create New Tier</p>
              </div>
            </div>
          </div>
        </div>

        {/* Distribution Analytics Section */}
        <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-2">Distribution Analytics</h3>
              <p className="text-sm text-gray-500">Balancing reward scarcity versus user motivation</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#633ECD] rounded-[2px]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Ideal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#DDDCDC] rounded-[2px]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Current</span>
              </div>
            </div>
          </div>

          <div className="space-y-10 mb-12">
            {distribution.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-black text-zinc-800 tracking-tight">{item.type}</p>
                  <p className="text-xs font-black text-[#633ECD]">{item.current}% ACTIVE</p>
                </div>
                <div className="h-1.5 bg-[#E9E8E7] rounded-full relative">
                  <div 
                    className="absolute h-full bg-[#633ECD] rounded-full z-10 transition-all duration-1000"
                    style={{ width: `${item.current}%` }}
                  />
                  <div 
                    className="absolute h-full bg-transparent border-r-2 border-zinc-400 z-20"
                    style={{ left: `${item.target}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#006A33]/5 border border-[#006A33]/10 rounded-xl p-6 flex gap-4">
            <ShieldCheck className="text-[#006A33] shrink-0" size={20} />
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#006A33] mb-1">Sanctuary Health Check</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                The hierarchy is currently well-balanced. We recommend adding 2 more Legendary rewards to incentivize power-users who have cleared existing Epic tiers.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Create Badge Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCreating(false)} />
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Create New Badge</h3>
                <p className="text-sm text-gray-400 font-medium tracking-tight">Define a new reward milestone</p>
              </div>
              <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-8 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    Badge Key <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NIGHT_OWL"
                    value={newBadge.badgeKey}
                    onChange={e => setNewBadge({...newBadge, badgeKey: e.target.value.toUpperCase().replace(/\s+/g, '_')})}
                    className="w-full bg-[#f8f9fc] border-none rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#633ECD] transition-all font-mono"
                  />
                  <p className="text-[9px] text-gray-400 mt-1 font-bold">Unique identifier — uppercase, underscores only</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    Display Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Night Owl"
                    value={newBadge.displayName}
                    onChange={e => setNewBadge({...newBadge, displayName: e.target.value})}
                    className="w-full bg-[#f8f9fc] border-none rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#633ECD] transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the achievement..."
                    value={newBadge.description}
                    onChange={e => setNewBadge({...newBadge, description: e.target.value})}
                    className="w-full bg-[#f8f9fc] border-none rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#633ECD] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Rarity</label>
                  <select
                    value={newBadge.rarity}
                    onChange={e => setNewBadge({...newBadge, rarity: e.target.value})}
                    className="w-full bg-[#f8f9fc] border-none rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#633ECD] transition-all"
                  >
                    <option value="COMMON">COMMON</option>
                    <option value="RARE">RARE</option>
                    <option value="EPIC">EPIC</option>
                    <option value="LEGENDARY">LEGENDARY</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Rule Type</label>
                  <select
                    value={newBadge.ruleType}
                    onChange={e => setNewBadge({...newBadge, ruleType: e.target.value})}
                    className="w-full bg-[#f8f9fc] border-none rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#633ECD] transition-all"
                  >
                    <option value="TOTAL_SESSIONS">Total Sessions</option>
                    <option value="STREAK_DAYS">Streak Days</option>
                    <option value="SESSION_DURATION">Session Duration (Mins)</option>
                    <option value="DEEP_WORK_SESSION">Deep Work Session (Mins)</option>
                    <option value="EARLY_BIRD">Early Bird (Before 8 AM)</option>
                    <option value="NIGHT_OWL">Night Owl (After 10 PM)</option>
                    <option value="TOTAL_NOTES">Total Notes</option>
                    <option value="TOTAL_POMODOROS">Total Pomodoros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Rule Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={newBadge.ruleThreshold}
                    onChange={e => setNewBadge({...newBadge, ruleThreshold: parseInt(e.target.value) || 1})}
                    className="w-full bg-[#f8f9fc] border-none rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#633ECD] transition-all"
                  />
                  <p className="text-[9px] text-gray-400 mt-1 font-bold">Value required to earn this badge</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Target Unlock %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newBadge.targetPercentage}
                    onChange={e => setNewBadge({...newBadge, targetPercentage: parseFloat(e.target.value) || 0})}
                    className="w-full bg-[#f8f9fc] border-none rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#633ECD] transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Badge Graphic (Optional)</label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                      {newBadgeImagePreview ? (
                        <img src={newBadgeImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Award className="text-gray-300" size={32} />
                      )}
                    </div>
                    <label className={`cursor-pointer bg-white border-2 border-[#633ECD] text-[#633ECD] px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <Upload size={18} />
                      {newBadgeImage ? 'Change Asset' : 'Upload Asset'}
                      <input type="file" className="hidden" onChange={handleNewBadgeImageSelect} accept="image/*" />
                    </label>
                  </div>
                </div>
              </div>

              {createError && (
                <div className="mb-6 bg-red-50 border border-red-100 rounded-xl px-5 py-4">
                  <p className="text-xs font-bold text-red-600">{createError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#633ECD] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:bg-[#572FC1] transition-all"
              >
                Create Badge
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Edit Badge</h3>
                <p className="text-sm text-gray-400 font-medium tracking-tight">Configuration for {editingBadge.badgeKey}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Display Name</label>
                  <input 
                    type="text"
                    value={editingBadge.displayName}
                    onChange={e => setEditingBadge({...editingBadge, displayName: e.target.value})}
                    className="w-full bg-[#f8f9fc] border-none rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#633ECD] transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Description</label>
                  <textarea 
                    rows={3}
                    value={editingBadge.description}
                    onChange={e => setEditingBadge({...editingBadge, description: e.target.value})}
                    className="w-full bg-[#f8f9fc] border-none rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#633ECD] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Rarity</label>
                  <select 
                    value={editingBadge.rarity}
                    onChange={e => setEditingBadge({...editingBadge, rarity: e.target.value})}
                    className="w-full bg-[#f8f9fc] border-none rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#633ECD] transition-all"
                  >
                    <option value="COMMON">COMMON</option>
                    <option value="RARE">RARE</option>
                    <option value="EPIC">EPIC</option>
                    <option value="LEGENDARY">LEGENDARY</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Target Unlock %</label>
                  <input 
                    type="number"
                    value={editingBadge.targetPercentage}
                    onChange={e => setEditingBadge({...editingBadge, targetPercentage: parseFloat(e.target.value)})}
                    className="w-full bg-[#f8f9fc] border-none rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#633ECD] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Rule Type</label>
                  <select 
                    value={editingBadge.ruleType || "TOTAL_SESSIONS"}
                    onChange={e => setEditingBadge({...editingBadge, ruleType: e.target.value})}
                    className="w-full bg-[#f8f9fc] border-none rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#633ECD] transition-all"
                  >
                    <option value="TOTAL_SESSIONS">Total Sessions</option>
                    <option value="STREAK_DAYS">Streak Days</option>
                    <option value="SESSION_DURATION">Session Duration (Mins)</option>
                    <option value="DEEP_WORK_SESSION">Deep Work Session (Mins)</option>
                    <option value="EARLY_BIRD">Early Bird (Before 8 AM)</option>
                    <option value="NIGHT_OWL">Night Owl (After 10 PM)</option>
                    <option value="TOTAL_NOTES">Total Notes</option>
                    <option value="TOTAL_POMODOROS">Total Pomodoros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Rule Threshold</label>
                  <input 
                    type="number"
                    min="1"
                    value={editingBadge.ruleThreshold || 1}
                    onChange={e => setEditingBadge({...editingBadge, ruleThreshold: parseInt(e.target.value) || 1})}
                    className="w-full bg-[#f8f9fc] border-none rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#633ECD] transition-all"
                  />
                  <p className="text-[9px] text-gray-400 mt-1 font-bold">Value required to earn this badge</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Badge Graphic</label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
  {editingBadge.imageUrl ? (
    <img src={editingBadge.imageUrl} alt="Preview" className="w-full h-full object-cover" />
  ) : (
    <Award className="text-gray-300" size={32} />
  )}
</div>
                    <label className={`cursor-pointer bg-white border-2 border-[#633ECD] text-[#633ECD] px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <Upload size={18} />
                      {uploading ? 'Uploading...' : 'Upload New Asset'}
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  type="submit"
                  className="flex-1 bg-[#633ECD] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:bg-[#572FC1] transition-all"
                >
                  Save Configuration
                </button>
                {!editingBadge.systemDefined && (
                  <button 
                    type="button"
                    onClick={async () => {
                      Swal.fire({
                        title: "Are you sure?",
                        text: "You won't be able to revert this!",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#633ECD",
                        cancelButtonColor: "#ef4444",
                        confirmButtonText: "Yes, delete it!"
                      }).then(async (result) => {
                        if (result.isConfirmed) {
                          await badgeService.deleteBadgeDef(editingBadge.badgeKey);
                          setIsModalOpen(false);
                          fetchBadges();
                          Swal.fire("Deleted!", "Badge has been deleted.", "success");
                        }
                      });
                    }}
                    className="w-16 flex items-center justify-center bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default RewardsPage;
