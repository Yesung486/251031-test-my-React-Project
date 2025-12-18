import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Vector2 } from '../types';

interface JoystickProps {
  onMove: (vector: Vector2) => void;
  onStop: () => void;
}

const Joystick: React.FC<JoystickProps> = ({ onMove, onStop }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  
  // 상태 대신 Ref를 사용하여 렌더링 없이 값을 즉시 참조 (성능 최적화)
  const startPosRef = useRef({ x: 0, y: 0 });
  const movePosRef = useRef({ x: 0, y: 0 });
  const activeRef = useRef(false);
  const animationFrameRef = useRef<number>(0);

  const radius = 50; // 조이스틱 반지름

  // 터치 시작
  const handleTouchStart = useCallback((e: React.TouchEvent | TouchEvent) => {
    // e.preventDefault(); // 일부 브라우저 경고 방지를 위해 제거하거나 passive 설정 필요
    const touch = (e as any).touches[0];
    
    // 현재 컨테이너의 중심점을 기준으로 잡음 (고정형 조이스틱)
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        startPosRef.current = { x: centerX, y: centerY };
        activeRef.current = true;
        setActive(true);
        
        // 터치 시작하자마자 움직임 계산
        updateJoystick(touch.clientX, touch.clientY);
    }
  }, []);

  // 조이스틱 움직임 계산 로직
  const updateJoystick = (clientX: number, clientY: number) => {
      if (!activeRef.current) return;

      const dx = clientX - startPosRef.current.x;
      const dy = clientY - startPosRef.current.y;
      
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      // 반지름 안으로 제한
      const clampedDist = Math.min(distance, radius);
      
      const x = Math.cos(angle) * clampedDist;
      const y = Math.sin(angle) * clampedDist;

      movePosRef.current = { x, y };
      setPosition({ x, y });

      // 정규화된 벡터 (0 ~ 1 사이 값) 전달
      onMove({
          x: x / radius,
          y: y / radius
      });
  };

  // 윈도우 전체에서 터치 이동 감지 (조이스틱 밖으로 나가도 끊기지 않게)
  useEffect(() => {
      const handleWindowTouchMove = (e: TouchEvent) => {
          if (!activeRef.current) return;
          // e.preventDefault(); // 스크롤 방지
          const touch = e.touches[0];
          updateJoystick(touch.clientX, touch.clientY);
      };

      const handleWindowTouchEnd = () => {
          if (!activeRef.current) return;
          activeRef.current = false;
          setActive(false);
          setPosition({ x: 0, y: 0 });
          onStop();
      };

      // 마우스 이벤트 (PC 테스트용)
      const handleWindowMouseMove = (e: MouseEvent) => {
          if (!activeRef.current) return;
          updateJoystick(e.clientX, e.clientY);
      };

      const handleWindowMouseUp = () => {
          if (!activeRef.current) return;
          activeRef.current = false;
          setActive(false);
          setPosition({ x: 0, y: 0 });
          onStop();
      };

      window.addEventListener('touchmove', handleWindowTouchMove, { passive: false });
      window.addEventListener('touchend', handleWindowTouchEnd);
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);

      return () => {
          window.removeEventListener('touchmove', handleWindowTouchMove);
          window.removeEventListener('touchend', handleWindowTouchEnd);
          window.removeEventListener('mousemove', handleWindowMouseMove);
          window.removeEventListener('mouseup', handleWindowMouseUp);
      };
  }, [onMove, onStop]);

  // PC 마우스 다운 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
      if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          startPosRef.current = { x: centerX, y: centerY };
          activeRef.current = true;
          setActive(true);
          updateJoystick(e.clientX, e.clientY);
      }
  };

  return (
    <div 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onMouseDown={handleMouseDown}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full z-50 flex items-center justify-center pointer-events-auto touch-none select-none"
      style={{
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        touchAction: 'none' // 중요: 브라우저 기본 제스처 방지
      }}
    >
      {/* 조이스틱 배경 원 */}
      <div className={`w-32 h-32 rounded-full border-4 border-white/30 bg-black/40 backdrop-blur-sm transition-all duration-200 ${active ? 'opacity-100 scale-105 border-white/50' : 'opacity-50'}`}>
        {/* 움직이는 노브 (Knob) */}
        <div 
          className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] absolute top-1/2 left-1/2 -ml-7 -mt-7 pointer-events-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: active ? 'none' : 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)' // 놓았을 때 팅~ 하고 돌아오는 효과
          }}
        >
            {/* 노브 안의 장식 */}
            <div className="absolute top-2 left-2 w-4 h-4 bg-white/30 rounded-full blur-[1px]"></div>
        </div>
      </div>
    </div>
  );
};

export default Joystick;