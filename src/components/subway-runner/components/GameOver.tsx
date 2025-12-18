import React from 'react';

interface GameOverProps {
  score: number;
  coinsEarned: number;
  totalCoins: number;
  onRestart: () => void;
  onGoToShop: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, coinsEarned, totalCoins, onRestart, onGoToShop }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-40 backdrop-blur-xl">
      <div className="text-center">
        <h2 className="text-7xl font-bold text-red-600 mb-2 tracking-[0.2em] uppercase" style={{ textShadow: '0 0 20px rgba(220, 38, 38, 0.5)' }}>
          SYNC LOST
        </h2>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-red-900 to-transparent mb-12"></div>
        
        <div className="flex gap-12 mb-16">
          <div className="text-center">
            <p className="text-slate-500 text-sm uppercase tracking-widest mb-2">Distance Traveled</p>
            <p className="text-6xl text-white font-bold">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-slate-500 text-sm uppercase tracking-widest mb-2">Energy Collected</p>
            <p className="text-6xl text-white font-bold">+{coinsEarned}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-80 mx-auto">
          <button 
            onClick={onRestart}
            className="bg-white text-black font-bold py-4 text-xl uppercase tracking-widest hover:bg-slate-200 transition-colors"
          >
            Re-Initialize
          </button>
          <button 
            onClick={onGoToShop}
            className="border border-white/20 text-slate-400 font-bold py-3 text-lg uppercase tracking-widest hover:text-white hover:border-white transition-all"
          >
            Access Shop
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;