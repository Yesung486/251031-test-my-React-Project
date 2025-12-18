
import React, { useState, useRef, useCallback } from 'react';
import { StudioState, FontType, Sticker } from './types';
import { audioService } from './services/AudioService';
import ControlPanel from './components/ControlPanel';
import VinylRenderer from './components/VinylRenderer';
import { GoogleGenAI } from "@google/genai";
import html2canvas from 'html2canvas';

const INITIAL_STATE: StudioState = {
  artistName: 'SZA',
  albumTitle: 'SOS',
  fontFamily: FontType.SERIF,
  coverImage: 'https://picsum.photos/id/10/800/800',
  vinylColor: '#1a1a1a',
  vinylOpacity: 1,
  labelImage: null,
  vinylDesignImage: null,
  labelColor: '#333333',
  vinylText: 'LIMITED EDITION',
  isEjected: true,
  isSpinning: false,
  isGenerating: false,
  stickers: [],
  textPositions: {
    artist: { x: 40, y: 40 },
    title: { x: 40, y: 80 },
    vinyl: { x: 240, y: 340 },
  },
};

const LPCoverMaker: React.FC = () => {
  const [state, setState] = useState<StudioState>(INITIAL_STATE);
  const [isExporting, setIsExporting] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const updateState = useCallback((updates: Partial<StudioState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleEject = () => {
    audioService.playSlide(!state.isEjected);
    updateState({ isEjected: !state.isEjected });
  };

  const toggleSpin = () => {
    audioService.playClick();
    updateState({ isSpinning: !state.isSpinning });
  };

  const addSticker = (type: Sticker['type']) => {
    audioService.playClick();
    const newSticker: Sticker = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 150,
      y: 150,
    };
    updateState({ stickers: [...state.stickers, newSticker] });
  };

  const updateStickerPos = (id: string, x: number, y: number) => {
    updateState({
      stickers: state.stickers.map(s => s.id === id ? { ...s, x, y } : s)
    });
  };

  const removeSticker = (id: string) => {
    audioService.playClick();
    updateState({
      stickers: state.stickers.filter(s => s.id !== id)
    });
  };

  const generateDiscDesign = async (prompt: string) => {
    if (!prompt) return;
    updateState({ isGenerating: true });
    audioService.playMagic();
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A circular artistic vinyl record pattern design, high quality, ${prompt}` }],
        },
      });

      let imageUrl = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
      
      if (imageUrl) {
        updateState({ vinylDesignImage: imageUrl });
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("Design generation failed. Please check your API key.");
    } finally {
      updateState({ isGenerating: false });
    }
  };

  const handleExport = async () => {
    if (!captureRef.current) return;
    setIsExporting(true);
    audioService.playClick();
    
    // Brief delay to ensure UI is settled (stop spinning for clean capture)
    const wasSpinning = state.isSpinning;
    if (wasSpinning) updateState({ isSpinning: false });

    try {
      // Create canvas from the renderer area
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#111',
        scale: 2, // High resolution
        useCORS: true, // Allow cross-origin images
        logging: false,
      });

      // Trigger download
      const link = document.createElement('a');
      link.download = `vinyl-studio-${state.albumTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      if (wasSpinning) updateState({ isSpinning: true });
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#111] overflow-hidden text-neutral-200">
      <aside className="w-full md:w-20 border-b md:border-b-0 md:border-r border-white/5 flex flex-col items-center py-8 z-50 bg-[#0a0a0a]">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black font-bold mb-12 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          VS
        </div>
        <nav className="flex flex-col gap-8 opacity-40">
            <button className="hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            </button>
            <button className="hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </button>
        </nav>
      </aside>

      <main className="flex-1 relative flex items-center justify-center p-4 md:p-12 overflow-hidden">
        {isExporting && (
          <div className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <span className="text-xs font-bold tracking-[0.5em] animate-pulse">EXPORTING STUDIO ART...</span>
          </div>
        )}

        <div className="absolute top-8 left-8 z-10">
          <h1 className="text-xs uppercase tracking-[0.3em] opacity-50 mb-1">Studio Preview</h1>
          <div className="text-xl font-light italic">"{state.albumTitle}"</div>
        </div>
        
        {/* We need a slightly larger area to capture the ejected disc properly */}
        <div ref={captureRef} className={`relative p-20 flex items-center justify-center transition-all duration-500 ${isExporting ? 'scale-100' : 'scale-75 lg:scale-100'}`}>
           {state.isGenerating && (
             <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full overflow-hidden">
               <div className="text-cyan-400 font-bold animate-pulse text-xl uppercase tracking-widest">Generating Disc...</div>
             </div>
           )}
           <VinylRenderer 
             state={state} 
             updateState={updateState} 
             updateStickerPos={updateStickerPos}
             removeSticker={removeSticker}
           />
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 glass px-6 py-3 rounded-full z-50 shadow-2xl border border-white/10">
            <button 
                onClick={toggleEject}
                className={`px-6 py-1.5 rounded-full text-xs font-bold tracking-widest transition-all ${state.isEjected ? 'bg-white text-black scale-105' : 'hover:bg-white/10 opacity-70'}`}
            >
                {state.isEjected ? 'EJECTED' : 'EJECT'}
            </button>
            <div className="w-[1px] h-4 bg-white/20"></div>
            <button 
                onClick={toggleSpin}
                className={`px-6 py-1.5 rounded-full text-xs font-bold tracking-widest transition-all ${state.isSpinning ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] scale-105' : 'hover:bg-white/10 opacity-70'}`}
            >
                {state.isSpinning ? 'SPINNING' : 'SPIN'}
            </button>
        </div>
      </main>

      <ControlPanel 
        state={state} 
        updateState={updateState} 
        addSticker={addSticker}
        onExport={handleExport}
        generateDiscDesign={generateDiscDesign}
        removeSticker={removeSticker}
        isExporting={isExporting}
      />
    </div>
  );
};

export default LPCoverMaker;
