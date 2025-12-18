import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, Lane, ObstacleType, PlayerState, GameEntity, Skin } from '../types';
import { 
  CANVAS_WIDTH, CANVAS_HEIGHT, LANE_WIDTH, HORIZON_Y, FOCAL_LENGTH,
  GRAVITY, JUMP_FORCE, BASE_SPEED, MAX_SPEED, SPEED_INCREMENT,
  PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_DEPTH, TRAIN_SIZE, COIN_SIZE, SKINS 
} from '../constants';
import { audioService } from '../services/audioService';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type?: 'fire' | 'void' | 'spark' | 'dust'; // Particle behavior type
}

interface GameCanvasProps {
  gameState: GameState;
  selectedSkin: string;
  onGameOver: (score: number, coinsEarned: number) => void;
  onCoinCollected: () => void;
  setDistance: (dist: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  selectedSkin, 
  onGameOver, 
  onCoinCollected,
  setDistance
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  const playerRef = useRef<PlayerState>({
    lane: Lane.CENTER,
    y: 0,
    dy: 0,
    isJumping: false,
    skinId: selectedSkin,
    runAnimFrame: 0
  });
  
  const entitiesRef = useRef<GameEntity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starFieldRef = useRef<{x:number, y:number, size:number, speed:number}[]>([]);
  
  const speedRef = useRef(BASE_SPEED);
  const scoreRef = useRef(0);
  const gameActiveRef = useRef(false);

  // Initialize Stars
  useEffect(() => {
    starFieldRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * HORIZON_Y,
      size: Math.random() * 2,
      speed: Math.random() * 0.2 + 0.05
    }));
  }, []);

  const resetGame = useCallback(() => {
    playerRef.current = {
      lane: Lane.CENTER,
      y: 0,
      dy: 0,
      isJumping: false,
      skinId: selectedSkin,
      runAnimFrame: 0
    };
    entitiesRef.current = [];
    particlesRef.current = [];
    speedRef.current = BASE_SPEED;
    scoreRef.current = 0;
    gameActiveRef.current = true;
    setDistance(0);
  }, [selectedSkin, setDistance]);

  useEffect(() => {
    if (gameState === GameState.PLAYING) resetGame();
    else gameActiveRef.current = false;
  }, [gameState, resetGame]);

  useEffect(() => {
    playerRef.current.skinId = selectedSkin;
  }, [selectedSkin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== GameState.PLAYING) return;
      const player = playerRef.current;
      switch (e.key) {
        case 'ArrowLeft': if (player.lane > -1) player.lane--; break;
        case 'ArrowRight': if (player.lane < 1) player.lane++; break;
        case 'ArrowUp':
        case ' ':
          if (!player.isJumping) {
            player.dy = JUMP_FORCE;
            player.isJumping = true;
            audioService.playJump();
            // Jump Dust
            spawnParticles(player.lane * LANE_WIDTH, 0, 0, '#ffffff', 5, 'dust');
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // --- Visual Helpers ---

  const spawnParticles = (x: number, y: number, z: number, color: string, count: number, type: Particle['type'] = 'spark') => {
    for(let i=0; i<count; i++) {
        let vx, vy, life, size;
        
        if (type === 'fire') {
            vx = (Math.random() - 0.5) * 5;
            vy = (Math.random() * -5) - 2; // Upward
            life = Math.random() * 20 + 10;
            size = Math.random() * 8 + 4;
        } else if (type === 'void') {
            vx = (Math.random() - 0.5) * 2;
            vy = (Math.random() - 0.5) * 2;
            life = Math.random() * 30 + 20;
            size = Math.random() * 6 + 2;
        } else {
            // Spark/Dust
            vx = (Math.random() - 0.5) * 15;
            vy = (Math.random() - 0.5) * 15;
            life = Math.random() * 10 + 10;
            size = Math.random() * 3 + 1;
        }

        particlesRef.current.push({
            x: x + (Math.random()-0.5)*20, 
            y: y + (Math.random()-0.5)*20, 
            z: z + (Math.random()-0.5)*20,
            vx, vy, 
            life, maxLife: life,
            color, size, type
        });
    }
  };

  const project = (x: number, y: number, z: number) => {
    const cameraHeight = 110; 
    if (z + FOCAL_LENGTH <= 0) return { x: 0, y: 0, scale: 0, visible: false };
    
    const scale = FOCAL_LENGTH / (FOCAL_LENGTH + z);
    const screenX = (CANVAS_WIDTH / 2) + (x * LANE_WIDTH * scale);
    const screenY = HORIZON_Y + ((y + cameraHeight) * scale);
    return { x: screenX, y: screenY, scale, visible: true };
  };

  const drawPolygon = (ctx: CanvasRenderingContext2D, points: any[], color: string, glow: string | null = null) => {
    if (points.some(p => !p.visible)) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for(let i=1; i<points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    
    if (glow) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = glow;
    }
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, '#000000');
    grad.addColorStop(1, '#1a1a1a'); 
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stars
    ctx.fillStyle = '#ffffff';
    starFieldRef.current.forEach(star => {
        ctx.globalAlpha = Math.random() * 0.5 + 0.3;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI*2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Grid Floor (Subtle)
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    const gridZ = (scoreRef.current * 10) % 500;
    
    // Horizontal moving lines
    for(let z=0; z<4000; z+=500) {
        const actualZ = z - gridZ;
        if(actualZ <= 0) continue;
        const p1 = project(-5, 0, actualZ);
        const p2 = project(5, 0, actualZ);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    }
    
    // Vertical Lines (Lanes)
    [-1.5, -0.5, 0.5, 1.5].forEach(lx => {
         const p1 = project(lx, 0, 0);
         const p2 = project(lx, 0, 4000);
         ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    });
  };

  const drawMonolith = (ctx: CanvasRenderingContext2D, lane: number, z: number) => {
    // Shorter, sharper obstacle
    const w = 0.5;
    const h = TRAIN_SIZE.h; // Reduced height
    const d = TRAIN_SIZE.d;
    
    const fbl = project(lane - w/2, 0, z);
    const fbr = project(lane + w/2, 0, z);
    const ftl = project(lane - w/4, -h, z); // Tapered top
    const ftr = project(lane + w/4, -h, z); // Tapered top
    
    const btl = project(lane - w/4, -h, z + d);
    const btr = project(lane + w/4, -h, z + d);
    
    if (!fbl.visible) return;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    const s = project(lane, 0, z + d/2);
    ctx.beginPath();
    ctx.ellipse(s.x, s.y, 40*s.scale, 15*s.scale, 0, 0, Math.PI*2);
    ctx.fill();

    // Draw
    const bodyColor = '#171717';
    const edgeColor = '#ef4444';

    drawPolygon(ctx, [fbl, fbr, ftr, ftl], bodyColor); // Front
    
    if (lane < 0) { 
        const bbr = project(lane + w/2, 0, z + d);
        drawPolygon(ctx, [fbr, bbr, btr, ftr], '#262626'); // Side
    } else {
        const bbl = project(lane - w/2, 0, z + d);
        drawPolygon(ctx, [fbl, bbl, btl, ftl], '#262626'); // Side
    }

    drawPolygon(ctx, [ftl, ftr, btr, btl], '#404040'); // Top

    // Glowing Neon Edge
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 2 * fbl.scale;
    ctx.shadowBlur = 10;
    ctx.shadowColor = edgeColor;
    ctx.beginPath();
    ctx.moveTo(fbl.x, fbl.y); ctx.lineTo(ftl.x, ftl.y); ctx.lineTo(ftr.x, ftr.y); ctx.lineTo(fbr.x, fbr.y);
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, player: PlayerState) => {
    const skin = SKINS.find(s => s.id === player.skinId) || SKINS[0];
    const { lane, y, runAnimFrame } = player;
    const py = y;
    const z = 0;

    // Shadow
    if (py < 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        const s = project(lane, 0, z + 20);
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, 25*s.scale, 8*s.scale, 0, 0, Math.PI*2);
        ctx.fill();
    }

    const scale = project(lane, py, z).scale;

    // --- CUSTOM SKIN RENDERING ---
    
    if (skin.id === 'dragon_fire') {
        // DRAGON: Floating shards with fire core
        const wobble = Math.sin(runAnimFrame);
        
        // Wings (Triangles)
        const wingY = py - 30 + wobble * 5;
        const pLeft = project(lane - 0.4, wingY, z + 20);
        const pRight = project(lane + 0.4, wingY, z + 20);
        const pCenter = project(lane, py - 20, z);

        ctx.fillStyle = '#7f1d1d'; // Dark Red
        ctx.beginPath(); ctx.moveTo(pCenter.x, pCenter.y); ctx.lineTo(pLeft.x, pLeft.y); ctx.lineTo(pLeft.x, pLeft.y - 30*scale); ctx.fill();
        ctx.beginPath(); ctx.moveTo(pCenter.x, pCenter.y); ctx.lineTo(pRight.x, pRight.y); ctx.lineTo(pRight.x, pRight.y - 30*scale); ctx.fill();

        // Head/Core (Diamond)
        const headY = py - 40 + wobble * 2;
        const head = project(lane, headY, z);
        
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#f59e0b';
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(head.x, head.y - 25*scale);
        ctx.lineTo(head.x + 15*scale, head.y);
        ctx.lineTo(head.x, head.y + 25*scale);
        ctx.lineTo(head.x - 15*scale, head.y);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Eyes
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(head.x - 5*scale, head.y - 5*scale, 10*scale, 4*scale);

    } else if (skin.id === 'neon_samurai') {
        // SAMURAI: Sharp angular blade-like shape
        const pBase = project(lane, py, z);
        const pTop = project(lane, py - 50, z);
        const pLeft = project(lane - 0.25, py - 25, z);
        const pRight = project(lane + 0.25, py - 25, z);
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#06b6d4'; // Cyan Glow
        
        ctx.fillStyle = '#0891b2';
        ctx.beginPath();
        ctx.moveTo(pTop.x, pTop.y);
        ctx.lineTo(pRight.x, pRight.y);
        ctx.lineTo(pBase.x, pBase.y);
        ctx.lineTo(pLeft.x, pLeft.y);
        ctx.closePath();
        ctx.fill();

        // Katana/Spike details
        ctx.strokeStyle = '#cffafe';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(pTop.x, pTop.y); ctx.lineTo(pBase.x, pBase.y); ctx.stroke();
        
        ctx.shadowBlur = 0;

    } else if (skin.id === 'void_god') {
        // VOID: Pulsating dark sphere with aura
        const center = project(lane, py - 30, z);
        const pulse = Math.sin(runAnimFrame * 0.5) * 5;
        const size = (20 + pulse) * scale;

        // Aura
        const grad = ctx.createRadialGradient(center.x, center.y, size * 0.5, center.x, center.y, size * 2.5);
        grad.addColorStop(0, 'rgba(124, 58, 237, 0.8)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(center.x, center.y, size * 3, 0, Math.PI*2); ctx.fill();

        // Core
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(center.x, center.y, size, 0, Math.PI*2); 
        ctx.fill();
        ctx.stroke();

    } else {
        // DEFAULT: Ghost Walker (Sleek Cube)
        const w = 0.3;
        const h = PLAYER_HEIGHT;
        
        const fbl = project(lane - w/2, py, z);
        const fbr = project(lane + w/2, py, z);
        const ftl = project(lane - w/2, py - h, z);
        const ftr = project(lane + w/2, py - h, z);
        const d = 40;
        const btl = project(lane - w/2, py - h, z + d);
        const btr = project(lane + w/2, py - h, z + d);

        drawPolygon(ctx, [fbl, fbr, ftr, ftl], skin.color);
        drawPolygon(ctx, [ftl, ftr, btr, btl], skin.color);
        
        ctx.fillStyle = skin.accentColor;
        const cx = (fbl.x + fbr.x)/2;
        const cy = (fbl.y + ftl.y)/2;
        ctx.fillRect(cx - 2*scale, cy - 10*scale, 4*scale, 20*scale);
    }
  };

  // --- Main Loop ---
  const update = useCallback((time: number) => {
    if (!canvasRef.current || !gameActiveRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const player = playerRef.current;
    
    // --- PARTICLE GENERATION (SKIN BASED) ---
    const speed = speedRef.current;
    if (gameActiveRef.current) {
        if (player.skinId === 'dragon_fire') {
            // Constant fire trail
            spawnParticles(player.lane * LANE_WIDTH, player.y - 20, 0, '#f97316', 2, 'fire');
            spawnParticles(player.lane * LANE_WIDTH, player.y - 20, 0, '#ef4444', 1, 'fire');
        } else if (player.skinId === 'neon_samurai') {
            // Digital sparks
            if (Math.random() < 0.5)
                spawnParticles(player.lane * LANE_WIDTH, player.y - 20, 0, '#06b6d4', 1, 'spark');
        } else if (player.skinId === 'void_god') {
            // Dark matter implosion
            spawnParticles(player.lane * LANE_WIDTH, player.y - 30, 0, '#7c3aed', 1, 'void');
        }
    }

    // Logic
    if (player.isJumping) {
      player.y += player.dy;
      player.dy += GRAVITY;
      if (player.y >= 0) {
        player.y = 0;
        player.dy = 0;
        player.isJumping = false;
        // Land effect
        spawnParticles(player.lane * LANE_WIDTH, 0, 0, '#ffffff', 5, 'dust');
      }
    }
    player.runAnimFrame += 0.2;

    entitiesRef.current.forEach(e => e.z -= speed);
    entitiesRef.current = entitiesRef.current.filter(e => e.z > -300);

    // Spawn Logic
    const spawnZ = 2500;
    const farthestZ = Math.max(0, ...entitiesRef.current.map(e => e.z));
    
    if (farthestZ < spawnZ - 600) {
       const r = Math.random();
       if (r < 0.45) {
         const lane = Math.floor(Math.random() * 3) - 1;
         entitiesRef.current.push({ id: Date.now(), type: ObstacleType.TRAIN, lane, z: spawnZ, active: true });
       } else {
         const lane = Math.floor(Math.random() * 3) - 1;
         for(let i=0; i<4; i++) {
            entitiesRef.current.push({ id: Date.now()+i, type: ObstacleType.COIN, lane, z: spawnZ + i*150, active: true });
         }
       }
    }

    if (speedRef.current < MAX_SPEED) speedRef.current += SPEED_INCREMENT;
    scoreRef.current += speedRef.current * 0.1;
    setDistance(Math.floor(scoreRef.current));

    // Collision
    const pBounds = { lane: player.lane, y: player.y };
    entitiesRef.current.forEach(e => {
        if (!e.active) return;
        const zDist = e.z;
        let depth = e.type === ObstacleType.TRAIN ? TRAIN_SIZE.d : COIN_SIZE;
        let width = e.type === ObstacleType.TRAIN ? 0.6 : 0.4;
        
        if (zDist < PLAYER_DEPTH && zDist + depth > 0) {
            if (Math.abs(e.lane - pBounds.lane) < width) {
                if (e.type === ObstacleType.COIN) {
                    if (pBounds.y > -60) {
                        e.active = false;
                        audioService.playCoin();
                        onCoinCollected();
                        spawnParticles(e.lane * LANE_WIDTH, -40, 0, '#fbbf24', 5, 'spark');
                    }
                } else if (e.type === ObstacleType.TRAIN) {
                     // Collide only if low enough (Obstacle height is 70, player jumps ~120+)
                     if (pBounds.y > -70) { 
                         gameActiveRef.current = false;
                         audioService.playCrash();
                         onGameOver(Math.floor(scoreRef.current), 0);
                     }
                }
            }
        }
    });

    // --- Render ---
    drawBackground(ctx);

    const renderList = [...entitiesRef.current];
    renderList.push({ id: -999, type: 'PLAYER' as any, lane: player.lane, z: 0, active: true });
    renderList.sort((a, b) => b.z - a.z);

    renderList.forEach(e => {
        if (!e.active) return;
        if (e.type === 'PLAYER' as any) drawPlayer(ctx, player);
        else if (e.type === ObstacleType.TRAIN) drawMonolith(ctx, e.lane, e.z);
        else if (e.type === ObstacleType.COIN) {
             // Draw Coin/Prism
             const p = project(e.lane, -40, e.z);
             if(p.visible) {
                 ctx.shadowBlur = 10;
                 ctx.shadowColor = '#fbbf24';
                 ctx.fillStyle = '#ffffff';
                 ctx.beginPath();
                 ctx.moveTo(p.x, p.y - 15*p.scale);
                 ctx.lineTo(p.x + 10*p.scale, p.y);
                 ctx.lineTo(p.x, p.y + 15*p.scale);
                 ctx.lineTo(p.x - 10*p.scale, p.y);
                 ctx.fill();
                 ctx.shadowBlur = 0;
             }
        }
    });

    // Particles Render
    particlesRef.current.forEach(p => {
        const proj = project(p.x / LANE_WIDTH, p.y, p.z);
        if(proj.visible) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life / p.maxLife;
            
            ctx.beginPath();
            if (p.type === 'fire') {
                 // Fire draws upward
                 ctx.ellipse(proj.x, proj.y, p.size*proj.scale, p.size*2*proj.scale, 0, 0, Math.PI*2);
            } else {
                 ctx.arc(proj.x, proj.y, p.size * proj.scale, 0, Math.PI*2);
            }
            ctx.fill();
            
            p.x += p.vx;
            p.y += p.vy;
            p.z -= speed; // Move with world relative
            p.life -= 1;
            
            if (p.type === 'fire') p.size *= 0.95; // Shrink
        }
    });
    ctx.globalAlpha = 1.0;
    particlesRef.current = particlesRef.current.filter(p => p.life > 0 && p.z > -200);

    requestRef.current = requestAnimationFrame(update);
  }, [gameState, selectedSkin, onGameOver, onCoinCollected, setDistance]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => { if(requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [update]);

  return (
    <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain bg-black shadow-2xl rounded-none border border-slate-800" />
  );
};

export default GameCanvas;