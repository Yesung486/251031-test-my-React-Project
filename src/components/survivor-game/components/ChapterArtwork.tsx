import React, { useRef, useEffect } from 'react';

interface ChapterArtworkProps {
  chapterId: number;
}

const ChapterArtwork: React.FC<ChapterArtworkProps> = ({ chapterId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const W = canvas.width;
    const H = canvas.height;

    const drawChapter1 = (ctx: CanvasRenderingContext2D, W: number, H: number, time: number) => {
        // City Outskirts
        ctx.fillStyle = '#0f172a'; // Dark blue night sky
        ctx.fillRect(0, 0, W, H);

        // Stars
        ctx.fillStyle = 'white';
        for(let i=0; i<50; i++) {
            const x = (Math.random() * W * 2 + time * 0.01) % W;
            const y = Math.random() * H * 0.6;
            const size = Math.random() * 1.5;
            ctx.globalAlpha = Math.random();
            ctx.fillRect(x, y, size, size);
        }
        ctx.globalAlpha = 1;

        // Road
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.lineTo(W * 0.2, H * 0.7);
        ctx.lineTo(W * 0.8, H * 0.7);
        ctx.lineTo(W, H);
        ctx.fill();
        
        // Road lines
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.setLineDash([20, 25]);
        ctx.beginPath();
        ctx.moveTo(W * 0.5, H);
        ctx.lineTo(W * 0.5, H * 0.7);
        ctx.stroke();
        ctx.setLineDash([]);

        // Buildings
        const buildings = [
            {x: 0.05, h: 0.6, w: 0.15, c: '#1e293b'},
            {x: 0.2, h: 0.4, w: 0.2, c: '#334155'},
            {x: 0.6, h: 0.5, w: 0.1, c: '#1e293b'},
            {x: 0.75, h: 0.7, w: 0.2, c: '#334155'},
        ];

        buildings.forEach(b => {
            ctx.fillStyle = b.c;
            ctx.fillRect(W * b.x, H * 0.7 - H * b.h, W * b.w, H * b.h);
            // Windows
            ctx.fillStyle = '#f59e0b';
            for (let y = H * 0.7 - H * b.h + 10; y < H * 0.7 - 10; y += 15) {
                for (let x = W * b.x + 10; x < W * b.x + W * b.w - 10; x += 15) {
                    if (Math.random() > 0.6) ctx.fillRect(x, y, 5, 5);
                }
            }
        });
    };

    const drawChapter2 = (ctx: CanvasRenderingContext2D, W: number, H: number, time: number) => {
        // Rusty Factory
        ctx.fillStyle = '#2a1a1a';
        ctx.fillRect(0, 0, W, H);
        
        // Ground
        ctx.fillStyle = '#4f2a2a';
        ctx.fillRect(0, H * 0.8, W, H * 0.2);

        // Factory silhouette
        ctx.fillStyle = '#1a0f0f';
        ctx.beginPath();
        ctx.moveTo(W * 0.1, H * 0.8);
        ctx.lineTo(W * 0.1, H * 0.3);
        ctx.lineTo(W * 0.3, H * 0.3);
        ctx.lineTo(W * 0.35, H * 0.1); // Smokestack
        ctx.lineTo(W * 0.4, H * 0.1);
        ctx.lineTo(W * 0.45, H * 0.3);
        ctx.lineTo(W * 0.7, H * 0.3);
        ctx.lineTo(W * 0.7, H * 0.8);
        ctx.fill();

        // Smoke
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        const smokeX = W * 0.375;
        for (let i = 0; i < 5; i++) {
            const smokeY = H * 0.1 - (time * 0.1 + i * 20) % 100;
            const smokeSize = 10 + (time * 0.1 + i * 20) % 100 * 0.2;
            ctx.beginPath();
            ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Gears
        ctx.fillStyle = '#3a2a2a';
        const drawGear = (x:number, y:number, radius:number, teeth:number) => {
            ctx.beginPath();
            const step = Math.PI * 2 / (teeth * 2);
            for(let i=0; i < teeth*2; i++) {
                const r = i % 2 === 0 ? radius : radius * 0.8;
                const angle = i * step + time * 0.005;
                ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
            }
            ctx.closePath();
            ctx.fill();
        }
        drawGear(W * 0.8, H * 0.6, 40, 8);
        drawGear(W * 0.9, H * 0.85, 30, 6);
    };

    const drawChapter3 = (ctx: CanvasRenderingContext2D, W: number, H: number, time: number) => {
        // Crystal Cave
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, W, H);
        
        const crystals = [
            { x: 0.2, y: 0.8, s: 80, c: '#4a4ae6' },
            { x: 0.8, y: 0.7, s: 100, c: '#a262e6' },
            { x: 0.5, y: 0.9, s: 50, c: '#62e6e6' },
            { x: 0.3, y: 0.3, s: 40, c: '#e662e6' },
        ];

        const drawCrystal = (x:number, y:number, size:number, color:string, t:number) => {
            ctx.save();
            ctx.translate(x, y);
            
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.5 + Math.sin(t * 0.002 + x) * 0.2;
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;

            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size/2, 0);
            ctx.lineTo(0, size);
            ctx.lineTo(-size/2, 0);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            ctx.restore();
        }
        
        crystals.forEach(c => {
            drawCrystal(W * c.x, H * c.y, c.s, c.c, time);
        });
    };
    
    const drawChapter4 = (ctx: CanvasRenderingContext2D, W: number, H: number, time: number) => {
        // Abyssal Fissure
        ctx.fillStyle = '#0c0c0d';
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#d8b4fe';
        ctx.shadowBlur = 15;

        const drawLightning = (x: number, y: number, length: number) => {
             ctx.beginPath();
             ctx.moveTo(x, y);
             let currentY = y;
             while(currentY < y + length) {
                 const nextY = currentY + Math.random() * 20 + 5;
                 const nextX = x + (Math.random() - 0.5) * 30;
                 ctx.lineTo(nextX, nextY);
                 currentY = nextY;
                 x = nextX;
             }
             ctx.stroke();
        }
        
        if (Math.random() > 0.95) {
             drawLightning(Math.random() * W, 0, H);
        }

        // Particles
        ctx.fillStyle = '#d8b4fe';
        ctx.shadowBlur = 0;
        for(let i=0; i<10; i++) {
             const x = Math.random() * W;
             const y = (H - (time * 0.2 + i * 50) % H);
             ctx.globalAlpha = Math.random() * 0.5;
             ctx.fillRect(x, y, 2, 2);
        }
        ctx.globalAlpha = 1;

    };

    let frameCount = 0;
    const render = () => {
        frameCount++;
        
        ctx.clearRect(0, 0, W, H);
        
        switch (chapterId) {
            case 1: drawChapter1(ctx, W, H, frameCount); break;
            case 2: drawChapter2(ctx, W, H, frameCount); break;
            case 3: drawChapter3(ctx, W, H, frameCount); break;
            case 4: drawChapter4(ctx, W, H, frameCount); break;
            default: drawChapter1(ctx, W, H, frameCount); break; // Fallback
        }
        
        animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [chapterId]);

  return <canvas ref={canvasRef} width={500} height={300} className="max-w-full max-h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]" />;
};

export default ChapterArtwork;
