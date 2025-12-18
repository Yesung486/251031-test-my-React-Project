import React, { useState, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';

enum GameState {
  START,
  PLAYING,
  GAME_OVER
}

const SliceGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    setGameState(GameState.GAME_OVER);
  }, []);

  const handleScoreUpdate = useCallback((newScore: number, newLives: number) => {
    setScore(newScore);
    setLives(newLives);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#222] select-none font-sans text-white">
      {/* Game Canvas */}
      <GameCanvas 
        gameActive={gameState === GameState.PLAYING} 
        onGameOver={handleGameOver}
        onScoreUpdate={handleScoreUpdate}
        onRestart={startGame}
      />

      {/* HUD (Heads-Up Display) */}
      {gameState === GameState.PLAYING && (
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-10">
          <div className="flex flex-col">
            <span className="text-4xl font-bold text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
              {score}
            </span>
            <span className="text-xs text-gray-400 uppercase tracking-widest">Score</span>
          </div>
          <div className="flex gap-1 text-3xl filter drop-shadow-[0_0_5px_rgba(255,0,0,0.5)]">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={i < lives ? "opacity-100" : "opacity-20 grayscale"}>
                ❤️
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Start Screen */}
      {gameState === GameState.START && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] mb-8 text-center">
            NEON<br/>BLADE
          </h1>
          <p className="mb-8 text-gray-300 text-lg">Slice fruits. Avoid bombs. Don't drop them!</p>
          <button 
            onClick={startGame}
            className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-2xl rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all transform hover:scale-110 active:scale-95"
          >
            GAME START
          </button>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
          <h2 className="text-6xl font-black text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] mb-4">
            GAME OVER
          </h2>
          <div className="flex flex-col items-center mb-8">
            <span className="text-xl text-gray-400">FINAL SCORE</span>
            <span className="text-7xl font-bold text-white">{score}</span>
          </div>
          <button 
            onClick={startGame}
            className="px-10 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-2xl rounded-full shadow-[0_0_20px_rgba(234,179,8,0.6)] transition-all transform hover:scale-110 active:scale-95"
          >
            RETRY
          </button>
        </div>
      )}
    </div>
  );
};

export default SliceGame;
