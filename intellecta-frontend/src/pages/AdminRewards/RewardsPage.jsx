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

const RewardsPage = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBadge, setEditingBadge] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

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
  const totalUnlocks = badges.reduce((sum, b) => sum + (b.unlockCount || 0), 0);
  const avgUnlockRate = totalBadges > 0 ? (totalUnlocks / (totalBadges * 100)) * 100 : 0; // Simplified for display

  const stats = [
    { label: 'LEGENDARY TIERS', value: legendaryBadges.length, sub: '+2 This Month', subColor: 'text-[#006A33]' },
    { label: 'TOTAL BADGES', value: totalBadges, sub: 'Active in System', subColor: 'text-gray-400' }
  ];

  const distribution = [
    { type: 'COMMON (70% TARGET)', target: 70, current: 72 },
    { type: 'RARE (20% TARGET)', target: 20, current: 19 },
    { type: 'EPIC (8% TARGET)', target: 8, current: 8.2 },
    { type: 'LEGENDARY (2% TARGET)', target: 2, current: 0.8 },
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
              <h2 className="text-5xl font-extrabold mb-8 leading-tight">74.2% Unlock Rate</h2>
              
              <div className="flex items-center gap-4 max-w-sm">
                <div className="flex-1 h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-[#3FFF8B] w-[74.2%]" />
                </div>
                <span className="text-sm font-bold opacity-90 whitespace-nowrap">Progressive Spike</span>
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
            <button className="bg-[#633ECD] text-white px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-[#572FC1] transition-all">
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
                      {/* Removed unlock percentage */}
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
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">14 Recent Earners</span>
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Displaying 1-12 of 134</p>
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

            <div className="bg-white rounded-2xl p-6 text-center border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3 hover:border-[#633ECD] transition-all cursor-pointer group">
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

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Edit Badge</h3>
                <p className="text-sm text-gray-400 font-medium tracking-tight">Configuration for {editingBadge.badgeKey}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-10">
              <div className="grid grid-cols-2 gap-8 mb-10">
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
                      if (window.confirm("Are you sure?")) {
                        await badgeService.deleteBadgeDef(editingBadge.badgeKey);
                        setIsModalOpen(false);
                        fetchBadges();
                      }
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
