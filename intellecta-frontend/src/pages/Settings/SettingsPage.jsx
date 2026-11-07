import React, { useState, useEffect, useRef } from 'react';
import StudentSidebar from '../../components/dashboard/StudentSidebar';
import Navbar from '../../components/dashboard/Navbar';
import { getUserId } from '../../utils/auth';
import { 
  User, 
  Lock, 
  Monitor, 
  ShieldCheck, 
  Save, 
  Camera,
  Check,
  Loader2,
  Sun,
  Moon
} from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Avatar from '../../components/common/Avatar';
import { uploadFile, validateImageFile } from '../../utils/uploadthing';
import { useTheme } from '../../context/ThemeContext';

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  // Form States
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
    avatarUrl: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [hasPassword, setHasPassword] = useState(true);

  const [notifications, setNotifications] = useState({
    studyReminders: true,
    achievementAlerts: true,
    weeklyReports: false
  });

  const predefinedAvatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Hasan",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aria",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe"
  ];

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const userId = getUserId();
    if (!userId) return;
    try {
      const res = await api.get(`/users/${userId}/profile`);
      setProfileData({
        username: res.data.username || '',
        email: res.data.email || '',
        bio: res.data.bio || '',
        avatarUrl: res.data.avatarUrl || predefinedAvatars[0]
      });
      setHasPassword(res.data.hasPassword !== false);
      setNotifications({
        studyReminders: res.data.studyReminders ?? true,
        achievementAlerts: res.data.achievementAlerts ?? true,
        weeklyReports: res.data.weeklyReports ?? false
      });
    } catch (err) {
      console.error("Failed to fetch profile", err);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    const userId = getUserId();
    if (!userId) return;
    try {
      const { email, ...editableFields } = profileData;
      await api.put(`/users/${userId}/profile`, {
        ...editableFields,
        ...notifications
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    setSaving(true);
    setError(null);
    const userId = getUserId();
    if (!userId) return;
    try {
      await api.put(`/users/${userId}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      Swal.fire({
        icon: "success",
        title: "Password Updated",
        text: "Your password has been changed successfully.",
        confirmButtonColor: "var(--primary-accent)",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || "Failed to update password",
        confirmButtonColor: "var(--primary-accent)",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = (url) => {
    setProfileData({ ...profileData, avatarUrl: url });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateImageFile(file);
    } catch (err) {
      setError(err.message);
      return;
    }

    setSaving(true);
    const userId = getUserId();
    if (!userId) {
      setSaving(false);
      return;
    }

    try {
      // 1. Upload direct to UploadThing
      const fileUrl = await uploadFile(file);
      
      // 2. Register new URL with backend
      const res = await api.post(`/users/${userId}/avatar`, { avatarUrl: fileUrl });
      
      setProfileData({ ...profileData, avatarUrl: res.data.avatarUrl });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to upload image");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Monitor },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-w-0 h-screen bg-[var(--bg-page)] items-center justify-center">
        <Loader2 className="animate-spin text-[var(--primary-accent)]" size={40} />
        <p className="mt-4 font-bold text-[var(--text-muted)] uppercase tracking-widest text-xs">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />
      <div className="bg-[var(--bg-page)] min-h-screen flex w-full">
        <StudentSidebar />
        
        <main className="flex-1">
          <div className="px-4 md:px-12 py-6 md:py-10 pb-20">
            {/* Header */}
            <div className="mb-8 md:mb-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 md:gap-0">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] uppercase tracking-tight">Settings</h2>
                <p className="text-[var(--text-secondary)] font-medium">Manage your account preferences and profile.</p>
              </div>
              {error && (
                <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-xs font-bold border border-red-500/20 animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Tabs */}
              <div className="w-full lg:w-64 shrink-0 space-y-2 flex flex-col sm:flex-row lg:flex-col overflow-x-auto sm:overflow-visible gap-2 sm:gap-4 lg:gap-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setError(null); }}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                      activeTab === tab.id 
                      ? 'btn-primary' 
                      : 'neu-btn bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:scale-[1.02]'
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Main Content Area */}
              <div className="flex-1 neu p-6 lg:p-10 relative min-h-[600px] flex flex-col">
                
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-8 animate-in fade-in duration-500 flex-1">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-8 pb-8 border-b border-[var(--border-subtle)]">
                      <div className="relative group mx-auto sm:mx-0">
                        <Avatar 
                          src={profileData.avatarUrl} 
                          name={profileData.username} 
                          size="w-24 h-24" 
                          className="border-4 border-[var(--bg-surface)] shadow-md" 
                        />
                        <button 
                          onClick={() => fileInputRef.current.click()}
                          className="absolute bottom-0 right-0 p-2 bg-[var(--primary-accent)] text-white rounded-full border-2 border-[var(--bg-surface)] shadow-lg hover:scale-110 transition-transform"
                        >
                          <Camera size={14} />
                        </button>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                          className="hidden" 
                          accept="image/*"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[var(--text-primary)]">{profileData.username}</h3>
                        <p className="text-sm text-[var(--text-muted)] font-bold uppercase tracking-widest">Student Scholar</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Choose an Avatar</label>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                        <button
                          onClick={() => handleAvatarSelect('')}
                          className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center font-bold text-[10px] uppercase ${
                            profileData.avatarUrl === '' ? 'border-[var(--primary-accent)] bg-[var(--primary-accent)] text-white scale-110 shadow-md' : 'border-dashed border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--primary-accent)]'
                          }`}
                          title="Use Initials"
                        >
                          Aa
                        </button>
                        {predefinedAvatars.map((url, i) => (
                          <button
                            key={i}
                            onClick={() => handleAvatarSelect(url)}
                            className={`w-10 h-10 rounded-full border-2 transition-all overflow-hidden ${
                              profileData.avatarUrl === url ? 'border-[var(--primary-accent)] scale-110 shadow-md' : 'border-transparent hover:border-[var(--border-default)]'
                            }`}
                          >
                            <img src={url} alt="Predefined Avatar" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Username</label>
                        <input 
                          type="text" 
                          value={profileData.username}
                          onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                          className="w-full px-5 py-3 neu-inset bg-transparent border-none focus:ring-0 outline-none transition-all font-bold text-[var(--text-primary)]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Email Address</label>
                        <div className="w-full px-5 py-3 neu-inset bg-transparent border-none font-bold text-[var(--text-muted)] select-none">
                          {profileData.email}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">About Me</label>
                      <textarea 
                        rows="4"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        placeholder="Tell us about your learning goals..."
                        className="w-full px-5 py-3 neu-inset bg-transparent border-none focus:ring-0 outline-none transition-all font-bold text-[var(--text-primary)] resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-8 animate-in fade-in duration-500 flex-1">
                    {hasPassword ? (
                      <>
                        <div className="bg-amber-500/10 rounded-2xl p-6 border border-amber-500/20 flex items-start gap-4">
                          <ShieldCheck className="text-amber-500 mt-1" size={24} />
                          <div>
                            <h4 className="text-sm font-black text-amber-500 uppercase">Protect your account</h4>
                            <p className="text-xs text-amber-600/90 dark:text-amber-400 font-medium mt-1">Update your password regularly to maintain high security integrity.</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Current Password</label>
                            <input 
                              type="password" 
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                              placeholder="••••••••" 
                              className="w-full px-5 py-3 neu-inset bg-transparent border-none focus:ring-0 outline-none transition-all font-bold text-[var(--text-primary)]" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">New Password</label>
                            <input 
                              type="password" 
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                              placeholder="••••••••" 
                              className="w-full px-5 py-3 neu-inset bg-transparent border-none focus:ring-0 outline-none transition-all font-bold text-[var(--text-primary)]" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Confirm New Password</label>
                            <input 
                              type="password" 
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              placeholder="••••••••" 
                              className="w-full px-5 py-3 neu-inset bg-transparent border-none focus:ring-0 outline-none transition-all font-bold text-[var(--text-primary)]" 
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-[var(--bg-subtle)] rounded-2xl p-6 border border-[var(--border-subtle)] flex items-start gap-4">
                        <ShieldCheck className="text-[var(--text-muted)] mt-1" size={24} />
                        <div>
                          <h4 className="text-sm font-black text-[var(--text-secondary)] uppercase">Google-linked account</h4>
                          <p className="text-xs text-[var(--text-muted)] font-medium mt-1">Password changes aren't available for accounts signed in with Google. Manage your sign-in options in your Google account.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div className="space-y-8 animate-in fade-in duration-500 flex-1">
                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'studyReminders', label: 'Study Reminders', desc: 'Get notified when it\'s time to focus.' },
                        { key: 'achievementAlerts', label: 'Achievement Alerts', desc: 'Celebrate your milestones instantly.' },
                        { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive a summary of your weekly performance.' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-pill)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all">
                          <div>
                            <p className="text-sm font-bold text-[var(--text-primary)]">{item.label}</p>
                            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">{item.desc}</p>
                          </div>
                          <button 
                            type="button"
                            aria-label={`Toggle ${item.label}`}
                            onClick={() => setNotifications({...notifications, [item.key]: !notifications[item.key]})}
                            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${notifications[item.key] ? 'bg-[var(--primary-accent)]' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications[item.key] ? 'left-7' : 'left-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest pt-4">App Theme</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Light Mode Button */}
                      <button 
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                          theme === 'light'
                            ? 'border-[var(--primary-accent)] bg-[var(--primary-accent-subtle)] shadow-sm'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-pill)] hover:border-[var(--border-default)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Sun size={20} className={theme === 'light' ? 'text-[var(--primary-accent)]' : 'text-[var(--text-muted)]'} />
                          <span className={`text-sm font-bold ${theme === 'light' ? 'text-[var(--primary-accent)]' : 'text-[var(--text-secondary)]'}`}>
                            Light Mode
                          </span>
                        </div>
                        {theme === 'light' && <Check size={20} className="text-[var(--primary-accent)]" />}
                      </button>

                      {/* Dark Mode Button */}
                      <button 
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                          theme === 'dark'
                            ? 'border-[var(--primary-accent)] bg-[var(--primary-accent-soft)] shadow-sm'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-pill)] hover:border-[var(--border-default)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Moon size={20} className={theme === 'dark' ? 'text-[var(--primary-accent-text)]' : 'text-[var(--text-muted)]'} />
                          <span className={`text-sm font-bold ${theme === 'dark' ? 'text-[var(--primary-accent-text)]' : 'text-[var(--text-secondary)]'}`}>
                            Dark Mode
                          </span>
                        </div>
                        {theme === 'dark' && <Check size={20} className="text-[var(--primary-accent-text)]" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="mt-auto pt-8 border-t border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 text-center md:text-left">
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                    {saving ? 'Syncing with Intellecta Cloud...' : 'Intellecta Cloud Sync Active'}
                  </p>
                  
                  {activeTab === 'security' ? (
                    hasPassword ? (
                      <button 
                        onClick={handleUpdatePassword}
                        disabled={saving || !passwordData.currentPassword || !passwordData.newPassword}
                        className="btn-primary min-w-[180px] justify-center py-4 text-xs font-black uppercase tracking-widest disabled:opacity-50 transition-all flex items-center gap-3"
                      >
                        {saving ? (
                          <><Loader2 size={16} className="animate-spin" /> Updating...</>
                        ) : success ? (
                          <><Check size={16} strokeWidth={4} /> Password Updated</>
                        ) : (
                          <>Update Password</>
                        )}
                      </button>
                    ) : (
                      <span className="min-w-[180px] justify-center py-4 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-3">
                        <ShieldCheck size={16} /> Google Account
                      </span>
                    )
                  ) : (
                    <button 
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="btn-primary min-w-[180px] justify-center py-4 text-xs font-black uppercase tracking-widest disabled:opacity-50 transition-all flex items-center gap-3"
                    >
                      {saving ? (
                        <><Loader2 size={16} className="animate-spin" /> Saving...</>
                      ) : success ? (
                        <><Check size={16} strokeWidth={4} /> Changes Saved</>
                      ) : (
                        <><Save size={16} /> Save Changes</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
