import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  TrendingUp,
  LogOut,
  ChevronDown,
  ChevronRight,
  Award,
  Video
} from 'lucide-react';
import { logout } from '../../utils/auth';

const Sidebar = () => {
  const location = useLocation();
  const [isContentOpen, setIsContentOpen] = useState(location.pathname === '/content' || location.pathname === '/create-quiz' || location.pathname === '/quiz-submissions');

  const handleLogout = () => {
    logout();
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
        { name: 'Create Quiz', path: '/create-quiz' },
        { name: 'Quiz Submissions', path: '/quiz-submissions' }
      ]
    },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    { name: 'Trends', icon: TrendingUp, path: '/trends' },
    { name: 'Lectures', icon: Video, path: '/admin-lectures' },
    { name: 'Rewards', icon: Award, path: '/rewards' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] font-inter sticky top-0 self-start overflow-hidden print:hidden transition-colors duration-300">
      <div className="px-8 py-10">
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">
          System Administrator
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.subItems && item.subItems.some(sub => location.pathname === sub.path));
          
          if (item.hasSubmenu) {
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => setIsContentOpen(!isContentOpen)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer
                    ${isActive 
                      ? 'bg-[var(--bg-pill-active)] text-[var(--primary-accent-text)]' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <item.icon 
                      size={20} 
                      strokeWidth={isActive ? 2.5 : 2}
                      className={isActive ? 'text-[var(--primary-accent-text)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'} 
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
                            ${isSubActive ? 'text-[var(--primary-accent-text)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}
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
                  ? 'bg-[var(--bg-pill-active)] text-[var(--primary-accent-text)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'}
              `}
            >
              <item.icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? 'text-[var(--primary-accent-text)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'} 
              />
              <span className="text-sm font-bold uppercase tracking-wide">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-8 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-[var(--bg-subtle)] overflow-hidden border border-[var(--border-subtle)]">
             <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="Admin Avatar"
              className="object-cover"
            />
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[var(--text-primary)]">Admin User</span>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-wider cursor-pointer"
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
