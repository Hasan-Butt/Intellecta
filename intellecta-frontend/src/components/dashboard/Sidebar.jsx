import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  TrendingUp,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isContentOpen, setIsContentOpen] = useState(location.pathname === '/content' || location.pathname === '/create-quiz');

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');
    navigate('/login'); 
  };

  const menuItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Users', icon: Users, path: '/users' },
    { 
      name: 'Content', 
      icon: BookOpen, 
      path: '/content',
      hasSubmenu: true,
      subItems: [
        { name: 'Repository', path: '/content' },
        { name: 'Create Quiz', path: '/create-quiz' }
      ]
    },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    { name: 'Trends', icon: TrendingUp, path: '/trends' },
    { name: 'Configuration', icon: Settings, path: '/configuration' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-gray-100 font-inter sticky top-0 self-start overflow-hidden">
      <div className="px-8 py-10">
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
          System Administrator
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.subItems && item.subItems.some(sub => location.pathname === sub.path));
          
          if (item.hasSubmenu) {
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => setIsContentOpen(!isContentOpen)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive ? 'bg-[#F5F6FF] text-[#6C5DD3]' : 'text-gray-500 hover:bg-gray-50 hover:text-zinc-900'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <item.icon 
                      size={20} 
                      strokeWidth={isActive ? 2.5 : 2}
                      className={isActive ? 'text-[#6C5DD3]' : 'text-gray-400 group-hover:text-zinc-900'} 
                    />
                    <span className="text-sm font-bold uppercase tracking-wide">
                      {item.name}
                    </span>
                  </div>
                  {isContentOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                
                {isContentOpen && (
                  <div className="ml-12 space-y-1">
                    {item.subItems.map((subItem) => {
                      const isSubActive = location.pathname === subItem.path;
                      return (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className={`
                            block px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all
                            ${isSubActive ? 'text-[#6C5DD3]' : 'text-gray-400 hover:text-zinc-900 hover:bg-gray-50'}
                          `}
                        >
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`
                w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-[#F5F6FF] text-[#6C5DD3]' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-zinc-900'}
              `}
            >
              <item.icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? 'text-[#6C5DD3]' : 'text-gray-400 group-hover:text-zinc-900'} 
              />
              <span className="text-sm font-bold uppercase tracking-wide">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-8 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
             <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="Admin Avatar"
              className="object-cover"
            />
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-900">Admin User</span>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
            >
              <LogOut size={12} strokeWidth={3} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;