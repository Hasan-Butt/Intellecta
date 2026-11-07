import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Avatar from '../common/Avatar';
import { 
  Home, 
  Calendar, 
  Zap, 
  FileText, 
  Folder, 
  ClipboardCheck, 
  ChevronRight,
  ChevronDown,
  HelpCircle, 
  LogOut,
  Trophy,
  Target,
  Video,
  BarChart3,
  Settings
} from 'lucide-react';

import { logout } from '../../utils/auth';
import { 
  getInitialProfile, 
  getUserProfile, 
  getInitialDashboard, 
  getUserDashboard 
} from '../../utils/userCache';

const Sidebar = ({ className = "" }) => {
  const location = useLocation();
  const helpBoxRef = useRef(null);

  const initialProfile = getInitialProfile();
  const initialDashboard = getInitialDashboard();

  const [userLevel, setUserLevel] = useState(initialDashboard?.level ?? 1);
  const [levelTitle, setLevelTitle] = useState(initialDashboard?.levelTitle ?? 'Beginner');
  const [userName, setUserName] = useState(initialProfile?.username ?? 'Scholar');
  const [xpProgressPct, setXpProgressPct] = useState(initialDashboard?.xpProgressPct ?? 0);
  
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(
    location.pathname === '/distractions' || location.pathname === '/focusSession'
  );
  const [isQuizOpen, setIsQuizOpen] = useState(
    location.pathname === '/quiz' || location.pathname === '/results'
  );
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix');
  const [showHelpBox, setShowHelpBox] = useState(false);

  useEffect(() => {
    const syncData = async (force = false) => {
      const profile = await getUserProfile(force);
      if (profile) {
        setUserName(profile.username ?? 'Scholar');
        setAvatarUrl(profile.avatarUrl || '');
      }

      const dash = await getUserDashboard(force);
      if (dash) {
        setUserLevel(dash.level ?? 1);
        setLevelTitle(dash.levelTitle ?? 'Beginner');
        setXpProgressPct(dash.xpProgressPct ?? 0);
      }
    };

    syncData(false);

    const onDataUpdated = () => syncData(true);
    window.addEventListener("userDataUpdated", onDataUpdated);

    // Close help box when clicking outside
    const handleClickOutside = (event) => {
      if (helpBoxRef.current && !helpBoxRef.current.contains(event.target)) {
        setShowHelpBox(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("userDataUpdated", onDataUpdated);
    };
  }, [location.pathname]); // Re-fetch level/XP on every page navigation

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { name: 'Home', icon: Home, path: '/studentDashboard' },
    { name: 'Study Schedule', icon: Calendar, path: '/schedule' },
    { name: 'Focus Sessions', icon: Zap, path: '/focus' },
    { name: 'All Notes', icon: FileText, path: '/notes' },
    { name: 'Video Lectures', icon: Video, path: '/lectures' },
    { name: 'Subject Folders', icon: Folder, path: '/folders' },
    { 
      name: 'Quiz', 
      icon: ClipboardCheck, 
      isParent: true,
      subItems: [
        { name: 'Attempt Quiz', path: '/quiz' },
        { name: 'Quiz Results', path: '/results' }
      ]
    },
    { name: 'Coverage Tracker', icon: Target, path: '/coverage' },
    { 
      name: 'Analytics', 
      icon: BarChart3, 
      isParent: true,
      subItems: [
        { name: 'Focus Analytics', path: '/focusSession' },
        { name: 'Distraction Logs', path: '/distractions' }
      ]
    },
    { name: 'Leaderboard', icon: BarChart3, path: '/leaderboard' },
    { name: 'Achievements', icon: Trophy, path: '/achievements' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className={`hidden lg:flex flex-col w-64 min-h-screen bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] font-inter sticky top-0 self-start overflow-hidden print:hidden transition-colors duration-300 ${className}`}>
      {/* Branding Header */}
      <div className="px-8 py-10">
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
          Cognitive Sanctuary
        </h1>
        <div className="flex flex-col gap-2 mt-1">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            Level {userLevel} {levelTitle}
          </p>
          <div className="flex items-center gap-2 w-3/4 mt-1">
            <div className="flex-1 xp-track">
              <div className="xp-fill" style={{width: `${xpProgressPct}%`}} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/leaderboard' && location.pathname === '/peers');
          
          // Special handling for parent menus (Analytics, Quiz dropdowns)
          if (item.isParent) {
            const hasActiveChild = item.subItems.some(sub => location.pathname === sub.path);
            const isOpen = item.name === 'Quiz' ? isQuizOpen : isAnalyticsOpen;
            const toggle = () => item.name === 'Quiz' ? setIsQuizOpen(!isQuizOpen) : setIsAnalyticsOpen(!isAnalyticsOpen);
            
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={toggle}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer
                    ${hasActiveChild 
                      ? 'bg-[var(--bg-pill-active)] text-[var(--primary-accent-text)]' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--primary-accent-text)]'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <item.icon 
                      size={20} 
                      className={hasActiveChild ? 'text-[var(--primary-accent-text)]' : 'text-[var(--text-muted)] group-hover:text-[var(--primary-accent-text)]'} 
                    />
                    <span className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                
                {isOpen && (
                  <div className="pl-12 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {item.subItems.map(sub => {
                      const isSubActive = location.pathname === sub.path;
                      return (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          className={`
                            block py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors
                            ${isSubActive ? 'text-[var(--primary-accent-text)]' : 'text-[var(--text-muted)] hover:text-[var(--primary-accent-text)]'}
                          `}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Special handling for Subject Folders with toggle icon
          if (item.name === 'Subject Folders') {
            return (
              <div key={item.name} className="relative flex items-center w-full group">
                <Link
                  to={item.path}
                  state={{ showTree: false }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-[var(--bg-pill-active)] text-[var(--primary-accent-text)]' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] group-hover:text-[var(--primary-accent-text)]'}
                  `}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <item.icon 
                      size={20} 
                      strokeWidth={isActive ? 2.5 : 2}
                      className={isActive ? 'text-[var(--primary-accent-text)]' : 'text-[var(--text-muted)] group-hover:text-[var(--primary-accent-text)]'} 
                    />
                    <span className="text-sm font-bold uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.name}
                    </span>
                  </div>
                  <div className="w-4 h-4 flex-shrink-0" />
                </Link>
                <Link
                  to={item.path}
                  state={{ showTree: true }}
                  className="absolute right-3 p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-center"
                  title="Show folder tree"
                >
                  <ChevronRight size={16} className={isActive ? 'text-[var(--primary-accent-text)]' : 'text-[var(--text-muted)] group-hover:text-[var(--primary-accent-text)]'} />
                </Link>
              </div>
            );
          }
          
          // Regular links for other items
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`
                w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-[var(--bg-pill-active)] text-[var(--primary-accent-text)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--primary-accent-text)]'}
              `}
            >
              <item.icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? 'text-[var(--primary-accent-text)]' : 'text-[var(--text-muted)] group-hover:text-[var(--primary-accent-text)]'} 
              />
              <span className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Profile Section */}
      <div className="mt-auto border-t border-[var(--border-subtle)]">
        <div className="px-4 py-6 flex flex-col gap-6">
          
          {/* Help Box Tooltip */}
          <div className="relative" ref={helpBoxRef}>
            <button 
              onClick={() => setShowHelpBox(!showHelpBox)}
              className={`flex items-center gap-4 px-4 text-[var(--text-secondary)] hover:text-[var(--primary-accent-text)] transition-colors group w-full cursor-pointer ${showHelpBox ? 'text-[var(--primary-accent-text)]' : ''}`}
            >
              <HelpCircle size={20} className={`${showHelpBox ? 'text-[var(--primary-accent-text)]' : 'text-[var(--text-muted)] group-hover:text-[var(--primary-accent-text)]'}`} />
              <span className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">Help</span>
            </button>
            
            {showHelpBox && (
              <div className="absolute bottom-full left-0 right-0 mb-3 w-full p-4 glass-card z-[100] animate-in fade-in zoom-in-95 duration-200 shadow-xl">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[var(--primary-accent-text)]">
                    <HelpCircle size={16} strokeWidth={3} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Support Portal</span>
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] font-medium leading-relaxed">
                    Experiencing issues or have a suggestion? Reach out to our support team:
                  </p>
                  <div className="mt-1 p-2.5 bg-[var(--bg-pill)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
                    <span className="block text-[11px] font-bold text-[var(--primary-accent-text)] select-all truncate">contact@hasanbutt.me</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase mt-1">Average response time: &lt; 24h</p>
                </div>
              </div>
            )}
          </div>

          {/* Profile & Logout Section */}
          <div className="flex items-center gap-4 px-4">
            <Avatar src={avatarUrl} name={userName} />
            
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-[var(--text-primary)] truncate">{userName || 'Scholar'}</span>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-wider whitespace-nowrap cursor-pointer"
              >
                <LogOut size={12} strokeWidth={3} />
                Logout
              </button>
            </div>
          </div>

        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
