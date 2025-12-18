import React from 'react';
import { SKINS } from '../constants';

interface ShopProps {
  coins: number;
  unlockedSkins: string[];
  selectedSkin: string;
  onBuy: (skinId: string, cost: number) => void;
  onSelect: (skinId: string) => void;
  onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ 
  coins, unlockedSkins, selectedSkin, onBuy, onSelect, onClose 
}) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30 text-white">
      <div className="absolute top-8 right-8 flex items-center gap-3">
        <div className="w-2 h-2 bg-red-500 rotate-45"></div>
        <span className="text-2xl font-bold tracking-widest">{coins}</span>
      </div>

      <h2 className="text-5xl font-bold mb-12 uppercase tracking-[0.2em] text-white">
        Core Selection
      </h2>

      <div className="flex gap-8 mb-16 overflow-x-auto p-4 w-full justify-center">
        {SKINS.map((skin) => {
          const isUnlocked = unlockedSkins.includes(skin.id);
          const isSelected = selectedSkin === skin.id;
          const canAfford = coins >= skin.price;

          return (
            <div 
              key={skin.id}
              className={`
                relative w-64 h-80 bg-[#0a0a0a] border flex flex-col items-center justify-between p-6 transition-all duration-300 group
                ${isSelected ? 'border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'border-white/10 hover:border-white/50'}
                ${!isUnlocked && !canAfford ? 'opacity-50' : 'opacity-100'}
              `}
            >
              {/* Preview */}
              <div className="flex-1 flex items-center justify-center">
                <div 
                  className="w-24 h-24 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
                  style={{ 
                    backgroundColor: skin.color,
                    boxShadow: `0 0 20px ${skin.accentColor}`
                  }}
                />
              </div>
              
              <div className="w-full text-center">
                <h3 className="text-2xl font-bold uppercase mb-1">{skin.name}</h3>
                {!isUnlocked && <p className="text-slate-500 text-sm mb-4">REQ: {skin.price} ENERGY</p>}
                
                {isUnlocked ? (
                  <button
                    onClick={() => onSelect(skin.id)}
                    className={`
                      w-full py-3 text-lg font-bold uppercase tracking-widest border transition-colors
                      ${isSelected ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/20 hover:border-white'}
                    `}
                  >
                    {isSelected ? 'ACTIVE' : 'EQUIP'}
                  </button>
                ) : (
                  <button
                    onClick={() => onBuy(skin.id, skin.price)}
                    disabled={!canAfford}
                    className={`
                      w-full py-3 text-lg font-bold uppercase tracking-widest border
                      ${canAfford ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-black' : 'border-slate-800 text-slate-800 cursor-not-allowed'}
                    `}
                  >
                    UNLOCK
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button 
        onClick={onClose}
        className="text-slate-500 hover:text-white text-xl uppercase tracking-widest transition-colors"
      >
        Return to Void
      </button>
    </div>
  );
};

export default Shop;