import React from 'react';

interface HUDProps {
  score: number;
  coins: number;
}

const HUD: React.FC<HUDProps> = ({ score, coins }) => {
  return (
    <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start pointer-events-none z-10 text-white select-none">
      {/* Score */}
      <div className="flex flex-col">
        <span className="text-slate-500 text-sm font-light uppercase tracking-[0.3em] mb-1">Distance</span>
        <span className="text-5xl font-bold tracking-widest" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
          {score.toString().padStart(5, '0')}
        </span>
      </div>
      
      {/* Coins */}
      <div className="flex flex-col items-end">
        <span className="text-slate-500 text-sm font-light uppercase tracking-[0.3em] mb-1">Energy</span>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rotate-45 animate-pulse"></div>
          <span className="text-4xl font-bold tracking-widest">
            {coins}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HUD;