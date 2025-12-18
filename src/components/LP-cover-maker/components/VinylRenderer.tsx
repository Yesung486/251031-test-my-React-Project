import React, { useState, useRef, useEffect } from 'react';
import { StudioState } from '../types';

interface Props {
  state: StudioState;
  updateState: (updates: Partial<StudioState>) => void;
  updateStickerPos: (id: string, x: number, y: number) => void;
  removeSticker: (id: string) => void;
}

const VinylRenderer: React.FC<Props> = ({ state, updateState, updateStickerPos, removeSticker }) => {
  const { isEjected, isSpinning, coverImage, vinylColor, vinylOpacity, labelImage, vinylDesignImage, labelColor, stickers, textPositions, artistName, albumTitle, fontFamily, vinylText } = state;
  
  // 스티커 드래그 관련 상태
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const sleeveRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // ★ 회전 애니메이션을 위한 상태 추가
  const [rotation, setRotation] = useState(0);
  const requestRef = useRef<number>();

  // ★ 회전 로직: isSpinning이 true일 때만 각도를 계속 증가시킴
  useEffect(() => {
    const animate = () => {
      setRotation(prev => (prev + 1) % 360); // 속도를 조절하려면 +1을 +0.5(느림) or +2(빠름)로 변경
      requestRef.current = requestAnimationFrame(animate);
    };

    if (isSpinning) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isSpinning]);

  // 스티커 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent, id: string, initialX: number, initialY: number) => {
    e.stopPropagation();
    setDraggingId(id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingId && sleeveRef.current) {
        const sleeveRect = sleeveRef.current.getBoundingClientRect();
        const newX = e.clientX - sleeveRect.left - dragOffset.current.x;
        const newY = e.clientY - sleeveRect.top - dragOffset.current.y;
        
        // Boundary check
        const x = Math.max(0, Math.min(newX, 450));
        const y = Math.max(0, Math.min(newY, 450));
        
        updateStickerPos(draggingId, x, y);
      }
    };

    const handleMouseUp = () => {
      setDraggingId(null);
    };

    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, updateStickerPos]);

  return (
    <div className="relative w-[500px] h-[500px] select-none">
      {/* Vinyl Disc Container (위치 이동 담당) */}
      <div 
        className={`absolute top-2 left-0 w-[480px] h-[480px] rounded-full transition-all duration-700 ease-in-out shadow-2xl z-0
          ${isEjected ? 'translate-x-[240px]' : 'translate-x-4'}
        `}
      >
        {/* Inner Rotating Part (회전 담당) */}
        {/* 기존 animate-spin-slow 클래스를 제거하고 style에 transform을 직접 적용했습니다. */}
        <div 
             className="w-full h-full rounded-full overflow-hidden relative"
             style={{ 
               backgroundColor: vinylColor, 
               opacity: vinylOpacity,
               transform: `rotate(${rotation}deg)` // ★ 여기서 회전 적용!
             }}
        >
            
            {/* Full Disc Design (Picture Disc / Uploaded Image) */}
            {vinylDesignImage && (
              <img 
                src={vinylDesignImage} 
                className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-90" 
                alt="Vinyl Design" 
              />
            )}

            {/* Grooves & Shine Overlay */}
            <div className="absolute inset-0 rounded-full vinyl-grooves opacity-60 z-10 pointer-events-none"></div>
            
            {/* Vinyl Text */}
            <div 
              className="absolute z-15 text-center w-full pointer-events-none px-12"
              style={{ top: '70%', fontFamily, transform: 'translateY(-50%)' }}
            >
              <span className="text-xl font-bold tracking-tighter uppercase mix-blend-difference text-white/80 line-clamp-2">
                {vinylText}
              </span>
            </div>

            {/* Center Label */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full overflow-hidden shadow-inner border-[1px] border-black/20 z-20"
              style={{ backgroundColor: labelColor }}
            >
              {labelImage && <img src={labelImage} className="w-full h-full object-cover" alt="Label" />}
              {/* Hole */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#111] rounded-full shadow-inner z-30"></div>
            </div>
        </div>
      </div>

      {/* Sleeve (Cover) */}
      <div ref={sleeveRef} className="absolute inset-0 w-[500px] h-[500px] bg-[#1a1a1a] shadow-2xl overflow-hidden z-10 border border-white/5">
        {coverImage && (
          <img src={coverImage} className="w-full h-full object-cover opacity-90" alt="Cover" />
        )}
        
        <div className="grain-overlay"></div>

        {/* Text Elements */}
        <div 
          className="absolute cursor-default pointer-events-none"
          style={{ left: textPositions.artist.x, top: textPositions.artist.y, fontFamily }}
        >
          <span className="text-2xl font-bold tracking-tighter uppercase mix-blend-difference text-white">
            {artistName}
          </span>
        </div>

        <div 
          className="absolute cursor-default pointer-events-none"
          style={{ left: textPositions.title.x, top: textPositions.title.y, fontFamily }}
        >
          <span className="text-4xl font-black italic tracking-widest uppercase mix-blend-difference text-white">
            {albumTitle}
          </span>
        </div>

        {/* Stickers */}
        {stickers.map((s) => (
          <div 
            key={s.id}
            className={`absolute cursor-move select-none group/stk active:scale-105 transition-transform ${draggingId === s.id ? 'z-[100]' : 'z-50'}`}
            style={{ left: s.x, top: s.y }}
            onMouseDown={(e) => handleMouseDown(e, s.id, s.x, s.y)}
          >
            {s.type === 'parental' && (
              <div className="bg-white text-black px-2 py-1 font-bold text-[10px] leading-tight border border-black uppercase shadow-lg">
                Parental Advisory<br/><span className="text-[12px]">Explicit Content</span>
              </div>
            )}
            {s.type === 'barcode' && (
                <div className="bg-white/90 p-1 flex flex-col items-center shadow-lg">
                    <div className="flex gap-[1px]">
                        {[1,2,1,3,1,1,2,4,1].map((w,i) => <div key={i} className="bg-black h-8" style={{ width: w }}></div>)}
                    </div>
                    <span className="text-[8px] text-black font-mono">8 10023 44021 2</span>
                </div>
            )}
            {s.type === 'hologram' && (
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 via-purple-400 to-yellow-400 opacity-80 animate-pulse shadow-xl border border-white/20"></div>
            )}
            
            {/* Delete button on hover */}
            <button 
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => removeSticker(s.id)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/stk:opacity-100 transition-opacity shadow-lg"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        ))}
      </div>
      
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/50 to-transparent z-20 pointer-events-none"></div>
    </div>
  );
};

export default VinylRenderer;