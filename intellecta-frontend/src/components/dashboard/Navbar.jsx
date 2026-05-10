import React, { useState, useEffect, useRef } from 'react';
import { Search, Flame, Bell, User, Mail, BookOpen, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import intellectaLogo from '../../assets/intellectaLogo.jpeg';
import api from '../../services/api';
import Avatar from '../common/Avatar';

const Navbar = () => {
  const navigate = useNavigate();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userData, setUserData] = useState({
    username: 'Hasan Butt',
    email: 'hasan@intellecta.com',
    bio: 'Focus. Learn. Achieve.',
    avatarUrl: ''
  });
  
  const menuRef = useRef(null);

  useEffect(() => {
    fetchUserData();
    
    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUserData = async () => {
    const userId = localStorage.getItem('userId') || '2';
    try {
      const res = await api.get(`/users/${userId}/profile`);
      setUserData({
        username: res.data.username || 'Hasan Butt',
        email: res.data.email || 'hasan@intellecta.com',
        bio: res.data.bio || 'Focus. Learn. Achieve.',
        avatarUrl: res.data.avatarUrl || ''
      });
    } catch (err) {
      console.error("Failed to fetch navbar user data", err);
    }
  };

  return (
    <header className="w-full bg-[#F9FAFB] border-b border-gray-200 font-inter sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-4 h-14 flex items-center ">
        
        {/* Left Section: Logo & Branding */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/dashboard')}>
          <div className="relative w-14 h-16 flex items-center justify-center">
            <img 
              src={intellectaLogo} 
              alt="Intellecta Logo" 
              className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-black text-[#111827] tracking-tighter">
              Intellecta
            </span>
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mt-1">
              Focus. Learn. Achieve.
            </span>
          </div>
        </div>

        {/* Center Section: Search Bar */}
        <div className="flex-1 max-w-lg px-8">
          <div className={`relative transition-all duration-300 flex items-center h-11 px-5 rounded-full bg-[#EEF2FF] border border-transparent ${
            isSearchFocused ? 'ring-4 ring-indigo-50 bg-white border-indigo-200' : ''
          }`}>
            <Search 
              size={18} 
              className={`mr-3 transition-colors ${isSearchFocused ? 'text-[#6366F1]' : 'text-[#9CA3AF]'}`} 
            />
            <input
              type="text"
              placeholder="Search insights..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full bg-transparent text-base text-[#111827] placeholder-[#9CA3AF] outline-none font-medium"
            />
          </div>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2 ml-auto">
          <button className="p-2.5 rounded-full hover:bg-indigo-50 transition-all text-[#6366F1] relative group border border-transparent hover:border-indigo-100">
            <Flame size={24} className="group-hover:fill-current transition-all" />
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
            </span>
          </button>

          <button className="p-2.5 rounded-full hover:bg-gray-100 transition-all text-[#6B7280] border border-transparent hover:border-gray-200">
            <Bell size={24} />
          </button>

          <div className="h-12 w-[1px] bg-gray-200 mx-1" />
          
          {/* Profile Section with Popover */}
          <div className="relative" ref={menuRef}>
            <button 
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
    </header>
  );
};

export default Navbar;