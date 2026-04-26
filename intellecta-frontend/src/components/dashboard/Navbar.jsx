import React, { useState } from 'react';
import { Search, Flame, Bell } from 'lucide-react';
import intellectaLogo from '../../assets/intellectaLogo.jpeg';

const Navbar = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <header className="w-full bg-[#F9FAFB] border-b border-gray-200 font-inter sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-8 h-20 flex items-center justify-between">
        
        {/* Left Section: Logo & Branding */}
        <div className="flex items-center gap-4 cursor-pointer group">
          <div className="relative w-14 h-14 flex items-center justify-center">
            {/* Standard img tag prevents the 'createElement' error */}
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
            <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mt-1">
              Focus. Learn. Achieve.
            </span>
          </div>
        </div>

        {/* Center Section: Search Bar */}
        <div className="flex-1 max-w-xl px-12">
          <div className={`relative transition-all duration-300 flex items-center h-12 px-5 rounded-full bg-[#EEF2FF] border border-transparent ${
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
        <div className="flex items-center gap-6">
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

          <div className="h-10 w-[1px] bg-gray-200 mx-1" />
          
          <button className="flex items-center gap-1 p-0.5 rounded-full ring-2 ring-transparent hover:ring-indigo-100 transition-all">
            <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-white shadow-sm overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                alt="User Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;