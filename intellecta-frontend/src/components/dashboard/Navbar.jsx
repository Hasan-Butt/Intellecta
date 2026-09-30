import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Flame, Bell, Mail, BookOpen, LogOut, Settings as SettingsIcon,
  Home, Calendar, Zap, FileText, Folder, ClipboardCheck, Target, BarChart3, Trophy,
  LayoutDashboard, Users as UsersIcon, TrendingUp, Award, ChevronRight, History, Video,
  CheckCheck
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import intellectaLogo from '../../assets/intellectaLogo.jpeg';
import api from '../../services/api';
import Avatar from '../common/Avatar';
import { logout, getUserId } from '../../utils/auth';
import { getInitialProfile, setUserProfile } from '../../utils/userCache';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredPages, setFilteredPages] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize from cache immediately to prevent visual flash
  const [userData, setUserData] = useState(() => {
    const cached = getInitialProfile();
    return {
      username: cached?.username || 'Hasan Butt',
      email: cached?.email || 'hasan@intellecta.com',
      bio: cached?.bio || 'Focus. Learn. Achieve.',
      avatarUrl: cached?.avatarUrl || '',
      streakDays: cached?.streakDays || 0
    };
  });
  
  const menuRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  const handleLogout = () => {
    logout();
  };

  const allPages = [
    // Student Pages
    { name: 'Dashboard', path: '/studentDashboard', icon: Home, category: 'Student' },
    { name: 'Study Schedule', path: '/schedule', icon: Calendar, category: 'Student' },
    { name: 'Video Lectures', path: '/lectures', icon: Video, category: 'Student' },
    { name: 'Focus Sessions', path: '/focus', icon: Zap, category: 'Student' },
    { name: 'Focus Analytics', path: '/focusSession', icon: BarChart3, category: 'Student' },
    { name: 'Distraction Logs', path: '/distractions', icon: Flame, category: 'Student' },
    { name: 'My Notes', path: '/notes', icon: FileText, category: 'Student' },
    { name: 'Subject Folders', path: '/folders', icon: Folder, category: 'Student' },
    { name: 'Attempt Quiz', path: '/quiz', icon: ClipboardCheck, category: 'Student' },
    { name: 'Quiz Results', path: '/results', icon: History, category: 'Student' },
    { name: 'Coverage Tracker', path: '/coverage', icon: Target, category: 'Student' },
    { name: 'Leaderboard', path: '/leaderboard', icon: BarChart3, category: 'Student' },
    { name: 'Peer Comparison', path: '/peers', icon: BarChart3, category: 'Student' },
    { name: 'Achievements', path: '/achievements', icon: Trophy, category: 'Student' },
    // Admin Pages
    { name: 'Admin Overview', path: '/dashboard', icon: LayoutDashboard, category: 'Admin' },
    { name: 'Manage Users', path: '/users', icon: UsersIcon, category: 'Admin' },
    { name: 'Content Repository', path: '/content', icon: BookOpen, category: 'Admin' },
    { name: 'Create New Quiz', path: '/create-quiz', icon: ClipboardCheck, category: 'Admin' },
    { name: 'Quiz Submissions', path: '/quiz-submissions', icon: History, category: 'Admin' },
    { name: 'Global Analytics', path: '/analytics', icon: BarChart3, category: 'Admin' },
    { name: 'Performance Trends', path: '/trends', icon: TrendingUp, category: 'Admin' },
    { name: 'Rewards System', path: '/rewards', icon: Award, category: 'Admin' },
    // Common
    { name: 'Settings', path: '/settings', icon: SettingsIcon, category: 'General' },
  ];

  useEffect(() => {
    if (searchValue.trim() === "") {
      setFilteredPages([]);
    } else {
      const isAdminPath = location.pathname.startsWith('/dashboard') || 
                         location.pathname.startsWith('/users') || 
                         location.pathname.startsWith('/content') || 
                         location.pathname.startsWith('/analytics') || 
                         location.pathname.startsWith('/trends') || 
                         location.pathname.startsWith('/rewards') ||
                         location.pathname.startsWith('/create-quiz') ||
                         location.pathname.startsWith('/quiz-submissions');
      
      const roleFilter = isAdminPath ? 'Admin' : 'Student';

      const filtered = allPages.filter(page => {
        const matchesSearch = page.name.toLowerCase().includes(searchValue.toLowerCase());
        const isCorrectRole = page.category === roleFilter || page.category === 'General';
        return matchesSearch && isCorrectRole;
      });
      setFilteredPages(filtered);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, location.pathname]);

  const fetchUserData = async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const res = await api.get(`/users/${userId}/profile`);
      const profile = {
        username: res.data.username || 'Hasan Butt',
        email: res.data.email || 'hasan@intellecta.com',
        bio: res.data.bio || 'Focus. Learn. Achieve.',
        avatarUrl: res.data.avatarUrl || '',
        streakDays: res.data.streakDays || 0
      };
      setUserData(profile);
      setUserProfile(profile);
    } catch (err) {
      console.error("Failed to fetch navbar user data", err);
    }
  };

  const fetchNotifications = async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const res = await api.get(`/notifications/user/${userId}`);
      setNotifications(res.data || []);
      const unread = (res.data || []).filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      // Backend might be quiet or no notifications yet
      console.debug("Notification fetch note:", err.message);
    }
  };

  const handleMarkAsRead = async (notification) => {
    // 1. Optimistically mark as read and navigate immediately
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    setShowNotifications(false);

    if (notification.link) {
      navigate(notification.link);
    }

    // 2. Inform backend via PATCH or PUT
    try {
      await api.patch(`/notifications/${notification.id}/read`);
    } catch (err) {
      try {
        await api.put(`/notifications/${notification.id}/read`);
      } catch (e) {
        console.error("Failed to mark notification as read", e);
      }
    }
  };

  const handleMarkAllRead = async () => {
    const userId = getUserId();
    if (!userId) return;
    // Optimistically mark all notifications read
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await api.patch(`/notifications/user/${userId}/read-all`);
    } catch (err) {
      try {
        await api.put(`/notifications/user/${userId}/read-all`);
      } catch (e) {
        console.error("Failed to mark all notifications as read", e);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchNotifications();

    // Poll for notifications every 45s
    const timer = setInterval(fetchNotifications, 45000);

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(timer);
    };
  }, []);

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="w-full bg-[#F9FAFB] border-b border-gray-200 font-inter sticky top-0 z-50 print:hidden">
      <div className="max-w-[1920px] mx-auto px-4 py-2 md:py-0 min-h-[56px] flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3">
        
        {/* Mobile Menu Toggle & Logo Section */}
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/studentDashboard')}>
            <div className="relative w-10 h-10 md:w-11 md:h-11 flex items-center justify-center">
              <img 
                src={intellectaLogo} 
                alt="Intellecta Logo" 
                className="w-full h-full object-cover rounded-xl shadow-[0_4px_14px_rgba(83,210,224,0.38)] transform group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            
            <div className="flex flex-col leading-none hidden sm:flex">
              <span className="text-xl md:text-2xl font-black text-[#111827] tracking-tighter">
                Intellecta
              </span>
              <span className="text-[8px] md:text-[9px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mt-1">
                Focus. Learn. Achieve.
              </span>
            </div>
          </div>
        </div>

        {/* Center Section: Search Bar (Hidden on mobile, visible on desktop) */}
        <div className="hidden md:flex md:flex-1 md:max-w-lg md:px-8 relative" ref={searchRef}>
          <div className={`w-full relative transition-all duration-300 flex items-center h-11 px-5 rounded-full bg-[#EEF2FF] border border-transparent ${
            isSearchFocused ? 'ring-4 ring-indigo-50 bg-white border-indigo-200' : ''
          }`}>
            <Search 
              size={18} 
              className={`mr-3 transition-colors ${isSearchFocused ? 'text-[#6366F1]' : 'text-[#9CA3AF]'}`} 
            />
            <input
              type="text"
              placeholder="Search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredPages.length > 0) {
                  navigate(filteredPages[0].path);
                  setSearchValue("");
                  setIsSearchFocused(false);
                }
              }}
              className="w-full bg-transparent text-sm md:text-base text-[#111827] placeholder-[#9CA3AF] outline-none font-medium"
            />
          </div>

          {/* Search Results Dropdown */}
          {isSearchFocused && filteredPages.length > 0 && (
            <div className="absolute top-full left-0 md:left-8 right-0 md:right-8 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2">
                <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Quick Navigation</p>
                {filteredPages.map((page) => (
                  <button
                    key={page.path}
                    onMouseDown={() => {
                      navigate(page.path);
                      setSearchValue("");
                      setIsSearchFocused(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-indigo-50 group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                        <page.icon size={18} className="text-gray-400 group-hover:text-indigo-600" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-900">{page.name}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{page.category}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto order-2 md:order-none">
          <button aria-label="View Streak" className={`p-2 rounded-full bg-transparent transition-all relative group border border-transparent ${
            userData.streakDays > 0 
              ? 'text-orange-500 hover:bg-orange-50/50 hover:border-orange-100' 
              : 'text-gray-400 hover:bg-gray-50/50 hover:border-gray-200'
          }`}>
            <Flame 
              size={20} 
              className={`md:w-6 md:h-6 transition-all ${
                userData.streakDays > 0 
                  ? 'fill-orange-500 animate-fire' 
                  : 'grayscale opacity-50'
              }`} 
            />
            {userData.streakDays > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2 md:h-2.5 md:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-orange-600"></span>
              </span>
            )}
          </button>

          {/* Notifications Section with Popover */}
          <div className="relative" ref={notificationRef}>
            <button 
              aria-label="View Notifications" 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-full transition-all relative border border-transparent ${
                showNotifications 
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200' 
                  : 'hover:bg-gray-100 text-[#6B7280] hover:border-gray-200'
              }`}
            >
              <Bell size={20} className="md:w-6 md:h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-indigo-600 rounded-full border-2 border-white shadow-sm animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-5 py-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-gray-900 tracking-tight">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-black bg-indigo-100 text-indigo-700 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                    >
                      <CheckCheck size={14} />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
                        <Bell size={22} />
                      </div>
                      <p className="text-sm font-bold text-gray-700">All caught up!</p>
                      <p className="text-xs text-gray-400 mt-0.5">No new notifications right now.</p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleMarkAsRead(item)}
                        className={`p-4 flex items-start gap-3.5 hover:bg-indigo-50/40 cursor-pointer transition-colors ${
                          !item.read ? 'bg-indigo-50/20' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${
                          item.type === 'QUIZ' 
                            ? 'bg-purple-100 text-purple-700' 
                            : item.type === 'LECTURE' 
                            ? 'bg-sky-100 text-sky-700' 
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {item.type === 'QUIZ' ? (
                            <ClipboardCheck size={16} />
                          ) : item.type === 'LECTURE' ? (
                            <Video size={16} />
                          ) : (
                            <Bell size={16} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className={`text-xs font-bold truncate ${!item.read ? 'text-gray-900' : 'text-gray-600'}`}>
                              {item.title}
                            </p>
                            {!item.read && (
                              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>
                          <span className="text-[10px] font-semibold text-gray-400 mt-1 block">
                            {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Click any notification to open
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-8 md:h-12 w-[1px] bg-gray-200 mx-1" />
          
          {/* Profile Section with Popover */}
          <div className="relative" ref={menuRef}>
            <button 
              aria-label="Toggle Profile Menu"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-1 p-0.5 rounded-full ring-2 transition-all ${
                showProfileMenu ? 'ring-indigo-500' : 'ring-transparent hover:ring-indigo-100'
              }`}
            >
              <Avatar src={userData.avatarUrl} name={userData.username} />
            </button>

            {/* Profile Popover */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 bg-gradient-to-br from-[#451ebb] to-[#5d3fd3] text-white">
                  <div className="flex items-center gap-4">
                    <Avatar src={userData.avatarUrl} name={userData.username} size="w-14 h-14" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg truncate">{userData.username}</h4>
                      <p className="text-white/70 text-xs truncate">Student Scholar</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 transition-colors">
                    <Mail size={16} className="text-gray-400" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                      <p className="text-xs font-bold text-zinc-800 truncate">{userData.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 transition-colors">
                    <BookOpen size={16} className="text-gray-400" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">About Me</p>
                      <p className="text-xs font-medium text-zinc-600 line-clamp-2">{userData.bio || 'No bio available'}</p>
                    </div>
                  </div>

                  <div className="h-[1px] bg-gray-100 my-2" />

                  <button 
                    onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-indigo-50 text-indigo-600 transition-colors text-sm font-bold"
                  >
                    <SettingsIcon size={16} />
                    Account Settings
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 text-red-600 transition-colors text-sm font-bold"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="lg:hidden w-full bg-white border-t border-gray-100 max-h-[70vh] overflow-y-auto px-4 py-2 shadow-lg absolute left-0 right-0 z-40">
          <p className="px-2 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Navigation</p>
          <div className="flex flex-col gap-1">
            {allPages.filter(p => p.category === (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/users') || location.pathname.startsWith('/content') ? 'Admin' : 'Student') || p.category === 'General').map(page => (
              <button
                key={page.path}
                onClick={() => {
                  navigate(page.path);
                  setShowMobileMenu(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${location.pathname === page.path ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <page.icon size={18} className={location.pathname === page.path ? 'text-indigo-600' : 'text-gray-400'} />
                <span className="text-sm font-bold">{page.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;