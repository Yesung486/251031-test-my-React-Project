import React from 'react';
import { RefreshCcw, Play, AlertCircle, CheckCircle2, ChevronRight, Box } from 'lucide-react';
import { GameStatus, LevelData } from '../types';
import { playSound } from '../utils/audio';

interface UIOverlayProps {
  status: GameStatus;
  levelConfig: LevelData;
  inkCurrent: number;
  inkMax: number;
  onStart: () => void;
  onReset: () => void;
  onNextLevel: () => void;
  isLastLevel: boolean;
}

const UIOverlay: React.FC<UIOverlayProps> = ({
  status,
  levelConfig,
  inkCurrent,
  inkMax,
  onStart,
  onReset,
  onNextLevel,
  isLastLevel
}) => {
  const inkPercentage = Math.max(0, 100 - (inkCurrent / inkMax) * 100);
  const isInkLow = inkPercentage < 20;

  const handleStart = () => {
    playSound('click');
    onStart();
  };

  const handleReset = () => {
    playSound('click');
    onReset();
  };

  const handleNext = () => {
    playSound('click');
    onNextLevel();
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
      
      {/* Header Bar */}
      <div className="flex justify-between items-start pointer-events-auto w-full max-w-4xl mx-auto">
        {/* Level Info */}
        <div className="bg-slate-800/90 backdrop-blur rounded-2xl p-4 border border-slate-700 shadow-xl min-w-[200px]">
           <div className="flex items-center gap-2 mb-1">
             <span className="bg-amber-500 text-slate-900 text-xs font-black px-2 py-0.5 rounded">LVL {levelConfig.level}</span>
             <h2 className="text-white font-bold text-sm leading-tight">{levelConfig.title}</h2>
           </div>
           <p className="text-slate-400 text-xs">{levelConfig.description}</p>
           {levelConfig.hasCargo && (
               <div className="mt-2 flex items-center gap-1 text-red-400 text-xs font-bold">
                   <Box size={12} /> CARGO MISSION
               </div>
           )}
        </div>

        {/* Ink Meter */}
        <div className="bg-slate-800/90 backdrop-blur rounded-2xl p-4 border border-slate-700 shadow-xl min-w-[180px]">
            <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
              <span>INK</span>
              <span>{Math.round(inkPercentage)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
              <div 
                className={`h-full transition-all duration-300 ${isInkLow ? 'bg-red-500' : 'bg-emerald-400'}`}
                style={{ width: `${inkPercentage}%` }}
              />
            </div>
        </div>
      </div>

      {/* Center Messages */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {status === GameStatus.WON && (
          <div className="bg-emerald-500 text-white p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-bounce z-50">
            <CheckCircle2 size={64} className="mb-4" />
            <h2 className="text-4xl font-black uppercase tracking-wider">Cleared!</h2>
            <p className="font-medium mt-2 text-emerald-100">Excellent Design</p>
          </div>
        )}
        {status === GameStatus.LOST && (
            <div className="bg-rose-600 text-white p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-pulse z-50">
              <AlertCircle size={64} className="mb-4" />
              <h2 className="text-4xl font-black uppercase tracking-wider">Crashed!</h2>
              <p className="font-medium mt-2 text-rose-100">Structure Failed</p>
            </div>
          )}
      </div>


      {/* Footer Controls */}
      <div className="flex justify-center gap-4 pointer-events-auto mb-6">
         {status === GameStatus.PLANNING && (
             <>
                <button 
                    onClick={handleReset}
                    className="flex items-center justify-center w-16 h-16 bg-slate-700 hover:bg-slate-600 transition-all text-white rounded-full shadow-lg border-2 border-slate-600 group"
                    aria-label="Clear Canvas"
                >
                    <RefreshCcw size={24} className="group-active:-rotate-180 transition-transform duration-500"/>
                </button>
                <button 
                    onClick={handleStart}
                    className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all text-slate-900 px-10 py-4 rounded-full font-black text-2xl shadow-xl border-b-4 border-amber-700"
                >
                    <Play fill="currentColor" size={28} /> DRIVE
                </button>
             </>
         )}

         {status === GameStatus.RUNNING && (
             <button 
                onClick={handleReset}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl border-b-4 border-slate-900"
            >
                <RefreshCcw /> STOP & RETRY
            </button>
         )}

         {(status === GameStatus.WON || status === GameStatus.LOST) && (
            <div className="flex gap-4">
                <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl border-b-4 border-slate-900"
                >
                    <RefreshCcw /> RETRY LEVEL
                </button>
                {status === GameStatus.WON && !isLastLevel && (
                    <button 
                        onClick={handleNext}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl border-b-4 border-emerald-700"
                    >
                        NEXT LEVEL <ChevronRight />
                    </button>
                )}
            </div>
         )}
      </div>

    </div>
  );
};

export default UIOverlay;