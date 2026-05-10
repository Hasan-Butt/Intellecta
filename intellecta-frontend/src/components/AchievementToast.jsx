import React, { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';

const AchievementToast = ({ badges, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);

  useEffect(() => {
    if (badges && badges.length > 0) {
      setVisible(true);
      const timer = setTimeout(() => {
        if (currentBadgeIndex < badges.length - 1) {
          setCurrentBadgeIndex(prev => prev + 1);
        } else {
          handleClose();
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [badges, currentBadgeIndex]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 500); // Wait for exit animation
  };

  if (!badges || badges.length === 0) return null;

  const currentBadge = badges[currentBadgeIndex];

  return (
    <div 
      className={`fixed top-6 right-6 z-[100] transition-all duration-500 ease-out transform ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#e6deff] p-5 w-80 overflow-hidden relative">
        {/* Progress bar for multi-badge toasts */}
        {badges.length > 1 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#f5f6ff]">
            <div 
              className="h-full bg-[#451ebb] transition-all duration-[5000ms] ease-linear"
              style={{ width: visible ? '100%' : '0%' }}
              key={currentBadgeIndex}
            />
          </div>
        )}

        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#451ebb] to-[#6c5dd3] flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
            {currentBadge.imageUrl ? (
              <img 
                src={currentBadge.imageUrl} 
                alt={currentBadge.displayName}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <Trophy className="text-white" size={32} />
            )}
          </div>
          
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-[10px] font-black text-[#451ebb] uppercase tracking-[0.2em] mb-1">
              Achievement Unlocked
            </p>
            <h4 className="text-lg font-bold text-zinc-900 leading-tight mb-1 truncate">
              {currentBadge.displayName}
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
              {currentBadge.description}
            </p>
          </div>
        </div>

        {badges.length > 1 && (
          <p className="text-[10px] text-gray-400 mt-3 text-center font-medium italic">
            Showing {currentBadgeIndex + 1} of {badges.length} achievements
          </p>
        )}
      </div>
      
      {/* Visual flare / confetti-like dots (simple CSS animation) */}
      <div className="absolute -inset-2 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full animate-ping opacity-60"
            style={{
              backgroundColor: i % 2 === 0 ? '#451ebb' : '#3fff8b',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AchievementToast;
