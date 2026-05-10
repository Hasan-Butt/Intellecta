import React from 'react';
import api from '../../services/api';

const Avatar = ({ src, name, size = "w-10 h-10", className = "" }) => {
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${api.defaults.baseURL.replace('/api', '')}${url}`;
  };

  const initials = getInitials(name);
  const avatarSrc = getAvatarSrc(src);

  // Consistent color mapping based on name
  const colors = [
    { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    { bg: 'bg-blue-100', text: 'text-blue-700' },
    { bg: 'bg-purple-100', text: 'text-purple-700' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { bg: 'bg-amber-100', text: 'text-amber-700' },
  ];
  
  const colorIndex = name ? name.length % colors.length : 0;
  const color = colors[colorIndex];

  return (
    <div className={`${size} rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-sm border-2 border-white ${avatarSrc ? 'bg-zinc-800' : color.bg} ${className}`}>
      {avatarSrc ? (
        <img 
          src={avatarSrc} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <span 
        className={`font-bold text-sm ${color.text}`}
        style={{ display: avatarSrc ? 'none' : 'block' }}
      >
        {initials}
      </span>
    </div>
  );
};

export default Avatar;
