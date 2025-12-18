
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Block, 
  Debris, 
  GameStatus, 
  Vector3, 
  Particle 
} from './types';
import { 
  BLOCK_HEIGHT, 
  INITIAL_WIDTH, 
  INITIAL_DEPTH, 
  MOVE_SPEED, 
  PERFECT_TOLERANCE, 
  ISO_X, 
  ISO_Y, 
  MAX_BLOCK_SIZE, 
  GROWTH_AMOUNT, 
  COMBO_FOR_GROWTH 
} from './constants';
import { audioService } from './services/AudioService';

const NeonStackGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game Logic Refs
  const blocks = useRef<Block[]>([]);
  const debris = useRef<Debris[]>([]);
  const particles = useRef<Particle[]>([]);
  const currentBlock = useRef<Block | null>(null);
  const gameStatus = useRef<GameStatus>(GameStatus.START);
  const score = useRef<number>(0);
  const highScrore = useRef<number>(parseInt(localStorage.getItem('neon-stack-best') || '0'));
  const combo = useRef<number>(0);
  const direction = useRef<'x' | 'z'>('x');
  const cameraY = useRef<number>(0);
  const targetCameraY = useRef<number>(0);
  const hue = useRef<number>(200);
  const flashOpacity = useRef<number>(0);

  // Triggering UI Rerenders
  const [displayScore, setDisplayScore] = useState(0);
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [best, setBest] = useState(highScrore.current);

  const initGame = useCallback(() => {
    blocks.current = [
      {
        id: 'base',
        pos: { x: 0, y: 0, z: 0 },
        width: INITIAL_WIDTH,
        depth: INITIAL_DEPTH,
        color: `hsl(${hue.current}, 70%, 60%)`,
        hue: hue.current
      }
    ];
    debris.current = [];
    particles.current = [];
    score.current = 0;
    combo.current = 0;
    hue.current = Math.random() * 360;
    cameraY.current = 0;
    targetCameraY.current = 0;
    spawnBlock();
    gameStatus.current = GameStatus.PLAYING;
    setStatus(GameStatus.PLAYING);
    setDisplayScore(0);
  }, []);

  const spawnBlock = () => {
    const lastBlock = blocks.current[blocks.current.length - 1];
    const newY = lastBlock.pos.y + BLOCK_HEIGHT;
    direction.current = direction.current === 'x' ? 'z' : 'x';
    hue.current = (hue.current + 5) % 360;

    const startPos: Vector3 = { ...lastBlock.pos, y: newY };
    if (direction.current === 'x') {
      startPos.x = -400;
    } else {
      startPos.z = -400;
    }

    currentBlock.current = {
      id: Math.random().toString(),
      pos: startPos,
      width: lastBlock.width,
      depth: lastBlock.depth,
      color: `hsl(${hue.current}, 70%, 60%)`,
      hue: hue.current
    };

    targetCameraY.current = newY;
  };

  const handleAction = useCallback(() => {
    if (gameStatus.current === GameStatus.START) {
      initGame();
      return;
    }
    if (gameStatus.current === GameStatus.GAMEOVER) {
      initGame();
      return;
    }
    if (!currentBlock.current) return;

    const lastBlock = blocks.current[blocks.current.length - 1];
    const diff = direction.current === 'x' 
      ? currentBlock.current.pos.x - lastBlock.pos.x 
      : currentBlock.current.pos.z - lastBlock.pos.z;

    const isPerfect = Math.abs(diff) < PERFECT_TOLERANCE;
    
    if (isPerfect) {
      // Snap to perfect position
      currentBlock.current.pos.x = lastBlock.pos.x;
      currentBlock.current.pos.z = lastBlock.pos.z;
      combo.current++;
      score.current++;
      flashOpacity.current = 0.5;
      audioService.playPerfect(combo.current);
      
      // Growth mechanic
      if (combo.current >= COMBO_FOR_GROWTH) {
        currentBlock.current.width = Math.min(MAX_BLOCK_SIZE, currentBlock.current.width + GROWTH_AMOUNT);
        currentBlock.current.depth = Math.min(MAX_BLOCK_SIZE, currentBlock.current.depth + GROWTH_AMOUNT);
      }

      // Visual feedback particles
      createPerfectParticles(currentBlock.current);
    } else {
      combo.current = 0;
      const overlap = direction.current === 'x' 
        ? currentBlock.current.width - Math.abs(diff)
        : currentBlock.current.depth - Math.abs(diff);

      if (overlap <= 0) {
        gameOver();
        return;
      }

      // Slice logic
      const newWidth = direction.current === 'x' ? overlap : currentBlock.current.width;
      const newDepth = direction.current === 'z' ? overlap : currentBlock.current.depth;

      // Create debris
      createDebris(currentBlock.current, lastBlock, diff);

      // Adjust block size and position based on overlap
      currentBlock.current.width = newWidth;
      currentBlock.current.depth = newDepth;
      if (direction.current === 'x') {
        currentBlock.current.pos.x = lastBlock.pos.x + diff / 2;
      } else {
        currentBlock.current.pos.z = lastBlock.pos.z + diff / 2;
      }

      score.current++;
      audioService.playPop(1 + score.current * 0.01);
    }

    blocks.current.push(currentBlock.current);
    setDisplayScore(score.current);
    spawnBlock();
  }, [initGame]);

  const createDebris = (curr: Block, prev: Block, diff: number) => {
    const isX = direction.current === 'x';
    const debrisWidth = isX ? Math.abs(diff) : curr.width;
    const debrisDepth = isX ? curr.depth : Math.abs(diff);
    
    let debrisX = curr.pos.x;
    let debrisZ = curr.pos.z;

    if (isX) {
      debrisX = diff > 0 ? prev.pos.x + prev.width / 2 + debrisWidth / 2 : prev.pos.x - prev.width / 2 - debrisWidth / 2;
    } else {
      debrisZ = diff > 0 ? prev.pos.z + prev.depth / 2 + debrisDepth / 2 : prev.pos.z - prev.depth / 2 - debrisDepth / 2;
    }

    debris.current.push({
      id: Math.random().toString(),
      pos: { x: debrisX, y: curr.pos.y, z: debrisZ },
      width: debrisWidth,
      depth: debrisDepth,
      color: curr.color,
      velocity: { x: isX ? diff * 0.1 : 0, y: 0, z: !isX ? diff * 0.1 : 0 },
      rotation: 0,
      rotationVel: (Math.random() - 0.5) * 0.2,
      opacity: 1
    });
  };

  const createPerfectParticles = (b: Block) => {
    for (let i = 0; i < 8; i++) {
      particles.current.push({
        x: (Math.random() - 0.5) * b.width,
        y: b.pos.y,
        size: Math.random() * 5 + 2,
        color: '#fff',
        life: 1,
        maxLife: 1
      });
    }
  };

  const gameOver = () => {
    gameStatus.current = GameStatus.GAMEOVER;
    setStatus(GameStatus.GAMEOVER);
    audioService.playGameOver();
    if (score.current > highScrore.current) {
      highScrore.current = score.current;
      setBest(score.current);
      localStorage.setItem('neon-stack-best', score.current.toString());
    }
    // Final debris of the falling block
    if (currentBlock.current) {
        debris.current.push({
            id: 'failed-block',
            pos: { ...currentBlock.current.pos },
            width: currentBlock.current.width,
            depth: currentBlock.current.depth,
            color: currentBlock.current.color,
            velocity: { x: 0, y: 0, z: 0 },
            rotation: 0,
            rotationVel: 0.05,
            opacity: 1
        });
        currentBlock.current = null;
    }
  };

  // Rendering Helper
  const project = (x: number, y: number, z: number, width: number, height: number) => {
    const screenX = width / 2 + (x - z) * ISO_X;
    const screenY = height * 0.75 + (x + z) * ISO_Y - y + cameraY.current;
    return { x: screenX, y: screenY };
  };

  const drawBlock = (ctx: CanvasRenderingContext2D, b: Block | Debris, isDebris: boolean = false) => {
    const { x: cx, y: cy, z: cz } = b.pos;
    const w = b.width / 2;
    const d = b.depth / 2;
    const h = BLOCK_HEIGHT;
    const canvas = ctx.canvas;

    const topPts = [
      project(cx - w, cy, cz - d, canvas.width, canvas.height),
      project(cx + w, cy, cz - d, canvas.width, canvas.height),
      project(cx + w, cy, cz + d, canvas.width, canvas.height),
      project(cx - w, cy, cz + d, canvas.width, canvas.height),
    ];

    const leftPts = [
      project(cx - w, cy, cz + d, canvas.width, canvas.height),
      project(cx + w, cy, cz + d, canvas.width, canvas.height),
      project(cx + w, cy - h, cz + d, canvas.width, canvas.height),
      project(cx - w, cy - h, cz + d, canvas.width, canvas.height),
    ];

    const rightPts = [
      project(cx + w, cy, cz + d, canvas.width, canvas.height),
      project(cx + w, cy, cz - d, canvas.width, canvas.height),
      project(cx + w, cy - h, cz - d, canvas.width, canvas.height),
      project(cx + w, cy - h, cz + d, canvas.width, canvas.height),
    ];

    // Extraction of HSL components for shading
    const match = b.color.match(/hsl\((\d+\.?\d*),\s*(\d+)%,\s*(\d+)%\)/);
    const hVal = match ? match[1] : '0';
    const sVal = match ? match[2] : '70';
    const lVal = match ? match[3] : '60';

    ctx.globalAlpha = isDebris ? (b as Debris).opacity : 1;

    // Top
    ctx.fillStyle = `hsl(${hVal}, ${sVal}%, ${lVal}%)`;
    ctx.beginPath();
    ctx.moveTo(topPts[0].x, topPts[0].y);
    topPts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();

    // Left
    ctx.fillStyle = `hsl(${hVal}, ${sVal}%, ${parseInt(lVal) - 20}%)`;
    ctx.beginPath();
    ctx.moveTo(leftPts[0].x, leftPts[0].y);
    leftPts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();

    // Right
    ctx.fillStyle = `hsl(${hVal}, ${sVal}%, ${parseInt(lVal) - 40}%)`;
    ctx.beginPath();
    ctx.moveTo(rightPts[0].x, rightPts[0].y);
    rightPts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dynamic Background
      const bgHue = (hue.current + 180) % 360;
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, `hsl(${bgHue}, 20%, 10%)`);
      grad.addColorStop(1, `hsl(${bgHue}, 30%, 5%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Smooth Camera
      cameraY.current += (targetCameraY.current - cameraY.current) * 0.1;

      // Update Current Block
      if (gameStatus.current === GameStatus.PLAYING && currentBlock.current) {
        if (direction.current === 'x') {
          currentBlock.current.pos.x += MOVE_SPEED;
          if (currentBlock.current.pos.x > 400) currentBlock.current.pos.x = -400;
        } else {
          currentBlock.current.pos.z += MOVE_SPEED;
          if (currentBlock.current.pos.z > 400) currentBlock.current.pos.z = -400;
        }
      }

      // Update Debris
      debris.current.forEach((d, i) => {
        d.velocity.y -= 0.5; // gravity
        d.pos.x += d.velocity.x;
        d.pos.y += d.velocity.y;
        d.pos.z += d.velocity.z;
        d.opacity -= 0.015;
        if (d.opacity <= 0) debris.current.splice(i, 1);
      });

      // Update Particles
      particles.current.forEach((p, i) => {
        p.life -= 0.02;
        if (p.life <= 0) particles.current.splice(i, 1);
      });

      // Render Everything
      blocks.current.forEach(b => drawBlock(ctx, b));
      debris.current.forEach(d => drawBlock(ctx, d, true));
      if (currentBlock.current) drawBlock(ctx, currentBlock.current);

      // Render Perfect Effect
      if (flashOpacity.current > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity.current})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        flashOpacity.current -= 0.05;
      }

      // Render Particles
      particles.current.forEach(p => {
        const screen = project(p.x, p.y, 0, canvas.width, canvas.height);
        ctx.strokeStyle = `rgba(255,255,255,${p.life})`;
        ctx.lineWidth = 2;
        const size = (1 - p.life) * 100;
        ctx.strokeRect(screen.x - size/2, screen.y - size/2, size, size);
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') handleAction();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAction]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none touch-none" onClick={handleAction}>
      <canvas ref={canvasRef} className="w-full h-full cursor-pointer" />

      {/* Psychology: Large Score at the top minimizes eye movement during focused play (Foveal focus) */}
      <div className="absolute top-12 left-0 w-full flex flex-col items-center pointer-events-none">
        <h1 className="text-white text-8xl font-thin tracking-widest drop-shadow-2xl">
          {displayScore}
        </h1>
        {combo.current > 1 && (
          <div className="text-blue-300 text-xl font-light mt-2 animate-bounce">
            COMBO x{combo.current}
          </div>
        )}
      </div>

      {status === GameStatus.START && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="text-center p-8">
            <h2 className="text-white text-5xl font-bold mb-4 tracking-tighter">NEON STACK</h2>
            <p className="text-gray-300 text-lg mb-8 font-light">화면을 클릭하여 시작하세요</p>
            <div className="w-12 h-12 border-t-2 border-white rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      {status === GameStatus.GAMEOVER && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-white/10 p-12 rounded-3xl border border-white/20 text-center backdrop-blur-xl shadow-2xl">
            <h2 className="text-red-400 text-4xl font-black mb-2 uppercase tracking-widest">GAME OVER</h2>
            <div className="space-y-1 mb-8">
              <p className="text-gray-400 text-sm uppercase">Score</p>
              <p className="text-white text-6xl font-thin">{displayScore}</p>
              <p className="text-blue-400 text-sm mt-4 uppercase">Best</p>
              <p className="text-blue-200 text-2xl font-light">{best}</p>
            </div>
            {/* Fitts's Law: Large, easy to hit target for primary action */}
            <button 
              className="bg-white text-black px-12 py-4 rounded-full font-bold hover:bg-gray-200 active:scale-95 transition-all shadow-xl"
              onClick={(e) => {
                e.stopPropagation();
                initGame();
              }}
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-8 right-8 text-white/30 text-xs font-light pointer-events-none">
        SPACE OR CLICK TO STACK
      </div>
    </div>
  );
};

export default NeonStackGame;
