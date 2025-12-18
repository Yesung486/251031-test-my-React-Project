
import { ParticleSettings } from '../types';

export class Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number = 0;
  vy: number = 0;
  size: number;
  color: string;

  constructor(x: number, y: number, size: number, color: string) {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.originX = x;
    this.originY = y;
    this.size = size;
    this.color = color;
  }

  update(mouseX: number, mouseY: number, settings: ParticleSettings) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Repulsion
    if (distance < settings.repulsionRadius) {
      const force = (settings.repulsionRadius - distance) / settings.repulsionRadius;
      const angle = Math.atan2(dy, dx);
      // More explosive feel for specific settings
      const multiplier = settings.friction < 0.9 ? 15 : 8; 
      this.vx -= Math.cos(angle) * force * multiplier;
      this.vy -= Math.sin(angle) * force * multiplier;
    }

    // Return to origin
    const dOriginX = this.originX - this.x;
    const dOriginY = this.originY - this.y;
    
    this.vx += dOriginX * settings.returnSpeed;
    this.vy += dOriginY * settings.returnSpeed;

    // Friction
    this.vx *= settings.friction;
    this.vy *= settings.friction;

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
