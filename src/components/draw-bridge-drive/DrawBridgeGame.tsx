import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { GameStatus } from './types';
import { LEVELS } from './constants';

const App: React.FC = () => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [status, setStatus] = useState<GameStatus>(GameStatus.PLANNING);
  const [gameKey, setGameKey] = useState(0); 
  
  const [inkState, setInkState] = useState({ current: 0, max: 100 });

  const currentLevelConfig = LEVELS[currentLevelIndex];

  const handleInkUpdate = (current: number, max: number) => {
    setInkState({ current, max });
  };

  const resetGame = () => {
    setStatus(GameStatus.PLANNING);
    setGameKey(prev => prev + 1);
    setInkState(prev => ({ ...prev, current: 0 }));
  };

  const nextLevel = () => {
    if (currentLevelIndex < LEVELS.length - 1) {
        setCurrentLevelIndex(prev => prev + 1);
        resetGame();
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden select-none">
      
      <GameCanvas 
        levelConfig={currentLevelConfig}
        status={status}
        setStatus={setStatus}
        onInkUpdate={handleInkUpdate}
        gameKey={gameKey}
      />

      <UIOverlay 
        status={status}
        levelConfig={currentLevelConfig}
        inkCurrent={inkState.current}
        inkMax={inkState.max}
        onStart={() => setStatus(GameStatus.RUNNING)}
        onReset={resetGame}
        onNextLevel={nextLevel}
        isLastLevel={currentLevelIndex === LEVELS.length - 1}
      />
    </div>
  );
};

export default App;