import React, { useEffect, useRef, useState } from 'react';
import { Vector2 } from '../types';

interface JoystickProps {
  onMove: (vector: Vector2) => void;
  onStop: () => void;
}

const Joystick: React.FC<JoystickProps> = ({ onMove, onStop }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState<Vector2>({ x: 0, y: 0 });
  const [origin, setOrigin] = useState<Vector2 | null>(null);

  const radius = 50; // Max radius of joystick movement

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scroll
      const touch = e.touches[0];
      setOrigin({ x: touch.clientX, y: touch.clientY });
      setPosition({ x: 0, y: 0 });
      setActive(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!origin) return;

      const touch = e.touches[0];
      const dx = touch.clientX - origin.x;
      const dy = touch.clientY - origin.y;
      
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      // Clamp distance
      const clampedDistance = Math.min(distance, radius);
      
      const x = Math.cos(angle) * clampedDistance;
      const y = Math.sin(angle) * clampedDistance;

      setPosition({ x, y });

      // Normalize vector for output (0 to 1)
      onMove({
        x: x / radius,
        y: y / radius
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      setActive(false);
      setOrigin(null);
      setPosition({ x: 0, y: 0 });
      onStop();
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [origin, onMove, onStop]);

  return (
    <div 
      ref={containerRef}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full z-20 flex items-center justify-center pointer-events-auto touch-none"
      style={{
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)'
      }}
    >
      {/* Visual Indicator of Joystick Zone */}
      <div className={`w-32 h-32 rounded-full border-2 border-white/20 bg-black/20 transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-30'}`}>
        <div 
          ref={knobRef}
          className="w-12 h-12 bg-blue-500 rounded-full shadow-lg absolute top-1/2 left-1/2 -ml-6 -mt-6 pointer-events-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: active ? 'none' : 'transform 0.1s ease-out'
          }}
        />
      </div>
    </div>
  );
};

export default Joystick;