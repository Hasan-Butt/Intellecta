import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Avatar from '../common/Avatar';
import { 
  Home, 
  Calendar, 
  Zap, 
  FileText, 
  Folder, 
  ClipboardCheck, 
  AlertCircle, 
  ChevronRight,
  ChevronDown,
  BarChart3, 
  Activity,
  Settings, 
  HelpCircle, 
  LogOut,
  Trophy,
  Target
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const helpBoxRef = useRef(null);
  const [userLevel, setUserLevel] = useState(1);
  const [levelTitle, setLevelTitle] = useState('Beginner');
  const [userName, setUserName] = useState('');
  const [xpProgressPct, setXpProgressPct] = useState(0);
  
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(
    location.pathname === '/distractions' || location.pathname === '/focusSession'
  );
  const [avatarUrl, setAvatarUrl] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix');
  const [showHelpBox, setShowHelpBox] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId') || '2';
    api.get(`/users/${userId}/profile`)
      .then(res => {
        setUserName(res.data.username ?? 'Scholar');
        setAvatarUrl(res.data.avatarUrl || '');
      })
      .catch(() => {});
    
    api.get(`/dashboard/user/${userId}`)
      .then(res => {
        setUserLevel(res.data.level ?? 1);
        setLevelTitle(res.data.levelTitle ?? 'Beginner');
        setXpProgressPct(res.data.xpProgressPct ?? 0);
      })
      .catch(() => {});

    // Close help box when clicking outside
    const handleClickOutside = (event) => {
      if (helpBoxRef.current && !helpBoxRef.current.contains(event.target)) {
        setShowHelpBox(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    navigate('/login'); 
  };

  const menuItems = [
    { name: 'Home', icon: Home, path: '/studentDashboard' },
    { name: 'Study Schedule', icon: Calendar, path: '/schedule' },
    { name: 'Focus Sessions', icon: Zap, path: '/focus' },
    { name: 'All Notes', icon: FileText, path: '/notes' },
    { name: 'Subject Folders', icon: Folder, path: '/folders' },
    { name: 'Attempt Quiz', icon: ClipboardCheck, path: '/quiz' },
    { name: 'Coverage Tracker', icon: Target, path: '/coverage' },
    { 
      name: 'Analytics', 
      icon: Activity, 
      isParent: true,
      subItems: [
        { name: 'Distraction Logs', path: '/distractions' },
        { name: 'Focus Analytics', path: '/focusSession' }
      ]
    },
    { name: 'Leaderboard', icon: BarChart3, path: '/leaderboard' },
    { name: 'Achievements', icon: Trophy, path: '/achievements' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 font-inter sticky top-0 self-start overflow-hidden">
      {/* Branding Header */}
      <div className="px-8 py-10">
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
          Cognitive Sanctuary
        </h1>
        <div className="flex flex-col gap-2 mt-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Level {userLevel} {levelTitle}
          </p>
          <div className="flex items-center gap-2 w-3/4">
            <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-[#451ebb] transition-all" style={{width: `${xpProgressPct}%`}} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          // Special handling for Analytics (Dropdown)
          if (item.isParent) {
            const hasActiveChild = item.subItems.some(sub => location.pathname === sub.path);
            
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                    ${hasActiveChild ? 'bg-[#F5F6FF] text-[#451ebb]' : 'text-gray-500 hover:bg-gray-50'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <item.icon 
                      size={20} 
                      className={hasActiveChild ? 'text-[#451ebb]' : 'text-gray-400 group-hover:text-[#451ebb]'} 
                    />
                    <span className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                  {isAnalyticsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                
                {isAnalyticsOpen && (
                  <div className="pl-12 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {item.subItems.map(sub => {
                      const isSubActive = location.pathname === sub.path;
                      return (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          className={`
                            block py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors
                            ${isSubActive ? 'text-[#451ebb]' : 'text-gray-500/60 hover:text-[#451ebb]'}
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
              <div key={item.name} className="flex items-center w-full">
                <Link
                  to={item.path}
                  state={{ showTree: false }}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group flex-1
                    ${isActive 
                      ? 'bg-[#F5F6FF] text-[#451ebb]' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-[#451ebb]'}
                  `}
                >
                  <item.icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-[#451ebb]' : 'text-gray-400 group-hover:text-[#451ebb]'} 
                  />
                  <span className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">
                    {item.name}
                  </span>
                </Link>
                <Link
                  to={item.path}
                  state={{ showTree: true }}
                  className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
                  title="Show folder tree"
                >
                  <ChevronRight size={16} className="text-gray-400" />
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
                  ? 'bg-[#F5F6FF] text-[#451ebb]' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#451ebb]'}
              `}
            >
              <item.icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? 'text-[#451ebb]' : 'text-gray-400 group-hover:text-[#451ebb]'} 
              />
              <span className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Profile Section */}
      <div className="mt-auto border-t border-gray-50">
        <div className="px-4 py-6 flex flex-col gap-6">
          
          {/* Help Box Tooltip */}
          <div className="relative px-4" ref={helpBoxRef}>
            <button 
              onClick={() => setShowHelpBox(!showHelpBox)}
              className={`flex items-center gap-4 text-gray-500 hover:text-[#451ebb] transition-colors group w-full ${showHelpBox ? 'text-[#451ebb]' : ''}`}
            >
              <HelpCircle size={20} className={`${showHelpBox ? 'text-[#451ebb]' : 'text-gray-400 group-hover:text-[#451ebb]'}`} />
              <span className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">Help</span>
            </button>
            
            {showHelpBox && (
              <div className="absolute bottom-full left-0 mb-3 w-64 p-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-indigo-50 z-[100] animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#451ebb]">
                    <HelpCircle size={16} strokeWidth={3} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Support Portal</span>
                  </div>
                  <p className="text-[12px] text-gray-600 font-medium leading-relaxed">
                    Experiencing issues or have a suggestion? Reach out to our support team:
                  </p>
                  <div className="mt-1 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                    <span className="block text-[11px] font-bold text-[#451ebb] select-all">contact@intellecta.com</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Average response time: &lt; 24h</p>
                </div>
                {/* Pointer Arrow */}
                <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-white border-r border-b border-indigo-50 rotate-45" />
              </div>
            )}
          </div>

          {/* Profile & Logout Section */}
          <div className="flex items-center gap-4 px-4">
            <Avatar src={avatarUrl} name={userName} />
            
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-zinc-900 truncate">{userName || 'Scholar'}</span>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider whitespace-nowrap"
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