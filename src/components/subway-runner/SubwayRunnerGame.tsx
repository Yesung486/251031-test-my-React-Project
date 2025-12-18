import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import MainMenu from './components/MainMenu';
import HUD from './components/HUD';
import Shop from './components/Shop';
import GameOver from './components/GameOver';
import { GameState, SavedData } from './types';
import { loadGameData, saveGameData } from './services/storageService';

const SubwayRunnerGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [data, setData] = useState<SavedData>(loadGameData());
  
  // Session stats
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionCoins, setSessionCoins] = useState(0);

  // Load data on mount
  useEffect(() => {
    setData(loadGameData());
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    saveGameData(data);
  }, [data]);

  const handleStartGame = () => {
    setSessionScore(0);
    setSessionCoins(0);
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = (finalScore: number) => {
    setSessionScore(finalScore);
    
    setData(prev => ({
      ...prev,
      coins: prev.coins + sessionCoins,
      highScore: Math.max(prev.highScore, finalScore)
    }));
    
    setGameState(GameState.GAME_OVER);
  };

  const handleCoinCollected = () => {
    setSessionCoins(prev => prev + 10);
    setData(prev => ({ ...prev, coins: prev.coins + 10 }));
  };

  const handleBuySkin = (skinId: string, cost: number) => {
    if (data.coins >= cost) {
      setData(prev => ({
        ...prev,
        coins: prev.coins - cost,
        unlockedSkins: [...prev.unlockedSkins, skinId],
        selectedSkin: skinId 
      }));
    }
  };

  const handleSelectSkin = (skinId: string) => {
    if (data.unlockedSkins.includes(skinId)) {
      setData(prev => ({ ...prev, selectedSkin: skinId }));
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-sans overflow-hidden p-0 sm:p-4 select-none">
      <div className="relative w-full max-w-[900px] aspect-video border border-slate-800 bg-black overflow-hidden shadow-2xl">
        
        <GameCanvas 
          gameState={gameState} 
          selectedSkin={data.selectedSkin}
          onGameOver={handleGameOver}
          onCoinCollected={handleCoinCollected}
          setDistance={setSessionScore}
        />

        {/* UI Overlays */}
        {gameState === GameState.MENU && (
          <MainMenu 
            setGameState={(state) => {
              if(state === GameState.PLAYING) handleStartGame();
              else setGameState(state);
            }} 
            highScore={data.highScore}
          />
        )}

        {gameState === GameState.PLAYING && (
          <HUD score={sessionScore} coins={data.coins} />
        )}

        {gameState === GameState.SHOP && (
          <Shop 
            coins={data.coins}
            unlockedSkins={data.unlockedSkins}
            selectedSkin={data.selectedSkin}
            onBuy={handleBuySkin}
            onSelect={handleSelectSkin}
            onClose={() => setGameState(GameState.MENU)}
          />
        )}

        {gameState === GameState.GAME_OVER && (
          <GameOver 
            score={sessionScore}
            coinsEarned={sessionCoins}
            totalCoins={data.coins}
            onRestart={handleStartGame}
            onGoToShop={() => setGameState(GameState.SHOP)}
          />
        )}
      </div>
    </div>
  );
};

export default SubwayRunnerGame;