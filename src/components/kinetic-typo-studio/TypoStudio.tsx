import React, { useRef, useEffect, useState, useCallback } from 'react';
import ControlPanel from './components/ControlPanel';
import { ParticleSettings, PresetType } from './types';
import { Particle } from './services/physics';
import { audioService } from './services/audioService';

const TypoStudio: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const animationFrameId = useRef<number>();

  const [settings, setSettings] = useState<ParticleSettings>({
    text: "HELLO",
    particleSize: 2.5,
    repulsionRadius: 120,
    returnSpeed: 0.1,
    color: "#FFFFFF",
    density: 4,
    friction: 0.95
  });

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 캔버스 크기가 너무 작으면 초기화 스킵
    if (canvas.width === 0 || canvas.height === 0) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    particles.current = [];

    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;

    // 폰트 크기: 화면 꽉 차게 하되 여백 고려 (0.6 배율)
    const fontSize = Math.min(canvas.width / (settings.text.length || 1), canvas.height * 0.6);
    
    offCtx.fillStyle = '#ffffff';
    offCtx.font = `900 ${fontSize}px Inter, -apple-system, sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    
    offCtx.fillText(settings.text.toUpperCase(), offCanvas.width / 2, offCanvas.height / 2);

    const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height).data;

    const gap = settings.density;
    for (let y = 0; y < offCanvas.height; y += gap) {
      for (let x = 0; x < offCanvas.width; x += gap) {
        const index = (y * offCanvas.width + x) * 4;
        const opacity = imageData[index + 3];

        if (opacity > 128) {
          particles.current.push(new Particle(x, y, settings.particleSize, settings.color));
        }
      }
    }
  }, [settings.text, settings.density, settings.particleSize, settings.color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const handleResize = () => {
      // 부모 컨테이너 크기에 딱 맞춤
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      initParticles();
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.current.forEach(p => {
        p.update(mouse.current.x, mouse.current.y, settings);
        p.draw(ctx);
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      resizeObserver.disconnect();
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [initParticles, settings]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // [중요] 마우스 좌표 보정 로직은 그대로 유지 (이게 있어야 작동이 잘 됨)
    const rect = canvas.getBoundingClientRect();
    mouse.current.x = e.clientX - rect.left;
    mouse.current.y = e.clientY - rect.top;
    
    if (Math.random() > 0.98) {
      audioService.playInteractionSound(Math.random() * 200 + 400, 'sine', 0.05);
    }
  };

  const handleMouseLeave = () => {
    mouse.current.x = -1000;
    mouse.current.y = -1000;
  };

  const applyPreset = (preset: PresetType) => {
    audioService.playPresetChange();
    switch (preset) {
      case PresetType.LIQUID:
        setSettings(prev => ({ ...prev, particleSize: 4, repulsionRadius: 150, returnSpeed: 0.05, friction: 0.98, density: 6 }));
        break;
      case PresetType.EXPLOSIVE:
        setSettings(prev => ({ ...prev, particleSize: 3, repulsionRadius: 200, returnSpeed: 0.2, friction: 0.85, density: 4 }));
        break;
      case PresetType.SNOW:
        setSettings(prev => ({ ...prev, particleSize: 1.5, repulsionRadius: 80, returnSpeed: 0.08, friction: 0.96, density: 3 }));
        break;
    }
  };

  return (
    // 👇 [여기가 핵심 수정] 
    // h-full 대신 h-[calc(100vh-120px)]로 설정하여
    // 화면 전체 높이에서 헤더 높이만큼 뺀 공간을 강제로 차지하게 함
    <div 
      ref={containerRef} 
      className="w-full h-[calc(100vh-120px)] min-h-[500px] bg-black overflow-hidden select-none relative rounded-3xl shadow-2xl"
    >
      <canvas 
        ref={canvasRef} 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="block w-full h-full"
      />
      
      <ControlPanel 
        settings={settings}
        onSettingsChange={(updates) => setSettings(prev => ({ ...prev, ...updates }))}
        onPresetSelect={applyPreset}
      />

      <div className="fixed bottom-10 left-10 text-white/20 text-[10px] uppercase tracking-[0.3em] font-medium pointer-events-none z-0">
        Move mouse over the text
      </div>
    </div>
  );
};

export default TypoStudio;