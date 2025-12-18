
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SimpleNoise } from './utils/noise';
import { audioService } from './services/audioService';

class Particle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  velX: number;
  velY: number;
  accX: number;
  accY: number;
  maxSpeed: number;
  color: string = '';

  constructor(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.prevX = this.x;
    this.prevY = this.y;
    this.velX = 0;
    this.velY = 0;
    this.accX = 0;
    this.accY = 0;
    this.maxSpeed = 1.5 + Math.random() * 2;
  }

  update(noise: SimpleNoise, mouseX: number, mouseY: number, isRepel: boolean) {
    this.prevX = this.x;
    this.prevY = this.y;

    // Flow field force
    const zoom = 0.005;
    const angle = noise.noise2D(this.x * zoom, this.y * zoom) * Math.PI * 2 * 4;
    this.accX = Math.cos(angle) * 0.1;
    this.accY = Math.sin(angle) * 0.1;

    // Mouse Interaction
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 150) {
      const force = (150 - dist) / 150;
      const angleMouse = Math.atan2(dy, dx);
      const mForce = isRepel ? force * 0.5 : -force * 0.5;
      this.accX += Math.cos(angleMouse) * mForce;
      this.accY += Math.sin(angleMouse) * mForce;
    }

    this.velX += this.accX;
    this.velY += this.accY;

    // Speed limit
    const speed = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
    if (speed > this.maxSpeed) {
      this.velX = (this.velX / speed) * this.maxSpeed;
      this.velY = (this.velY / speed) * this.maxSpeed;
    }

    this.x += this.velX;
    this.y += this.velY;

    // Boundary check
    if (this.x < 0 || this.x > window.innerWidth || this.y < 0 || this.y > window.innerHeight) {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.prevX = this.x;
      this.prevY = this.y;
      this.velX = 0;
      this.velY = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D, colorShift: number) {
    const speed = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
    const hue = (200 + speed * 20 + colorShift) % 360; // Shift between Blue, Purple, Pink
    ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.5)`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(this.prevX, this.prevY);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();
  }
}

const Art: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const noise = useRef(new SimpleNoise());
  const mouse = useRef({ x: -1000, y: -1000 });
  const [colorShift, setColorShift] = useState(0);
  const [started, setStarted] = useState(false);

  const initParticles = useCallback((w: number, h: number) => {
    const p: Particle[] = [];
    for (let i = 0; i < 3000; i++) {
      p.push(new Particle(w, h));
    }
    particles.current = p;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    window.addEventListener('resize', resize);
    resize();

    let animationId: number;
    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p) => {
        p.update(noise.current, mouse.current.x, mouse.current.y, false);
        p.draw(ctx, colorShift);
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [initParticles, colorShift]);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouse.current = { x: e.clientX, y: e.clientY };
    if (started) {
      audioService.updateModulation(e.clientX, window.innerWidth);
    }
  };

  const handleClick = () => {
    if (!started) {
      audioService.init();
      audioService.startAmbient();
      setStarted(true);
    }
    setColorShift((prev) => prev + 60);
    noise.current = new SimpleNoise();
    audioService.playInteraction(220 + Math.random() * 440);
  };

  return (
    <div 
      className="relative w-full h-screen bg-black cursor-none select-none overflow-hidden"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full"
      />
      
      {!started && (
        <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm animate-pulse">
          Click to start the experience
        </div>
      )}
    </div>
  );
};

export default Art;
