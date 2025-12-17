
import React from 'react';
import { Rarity } from '../types';
import { ITEM_VARIANTS, RARITY_STYLES } from '../data/ItemData';
import { Sparkles, Crown } from 'lucide-react';

interface ItemIconProps {
  name: string;
  rarity: Rarity;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  showName?: boolean;
  count?: number;
}

const ItemIcon: React.FC<ItemIconProps> = ({ 
  name, 
  rarity, 
  size = 'md', 
  className = '', 
  onClick,
  showName = false,
  count
}) => {
  const variant = ITEM_VARIANTS[name] || ITEM_VARIANTS['Kunai']; // Fallback
  const style = RARITY_STYLES[rarity];
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14 sm:w-16 sm:h-16',
    lg: 'w-20 h-20'
  };

  const isHighTier = ['LEGEND', 'ETERNAL', 'TRANSCENDENT', 'GOLDEN', 'FOREVER'].includes(rarity);
  const isGodTier = ['GOLDEN', 'FOREVER'].includes(rarity);

  return (
    <div 
      onClick={onClick}
      className={`relative rounded-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer overflow-hidden group ${sizeClasses[size]} ${className}`}
      style={{
        background: style.bgGradient,
        border: style.border,
        boxShadow: style.boxShadow,
      }}
    >
      {/* Background Animations */}
      {rarity === 'GOLDEN' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 animate-[shine_2s_infinite]" />
      )}
      
      {/* Icon SVG */}
      <svg 
        viewBox={variant.viewBox} 
        className={`w-[70%] h-[70%] z-10 drop-shadow-md transition-all duration-300 group-hover:scale-110 ${style.animation ? `animate-${style.animation}` : ''}`}
        style={{ filter: isHighTier ? 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' : 'none' }}
      >
        <path d={variant.path} fill={variant.color} stroke={isHighTier ? '#FFF' : '#000'} strokeWidth={isHighTier ? 0.5 : 1} />
        <path d={variant.path} fill="none" stroke={variant.accent} strokeWidth={2} opacity={0.6} />
      </svg>

      {/* Rarity Effects */}
      {isHighTier && <Sparkles className="absolute top-1 right-1 w-3 h-3 text-white animate-spin-slow opacity-80" />}
      {isGodTier && <Crown className="absolute bottom-1 w-4 h-4 text-white fill-current animate-bounce" />}
      
      {/* Stack Count */}
      {count && count > 1 && (
        <div className="absolute top-0 right-0 bg-black/60 text-white text-[10px] font-bold px-1.5 rounded-bl-lg backdrop-blur-sm border-l border-b border-white/20">
          x{count}
        </div>
      )}

      {/* Rarity Badge (Small Color Dot) */}
      <div 
        className="absolute top-1 left-1 w-2 h-2 rounded-full shadow-sm"
        style={{ backgroundColor: style.color }}
      />

      {/* Name Overlay */}
      {showName && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-[2px] text-center py-0.5">
          <span className="text-[9px] text-white font-bold tracking-tight px-1 block truncate" style={{color: style.color}}>
            {name}
          </span>
        </div>
      )}
      
      {/* CSS Styles for Animations */}
      <style>{`
        @keyframes shine {
          0% { transform: translateX(-150%) skewX(-12deg); }
          50%, 100% { transform: translateX(150%) skewX(-12deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes breathing {
          0% { box-shadow: 0 0 10px ${style.color}; }
          100% { box-shadow: 0 0 25px ${style.color}; }
        }
        @keyframes rotate-bg {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes electric {
          0% { opacity: 0.8; }
          100% { opacity: 1; filter: brightness(1.5); }
        }
      `}</style>
    </div>
  );
};

export default ItemIcon;
