import React from 'react';
import { GameState } from '../types';

interface MainMenuProps {
  setGameState: (state: GameState) => void;
  highScore: number;
}

const MainMenu: React.FC<MainMenuProps> = ({ setGameState, highScore }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20">
      <div className="mb-16 text-center tracking-widest">
        <h1 className="text-8xl font-bold text-white mb-2 uppercase" style={{ textShadow: '0 0 30px rgba(255,255,255,0.2)' }}>
          VOID WALKER
        </h1>
        <div className="h-1 w-32 bg-red-600 mx-auto"></div>
        <p className="text-slate-500 mt-4 text-xl uppercase font-light">Survive the Abyss</p>
      </div>
      
      <div className="flex flex-col gap-6 w-80">
        <button 
          onClick={() => setGameState(GameState.PLAYING)}
          className="group relative bg-transparent border border-white/20 hover:border-white text-white py-4 px-8 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 w-0 bg-white transition-all duration-[250ms] ease-out group-hover:w-full opacity-10"></div>
          <span className="relative text-3xl font-bold uppercase tracking-widest">Initiate Run</span>
        </button>
        
        <button 
          onClick={() => setGameState(GameState.SHOP)}
          className="group relative bg-transparent border border-white/20 hover:border-white text-slate-300 hover:text-white py-3 px-8 transition-all duration-300"
        >
          <span className="text-2xl font-light uppercase tracking-widest">Customize Core</span>
        </button>
      </div>

      <div className="absolute bottom-10 right-10 flex flex-col items-end">
        <span className="text-slate-600 uppercase text-sm tracking-widest">Personal Best</span>
        <span className="text-4xl text-white font-bold">{highScore.toString().padStart(6, '0')}</span>
      </div>
    </div>
  );
};

export default MainMenu;