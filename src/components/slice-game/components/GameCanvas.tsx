import React, { useRef, useEffect } from 'react';
import { BladePoint, GameTarget, Particle, SlicePart, EntityType, FruitType, FloatingText } from '../types';
import { audioService } from '../services/audioService';

const GRAVITY = 0.4;
const BLADE_LIFE = 10;
const COMBO_WINDOW = 15; // Frames allowed between cuts to count as a combo (approx 0.25s)

// Fruit styling configuration
const FRUIT_STYLES: Record<FruitType, { skin: string; flesh: string; seed: string }> = {
  [FruitType.WATERMELON]: { skin: '#2E7D32', flesh: '#FF1744', seed: '#000' }, // Green/Red
  [FruitType.ORANGE]: { skin: '#EF6C00', flesh: '#FF9800', seed: '#FFF3E0' }, // Dark Orange/Orange
  [FruitType.KIWI]: { skin: '#795548', flesh: '#76FF03', seed: '#212121' }, // Brown/Lime
  [FruitType.LEMON]: { skin: '#FBC02D', flesh: '#FFEB3B', seed: '#FFF' }, // D.Yellow/Yellow
  [FruitType.GOLDEN]: { skin: '#FFD700', flesh: '#FFFF00', seed: '#FFF' }, // Gold/Yellow
  [FruitType.ICE]: { skin: '#00BCD4', flesh: '#E0F7FA', seed: '#FFF' }, // Cyan/White
};

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number, lives: number) => void;
  gameActive: boolean;
  onRestart: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, onScoreUpdate, gameActive, onRestart }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State Refs
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const bladeRef = useRef<BladePoint[]>([]);
  const targetsRef = useRef<GameTarget[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const slicesRef = useRef<SlicePart[]>([]);
  const textsRef = useRef<FloatingText[]>([]);
  
  const frameRef = useRef(0);
  const difficultyRef = useRef(1);
  
  // Combo & Special Refs
  const lastSliceTimeRef = useRef(0);
  const comboCountRef = useRef(0);
  const freezeTimerRef = useRef(0); // For Ice Fruit effect
  const backgroundFlashRef = useRef(0); // For combo flash effect

  const random = (min: number, max: number) => Math.random() * (max - min) + min;

  const initGame = () => {
    scoreRef.current = 0;
    livesRef.current = 3;
    bladeRef.current = [];
    targetsRef.current = [];
    particlesRef.current = [];
    slicesRef.current = [];
    textsRef.current = [];
    difficultyRef.current = 1;
    freezeTimerRef.current = 0;
    backgroundFlashRef.current = 0;
    onScoreUpdate(0, 3);
  };

  useEffect(() => {
    if (gameActive) initGame();
  }, [gameActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    // ★ [수정 1] 화면 크기 맞추기 (부모 요소 기준)
    const handleResize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 실행

    // ★ [수정 2] 좌표 보정 함수 (마우스 위치 정확하게 잡기)
    const getLocalCoordinates = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    // Input Handling
    const addBladePoint = (x: number, y: number) => {
      bladeRef.current.push({ x, y, life: BLADE_LIFE });
    };

    // ★ [수정 3] 마우스 이벤트에 좌표 보정 적용
    const handleMouseMove = (e: MouseEvent) => {
      const { x, y } = getLocalCoordinates(e.clientX, e.clientY);
      addBladePoint(x, y);
    };

    // ★ [수정 4] 터치 이벤트에 좌표 보정 적용
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const { x, y } = getLocalCoordinates(touch.clientX, touch.clientY);
      addBladePoint(x, y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Spawning Logic
    const spawnTarget = () => {
      const isBomb = Math.random() < 0.12 + (difficultyRef.current * 0.02);
      let r = 35;
      let type = EntityType.FRUIT;
      let fType = FruitType.WATERMELON; // Default

      if (isBomb) {
        type = EntityType.BOMB;
        r = 30;
      } else {
        // Fruit randomizer
        const rand = Math.random();
        if (rand < 0.05) fType = FruitType.GOLDEN; // 5% chance
        else if (rand < 0.10) fType = FruitType.ICE; // 5% chance
        else if (rand < 0.3) fType = FruitType.WATERMELON;
        else if (rand < 0.5) fType = FruitType.ORANGE;
        else if (rand < 0.75) fType = FruitType.KIWI;
        else fType = FruitType.LEMON;
      }

      const x = random(r, canvas.width - r);
      const y = canvas.height + r;
      // Throw logic
      const vx = (canvas.width / 2 - x) * random(0.005, 0.015) + random(-1, 1); 
      const vy = random(-14, -18) - (difficultyRef.current * 0.5);
      
      targetsRef.current.push({
        id: Date.now() + Math.random(),
        type,
        fruitType: fType,
        x, y, vx, vy,
        radius: r,
        rotation: 0,
        rotationSpeed: random(-0.2, 0.2),
        isSliced: false
      });
      
      if (!isBomb) audioService.playThrow();
    };

    const createParticles = (x: number, y: number, color: string) => {
      const count = 12;
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x, y,
          vx: random(-6, 6),
          vy: random(-6, 6),
          life: random(20, 40),
          color: color,
          size: random(2, 6)
        });
      }
    };

    const createSlices = (target: GameTarget) => {
      const speed = 4;
      // Split into two halves
      [0, Math.PI].forEach((angleOffset) => {
         slicesRef.current.push({
          x: target.x, y: target.y,
          vx: target.vx + (angleOffset === 0 ? -speed : speed), 
          vy: target.vy,
          radius: target.radius,
          fruitType: target.fruitType,
          rotation: target.rotation,
          rotationSpeed: target.rotationSpeed + (angleOffset === 0 ? -0.1 : 0.1),
          startAngle: angleOffset,
          endAngle: angleOffset + Math.PI,
          life: 60
        });
      });
    };

    const drawFruit = (ctx: CanvasRenderingContext2D, radius: number, fruitType: FruitType) => {
      const style = FRUIT_STYLES[fruitType];
      
      // 1. Skin (Outer circle)
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = style.skin;
      ctx.fill();
      
      // 2. Flesh (Inner circle) - slightly smaller
      ctx.beginPath();
      ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
      ctx.fillStyle = style.flesh;
      ctx.fill();

      // 3. Detail (Seeds or Inner core)
      if (fruitType === FruitType.ORANGE || fruitType === FruitType.LEMON) {
        // Draw segments
        ctx.strokeStyle = style.skin; // White-ish lines usually, but using skin color for contrast
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let i=0; i<8; i++) {
          ctx.moveTo(0,0);
          ctx.lineTo(Math.cos(i * Math.PI/4) * (radius-4), Math.sin(i * Math.PI/4) * (radius-4));
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (fruitType === FruitType.WATERMELON || fruitType === FruitType.KIWI || fruitType === FruitType.GOLDEN) {
        // Draw dots/seeds
        ctx.fillStyle = style.seed;
        for(let i=0; i<6; i++) {
          const ang = i * Math.PI / 3;
          const dist = radius * 0.5;
          ctx.beginPath();
          ctx.arc(Math.cos(ang)*dist, Math.sin(ang)*dist, 2, 0, Math.PI*2);
          ctx.fill();
        }
      }
      
      // Special Glow
      if (fruitType === FruitType.GOLDEN || fruitType === FruitType.ICE) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = style.skin;
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };

    const checkCollision = (p1: BladePoint, p2: BladePoint, target: GameTarget) => {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const lenSq = dx * dx + dy * dy;
      const t = ((target.x - p1.x) * dx + (target.y - p1.y) * dy) / Math.max(lenSq, 0.0001);
      
      let closestX, closestY;
      if (t < 0) { closestX = p1.x; closestY = p1.y; }
      else if (t > 1) { closestX = p2.x; closestY = p2.y; }
      else { closestX = p1.x + t * dx; closestY = p1.y + t * dy; }

      const distSq = (target.x - closestX) ** 2 + (target.y - closestY) ** 2;
      return distSq < target.radius ** 2;
    };

    // Update Loop
    const update = () => {
      if (!gameActive) return;

      frameRef.current++;
      difficultyRef.current = 1 + Math.floor(scoreRef.current / 100) * 0.1;

      // Slow motion factor
      let timeScale = 1;
      if (freezeTimerRef.current > 0) {
        timeScale = 0.4; // Slow down to 40% speed
        freezeTimerRef.current--;
      }

      // 1. Blade Update (not affected by timeScale)
      for (let i = bladeRef.current.length - 1; i >= 0; i--) {
        bladeRef.current[i].life--;
        if (bladeRef.current[i].life <= 0) bladeRef.current.splice(i, 1);
      }

      // 2. Combo Logic Reset
      if (frameRef.current - lastSliceTimeRef.current > COMBO_WINDOW) {
        comboCountRef.current = 0;
      }
      if (backgroundFlashRef.current > 0) backgroundFlashRef.current--;

      // 3. Spawner (Spawn rate affected by timeScale slightly, but keep gameplay flowing)
      const spawnRate = Math.max(20, 60 - Math.floor(scoreRef.current / 20));
      if (frameRef.current % Math.floor(spawnRate / (timeScale > 0.5 ? 1 : 0.5)) === 0) {
        spawnTarget();
      }

      // 4. Update Targets
      for (let i = targetsRef.current.length - 1; i >= 0; i--) {
        const t = targetsRef.current[i];
        
        t.x += t.vx * timeScale;
        t.y += t.vy * timeScale;
        t.vy += GRAVITY * timeScale;
        t.rotation += t.rotationSpeed * timeScale;

        // Missed fruit
        if (t.y > canvas.height + t.radius + 10) {
          if (t.type === EntityType.FRUIT && !t.isSliced) {
             livesRef.current--;
             onScoreUpdate(scoreRef.current, livesRef.current);
             if (livesRef.current <= 0) {
               onGameOver(scoreRef.current);
               return; 
             }
          }
          targetsRef.current.splice(i, 1);
          continue;
        }

        // Collision
        if (bladeRef.current.length >= 2) {
          const segmentsToCheck = Math.min(bladeRef.current.length - 1, 5); 
          let sliced = false;
          
          for (let j = 0; j < segmentsToCheck; j++) {
            const p1 = bladeRef.current[bladeRef.current.length - 1 - j];
            const p2 = bladeRef.current[bladeRef.current.length - 2 - j];
            if (checkCollision(p1, p2, t)) {
              sliced = true;
              break;
            }
          }

          if (sliced) {
            t.isSliced = true;
            if (t.type === EntityType.BOMB) {
              audioService.playExplosion();
              onGameOver(scoreRef.current);
              return;
            } else {
              // Combo handling
              lastSliceTimeRef.current = frameRef.current;
              comboCountRef.current++;
              
              let points = 10;
              let isCrit = false;

              // Special Effects
              if (t.fruitType === FruitType.GOLDEN) {
                points = 50;
                backgroundFlashRef.current = 10; // Gold flash
              } else if (t.fruitType === FruitType.ICE) {
                freezeTimerRef.current = 180; // 3 seconds (60fps * 3)
                audioService.playFreeze();
                backgroundFlashRef.current = 20; // Ice flash
              }

              // Apply Combo Multiplier
              if (comboCountRef.current > 1) {
                points += (comboCountRef.current * 5); // Bonus per combo
                isCrit = true;
                backgroundFlashRef.current = 5; // Small flash for combo
                audioService.playCombo(comboCountRef.current);
                
                // Show combo text
                textsRef.current.push({
                  x: t.x,
                  y: t.y - 50,
                  text: `${comboCountRef.current} COMBO!`,
                  life: 40,
                  color: '#FFD700',
                  size: 24 + comboCountRef.current * 2
                });
              } else {
                 audioService.playSlice();
              }

              scoreRef.current += points;
              onScoreUpdate(scoreRef.current, livesRef.current);
              
              const style = FRUIT_STYLES[t.fruitType];
              createParticles(t.x, t.y, style.flesh);
              createSlices(t);
              
              // Score Text
              textsRef.current.push({
                x: t.x,
                y: t.y,
                text: `+${points}`,
                life: 30,
                color: '#FFF',
                size: isCrit ? 30 : 20
              });

              targetsRef.current.splice(i, 1);
            }
          }
        }
      }

      // 5. Update Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx * timeScale;
        p.y += p.vy * timeScale;
        p.vy += GRAVITY * 0.5 * timeScale;
        p.life--;
        if (p.life <= 0) particlesRef.current.splice(i, 1);
      }

      // 6. Update Slices
      for (let i = slicesRef.current.length - 1; i >= 0; i--) {
        const s = slicesRef.current[i];
        s.x += s.vx * timeScale;
        s.y += s.vy * timeScale;
        s.vy += GRAVITY * timeScale;
        s.rotation += s.rotationSpeed * timeScale;
        s.life--;
        if (s.y > canvas.height + 100) slicesRef.current.splice(i, 1);
      }

      // 7. Update Floating Text
      for (let i = textsRef.current.length - 1; i >= 0; i--) {
        const txt = textsRef.current[i];
        txt.y -= 1; // Float up
        txt.life--;
        if (txt.life <= 0) textsRef.current.splice(i, 1);
      }
    };

    const draw = () => {
      // Background handling with Flash effect
      let bgColor = '#222';
      if (backgroundFlashRef.current > 0) {
        if (freezeTimerRef.current > 0) bgColor = '#003344'; // Ice tint
        else if (comboCountRef.current > 4) bgColor = '#441111'; // High combo frenzy
        else bgColor = '#333'; // Slight light
      }
      
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Freeze Effect Overlay
      if (freezeTimerRef.current > 0) {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw Targets (Back to front)
      targetsRef.current.forEach(t => {
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.rotation);
        
        if (t.type === EntityType.BOMB) {
          // Bomb Render
          ctx.beginPath();
          ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#111';
          ctx.fill();
          ctx.strokeStyle = '#F00';
          ctx.lineWidth = 3;
          ctx.stroke();
          // Draw X
          ctx.beginPath();
          ctx.moveTo(-t.radius/2, -t.radius/2);
          ctx.lineTo(t.radius/2, t.radius/2);
          ctx.moveTo(t.radius/2, -t.radius/2);
          ctx.lineTo(-t.radius/2, t.radius/2);
          ctx.strokeStyle = '#F00';
          ctx.stroke();
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#F00';
        } else {
          // Fruit Render
          drawFruit(ctx, t.radius, t.fruitType);
        }
        ctx.restore();
      });

      // Draw Slices
      slicesRef.current.forEach(s => {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        
        // Draw Half Fruit
        const style = FRUIT_STYLES[s.fruitType];
        ctx.beginPath();
        ctx.arc(0, 0, s.radius, s.startAngle, s.endAngle);
        ctx.lineTo(0, 0); // Close shape to center
        ctx.fillStyle = style.skin;
        ctx.fill();
        
        // Inner flesh
        ctx.beginPath();
        ctx.arc(0, 0, s.radius - 4, s.startAngle, s.endAngle);
        ctx.lineTo(0, 0);
        ctx.fillStyle = style.flesh;
        ctx.fill();

        ctx.restore();
      });

      // Draw Particles
      particlesRef.current.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw Floating Text
      textsRef.current.forEach(txt => {
        ctx.font = `bold ${txt.size}px Arial`;
        ctx.fillStyle = txt.color;
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.globalAlpha = Math.min(1, txt.life / 10);
        ctx.strokeText(txt.text, txt.x, txt.y);
        ctx.fillText(txt.text, txt.x, txt.y);
        ctx.globalAlpha = 1;
      });

      // Draw Blade
      if (bladeRef.current.length > 1) {
        ctx.beginPath();
        ctx.moveTo(bladeRef.current[0].x, bladeRef.current[0].y);
        for (let i = 1; i < bladeRef.current.length; i++) {
          const p = bladeRef.current[i];
          ctx.lineTo(p.x, p.y);
        }
        
        // Blade color changes based on Special State
        if (freezeTimerRef.current > 0) {
            ctx.strokeStyle = '#00FFFF';
            ctx.shadowColor = '#00FFFF';
        } else if (comboCountRef.current > 3) {
            ctx.strokeStyle = '#FFD700'; // Gold blade for high combo
            ctx.shadowColor = '#FFD700';
        } else {
            ctx.strokeStyle = '#FFF';
            ctx.shadowColor = '#0FF';
        }
        
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 15;
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
        ctx.stroke();
      }
    };

    const loop = () => {
      update();
      draw();
      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [gameActive, onGameOver, onScoreUpdate]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 cursor-none" />;
};