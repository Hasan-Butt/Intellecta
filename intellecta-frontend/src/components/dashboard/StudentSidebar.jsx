import React, { useState, useEffect } from 'react';
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
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut,
  Trophy
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userLevel, setUserLevel] = useState(1);
  const [levelTitle, setLevelTitle] = useState('Beginner');
  const [userName, setUserName] = useState('');
  const [xpProgressPct, setXpProgressPct] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix');

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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');
    navigate('/login'); 
  };

  const menuItems = [
    { name: 'Home', icon: Home, path: '/studentDashboard' },
    { name: 'Study Schedule', icon: Calendar, path: '/schedule' },
    { name: 'Focus Sessions', icon: Zap, path: '/focus' },
    { name: 'All Notes', icon: FileText, path: '/notes' },
    { name: 'Subject Folders', icon: Folder, path: '/folders' },
    { name: 'Attempt Quiz', icon: ClipboardCheck, path: '/quiz' },
    { name: 'Distraction Log', icon: AlertCircle, path: '/distractions' },
    { name: 'Leaderboard', icon: BarChart3, path: '/leaderboard' },
    { name: 'Achievements', icon: Trophy, path: '/achievements' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 font-inter sticky top-0 self-start">
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
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
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
          
          {/* Help Link */}
          <Link 
            to="/help" 
            className="flex items-center gap-4 px-4 text-gray-500 hover:text-[#451ebb] transition-colors group"
          >
            <HelpCircle size={20} className="text-gray-400 group-hover:text-[#451ebb]" />
            <span className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">Help</span>
          </Link>

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