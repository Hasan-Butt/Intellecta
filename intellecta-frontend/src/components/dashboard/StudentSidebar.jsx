import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Zap, 
  FileText, 
  Folder, 
  ClipboardCheck, 
  AlertCircle, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 font-inter sticky top-0 self-start">
      {/* Branding Header */}
      <div className="px-8 py-10">
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
          Cognitive Sanctuary
        </h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
          Level 12 Scholar
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
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
              <span className="text-sm font-bold uppercase tracking-wide">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Profile Section */}
      <div className="mt-auto border-t border-gray-50">
        <div className="px-4 py-6 flex flex-col gap-6">
          
          {/* Help Link - Now perfectly aligned with padding and gap */}
          <Link 
            to="/help" 
            className="flex items-center gap-4 px-4 text-gray-500 hover:text-[#451ebb] transition-colors group"
          >
            <HelpCircle size={20} className="text-gray-400 group-hover:text-[#451ebb]" />
            <span className="text-sm font-bold uppercase tracking-wide">Help</span>
          </Link>

          {/* Profile & Logout Section */}
          <div className="flex items-center gap-4 px-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                alt="Avatar"
                className="object-cover"
              />
            </div>
            
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-zinc-900 truncate">Muhammad Hasan</span>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
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