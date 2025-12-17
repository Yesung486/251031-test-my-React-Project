// 파일 위치: components/game-neon-breaker/NeonBreakerGame.tsx

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Info, Trophy, Heart, Zap } from 'lucide-react';
import { Ball, Paddle, Brick, Particle, GameState, Vector, Item, ItemType } from './types';
import { GAME_CONFIG, COLORS } from './constants';
import { audioService } from './audioService';

const NeonBreakerGame: React.FC = () => {
  // --- 여기부터는 '요리 재료'들이야. 주방 안에 잘 있어. ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(GAME_CONFIG.LIVES_START);
  const [isMuted, setIsMuted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const ballsRef = useRef<Ball[]>([]);
  const paddleRef = useRef<Paddle>({ pos: { x: GAME_CONFIG.CANVAS_WIDTH / 2 - GAME_CONFIG.PADDLE_WIDTH / 2, y: GAME_CONFIG.CANVAS_HEIGHT - 40 }, width: GAME_CONFIG.PADDLE_WIDTH, height: GAME_CONFIG.PADDLE_HEIGHT, color: COLORS.PADDLE });
  const bricksRef = useRef<Brick[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const itemsRef = useRef<Item[]>([]);

  // --- 여기부터는 '요리법'들이야. 이것도 주방 안에 잘 있어. ---
  const initLevel = useCallback(() => {
    const bricks: Brick[] = [];
    const rows = GAME_CONFIG.BRICK_ROWS;
    const cols = GAME_CONFIG.BRICK_COLS;
    const brickWidth = (GAME_CONFIG.CANVAS_WIDTH - (cols + 1) * GAME_CONFIG.BRICK_PADDING) / cols;
    const brickHeight = 30;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tier = Math.ceil((rows - r) / 2);
        let color = COLORS.BRICK_TIER_1;
        if (tier === 2) color = COLORS.BRICK_TIER_2;
        if (tier === 3) color = COLORS.BRICK_TIER_3;
        const hasItem = Math.random() < GAME_CONFIG.ITEM_DROP_CHANCE;
        bricks.push({ id: `${r}-${c}`, pos: { x: c * (brickWidth + GAME_CONFIG.BRICK_PADDING) + GAME_CONFIG.BRICK_PADDING, y: r * (brickHeight + GAME_CONFIG.BRICK_PADDING) + GAME_CONFIG.BRICK_OFFSET_TOP }, width: brickWidth, height: brickHeight, value: tier, status: tier, maxHealth: tier, color: color, itemType: hasItem ? ItemType.MULTI_BALL : null });
      }
    }
    bricksRef.current = bricks;
    itemsRef.current = [];
    particlesRef.current = [];
  }, []);

  const resetBall = useCallback(() => {
    ballsRef.current = [{ id: 'primary', pos: { x: paddleRef.current.pos.x + paddleRef.current.width / 2, y: paddleRef.current.pos.y - 20 }, vel: { x: 0, y: 0 }, radius: GAME_CONFIG.BALL_RADIUS, active: false, speed: GAME_CONFIG.BALL_SPEED_BASE }];
  }, []);

  const launchBall = useCallback(() => {
    const primaryBall = ballsRef.current[0];
    if (primaryBall && !primaryBall.active) {
        primaryBall.active = true;
        const dirX = Math.random() > 0.5 ? 1 : -1;
        primaryBall.vel = { x: 4 * dirX, y: -4 };
    }
  }, []);

  const startGame = () => {
    setScore(0);
    setLives(GAME_CONFIG.LIVES_START);
    initLevel();
    resetBall();
    setGameState(GameState.PLAYING);
  };

  const spawnItem = useCallback((x: number, y: number, type: ItemType) => { itemsRef.current.push({ id: Math.random().toString(36), pos: { x, y }, vel: { x: 0, y: GAME_CONFIG.ITEM_FALL_SPEED }, type: type, width: GAME_CONFIG.ITEM_SIZE, height: GAME_CONFIG.ITEM_SIZE, active: true, }); audioService.playItemSpawn(); }, []);
  const activatePowerUp = useCallback((type: ItemType) => { audioService.playPowerUp(); if (type === ItemType.MULTI_BALL) { const currentBalls = [...ballsRef.current]; const newBalls: Ball[] = []; currentBalls.forEach(b => { if (b.active) { newBalls.push({ id: Math.random().toString(36), pos: { ...b.pos }, vel: { x: -b.vel.x, y: b.vel.y }, radius: b.radius, active: true, speed: b.speed }); newBalls.push({ id: Math.random().toString(36), pos: { ...b.pos }, vel: { x: b.vel.x * 0.5, y: b.vel.y * 1.2 }, radius: b.radius, active: true, speed: b.speed }); } }); ballsRef.current = [...ballsRef.current, ...newBalls]; } }, []);
  const createParticles = (x: number, y: number, color: string, count: number) => { for (let i = 0; i < count; i++) { particlesRef.current.push({ id: Math.random().toString(36), pos: { x, y }, vel: { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4 }, life: 1.0, color: color, size: Math.random() * 3 + 1 }); } };
  const update = useCallback(() => { const paddle = paddleRef.current; const bricks = bricksRef.current; for (let i = itemsRef.current.length - 1; i >= 0; i--) { const item = itemsRef.current[i]; item.pos.y += item.vel.y; if (item.pos.y + item.height >= paddle.pos.y && item.pos.y <= paddle.pos.y + paddle.height && item.pos.x + item.width >= paddle.pos.x && item.pos.x <= paddle.pos.x + paddle.width) { activatePowerUp(item.type); itemsRef.current.splice(i, 1); continue; } if (item.pos.y > GAME_CONFIG.CANVAS_HEIGHT) { itemsRef.current.splice(i, 1); } } for (let i = ballsRef.current.length - 1; i >= 0; i--) { const ball = ballsRef.current[i]; if (ball.active) { ball.pos.x += ball.vel.x; ball.pos.y += ball.vel.y; } else { ball.pos.x = paddle.pos.x + paddle.width / 2; ball.pos.y = paddle.pos.y - ball.radius - 2; } if (ball.pos.x + ball.radius > GAME_CONFIG.CANVAS_WIDTH || ball.pos.x - ball.radius < 0) { ball.vel.x *= -1; audioService.playWallHit(); } if (ball.pos.y - ball.radius < 0) { ball.vel.y *= -1; audioService.playWallHit(); } if (ball.pos.y + ball.radius > GAME_CONFIG.CANVAS_HEIGHT) { ballsRef.current.splice(i, 1); if (ballsRef.current.length === 0) { setLives((prev) => { const newLives = prev - 1; if (newLives <= 0) { setGameState(GameState.GAME_OVER); } else { resetBall(); audioService.playLostLife(); } return newLives; }); } continue; } if (ball.pos.y + ball.radius >= paddle.pos.y && ball.pos.y - ball.radius <= paddle.pos.y + paddle.height && ball.pos.x >= paddle.pos.x && ball.pos.x <= paddle.pos.x + paddle.width) { if (ball.vel.y > 0) { ball.vel.y *= -1; const hitPoint = ball.pos.x - (paddle.pos.x + paddle.width / 2); ball.vel.x = hitPoint * 0.15; const currentSpeed = Math.sqrt(ball.vel.x ** 2 + ball.vel.y ** 2); if (currentSpeed < GAME_CONFIG.BALL_SPEED_MAX) { const scale = 1.05; ball.vel.x *= scale; ball.vel.y *= scale; } audioService.playPaddleHit(); createParticles(ball.pos.x, ball.pos.y, COLORS.PADDLE, 5); } } for (let j = 0; j < bricks.length; j++) { const b = bricks[j]; if (b.status > 0) { if (ball.pos.x > b.pos.x && ball.pos.x < b.pos.x + b.width && ball.pos.y > b.pos.y && ball.pos.y < b.pos.y + b.height) { ball.vel.y *= -1; b.status--; audioService.playBrickHit(b.status); createParticles(ball.pos.x, ball.pos.y, b.color, 5); setScore(prev => prev + 10 * b.value); if (b.status <= 0) { if (b.itemType) { spawnItem(b.pos.x + b.width / 2, b.pos.y + b.height / 2, b.itemType); } } break; } } } } if (bricksRef.current.length > 0 && bricks.every(b => b.status <= 0)) { setGameState(GameState.VICTORY); audioService.playWin(); } for (let i = particlesRef.current.length - 1; i >= 0; i--) { const p = particlesRef.current[i]; p.pos.x += p.vel.x; p.pos.y += p.vel.y; p.life -= 0.02; p.vel.y += 0.1; if (p.life <= 0) { particlesRef.current.splice(i, 1); } } }, [resetBall, activatePowerUp, spawnItem]);
  const draw = useCallback((ctx: CanvasRenderingContext2D) => { ctx.fillStyle = COLORS.BACKGROUND; ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT); ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; bricksRef.current.forEach(b => { if (b.status > 0) { ctx.fillStyle = b.color; ctx.shadowBlur = b.status * 3; ctx.shadowColor = b.color; ctx.fillRect(b.pos.x, b.pos.y, b.width, b.height); ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(b.pos.x, b.pos.y, b.width, b.height / 2); if (b.itemType) { ctx.beginPath(); ctx.arc(b.pos.x + 10, b.pos.y + 10, 4, 0, Math.PI * 2); ctx.fillStyle = COLORS.ITEM_MULTI; ctx.fill(); ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.stroke(); } ctx.fillStyle = COLORS.BRICK_TEXT; ctx.fillText(b.status.toString(), b.pos.x + b.width / 2, b.pos.y + b.height / 2); } }); itemsRef.current.forEach(item => { ctx.shadowBlur = 10; ctx.shadowColor = COLORS.ITEM_MULTI; ctx.fillStyle = COLORS.ITEM_MULTI; ctx.beginPath(); ctx.roundRect(item.pos.x, item.pos.y, item.width, item.height, 5); ctx.fill(); ctx.fillStyle = 'white'; ctx.font = '10px Arial'; ctx.fillText("x3", item.pos.x + item.width / 2, item.pos.y + item.height / 2); ctx.shadowBlur = 0; }); const p = paddleRef.current; ctx.fillStyle = p.color; ctx.shadowBlur = 15; ctx.shadowColor = p.color; ctx.beginPath(); ctx.roundRect(p.pos.x, p.pos.y, p.width, p.height, 8); ctx.fill(); ctx.shadowBlur = 0; ballsRef.current.forEach(b => { ctx.beginPath(); ctx.arc(b.pos.x, b.pos.y, b.radius, 0, Math.PI * 2); ctx.fillStyle = COLORS.BALL; ctx.shadowBlur = 10; ctx.shadowColor = COLORS.BALL; ctx.fill(); ctx.closePath(); ctx.shadowBlur = 0; }); particlesRef.current.forEach(part => { ctx.globalAlpha = part.life; ctx.fillStyle = part.color; ctx.beginPath(); ctx.arc(part.pos.x, part.pos.y, part.size, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1.0; }); }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const gameLoop = () => { if (gameState !== GameState.PLAYING) { return; } update(); draw(ctx); requestRef.current = requestAnimationFrame(gameLoop); };
    if (gameState === GameState.PLAYING) { launchBall(); requestRef.current = requestAnimationFrame(gameLoop); } else { draw(ctx); }
    return () => { cancelAnimationFrame(requestRef.current); };
  }, [gameState, draw, update, launchBall]);

  useEffect(() => {
    const handleInput = (clientX: number) => { if (!canvasRef.current) return; const rect = canvasRef.current.getBoundingClientRect(); const scaleX = GAME_CONFIG.CANVAS_WIDTH / rect.width; let x = (clientX - rect.left) * scaleX; x = Math.max(0, Math.min(GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH, x - GAME_CONFIG.PADDLE_WIDTH / 2)); paddleRef.current.pos.x = x; ballsRef.current.forEach(b => { if (!b.active) { b.pos.x = x + GAME_CONFIG.PADDLE_WIDTH / 2; } }); };
    const onMouseMove = (e: MouseEvent) => handleInput(e.clientX);
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); handleInput(e.touches[0].clientX); };
    const canvas = canvasRef.current;
    if (canvas) { canvas.addEventListener('mousemove', onMouseMove); canvas.addEventListener('touchmove', onTouchMove, { passive: false }); }
    return () => { if (canvas) { canvas.removeEventListener('mousemove', onMouseMove); canvas.removeEventListener('touchmove', onTouchMove); } };
  }, []);

  // ↓↓↓ 이제 '완성된 요리'를 손님에게 내놓을 시간이야! (return) ↓↓↓
  // 이 return 부분은 아까와 똑같아.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-slate-950 p-4 font-sans">
      <div className="w-full max-w-[800px] flex justify-between items-center mb-4 p-4 bg-slate-900/80 backdrop-blur rounded-xl border border-slate-800 shadow-lg text-white select-none">
        <div className="flex items-center space-x-6"><div className="flex items-center text-cyan-400"><Trophy className="w-5 h-5 mr-2" /><span className="font-bold text-xl">{score}</span></div><div className="flex items-center text-pink-500"><Heart className="w-5 h-5 mr-2 fill-current" /><span className="font-bold text-xl">{lives}</span></div></div>
        <h1 className="hidden sm:block text-2xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse">NEON BREAKER</h1>
        <div className="flex space-x-2">
            <button onClick={() => setShowInfo(true)} className="p-2 hover:bg-slate-800 rounded-full transition-colors" title="Project Info"><Info className="w-6 h-6 text-slate-400 hover:text-white" /></button>
            <button onClick={() => { const muted = audioService.toggleMute(); setIsMuted(muted); }} className="p-2 hover:bg-slate-800 rounded-full transition-colors">{isMuted ? <VolumeX className="w-6 h-6 text-slate-400" /> : <Volume2 className="w-6 h-6 text-cyan-400" />}</button>
            <button onClick={() => { if (gameState === GameState.PLAYING) setGameState(GameState.PAUSED); else if (gameState === GameState.PAUSED) setGameState(GameState.PLAYING); }} className="p-2 hover:bg-slate-800 rounded-full transition-colors">{gameState === GameState.PAUSED ? <Play className="w-6 h-6 text-green-400" /> : <Pause className="w-6 h-6 text-amber-400" />}</button>
        </div>
      </div>
      <div className="relative group shadow-2xl rounded-lg overflow-hidden ring-4 ring-slate-800/50">
        <canvas ref={canvasRef} width={GAME_CONFIG.CANVAS_WIDTH} height={GAME_CONFIG.CANVAS_HEIGHT} className="bg-slate-900 cursor-none touch-none w-full max-w-[800px] max-h-[600px] aspect-[4/3]" style={{ maxWidth: '100%', height: 'auto' }}/>
        {gameState === GameState.MENU && (<div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm z-10"><h1 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">NEON <span className="text-cyan-400">BREAKER</span></h1><p className="text-slate-400 mb-8 text-lg animate-pulse">Use Mouse or Touch to Play</p><button onClick={startGame} className="flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full text-xl font-bold shadow-lg transform hover:scale-105 transition-all"><Play className="mr-2 w-6 h-6 fill-white" /> GAME START</button></div>)}
        {gameState === GameState.GAME_OVER && (<div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 z-20"><h2 className="text-5xl font-bold text-red-500 mb-4 drop-shadow-lg">GAME OVER</h2><p className="text-2xl text-white mb-8">Final Score: <span className="text-cyan-400 font-mono">{score}</span></p><button onClick={startGame} className="flex items-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-lg font-semibold transition-all"><RotateCcw className="mr-2 w-5 h-5" /> Try Again</button></div>)}
        {gameState === GameState.VICTORY && (<div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-20"><h2 className="text-5xl font-bold text-yellow-400 mb-4 drop-shadow-[0_0_25px_rgba(250,204,21,0.6)]">STAGE CLEAR!</h2><p className="text-xl text-slate-300 mb-8">All Bricks Destroyed!</p><button onClick={startGame} className="flex items-center px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-lg font-semibold transition-all"><Zap className="mr-2 w-5 h-5" /> Play Next Level</button></div>)}
        {gameState === GameState.PAUSED && (<div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20"><div className="bg-slate-800 px-8 py-4 rounded-lg border border-slate-600"><span className="text-2xl font-bold text-white tracking-widest">PAUSED</span></div></div>)}
      </div>
    </div>
  );
// 여기가 '주방'의 끝이야! 요리는 이 안에서 끝나야 해.
};

export default NeonBreakerGame;