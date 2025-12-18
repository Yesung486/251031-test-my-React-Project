
import React, { useState } from 'react';
import { StudioState, FontType, Sticker } from '../types';
import { audioService } from '../services/AudioService';

interface Props {
  state: StudioState;
  updateState: (updates: Partial<StudioState>) => void;
  addSticker: (type: Sticker['type']) => void;
  onExport: () => void;
  generateDiscDesign: (prompt: string) => void;
  removeSticker: (id: string) => void;
  isExporting?: boolean;
}

const ControlPanel: React.FC<Props> = ({ state, updateState, addSticker, onExport, generateDiscDesign, removeSticker, isExporting }) => {
  const [aiPrompt, setAiPrompt] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImage' | 'labelImage' | 'vinylDesignImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateState({ [field]: url });
      audioService.playClick();
    }
  };

  const clearImage = (field: 'coverImage' | 'labelImage' | 'vinylDesignImage') => {
    audioService.playClick();
    updateState({ [field]: null });
  };

  return (
    <aside className="w-full md:w-80 border-l border-white/5 bg-[#0d0d0d] flex flex-col h-screen overflow-y-auto custom-scrollbar">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a] sticky top-0 z-50">
        <h2 className="text-xs font-bold tracking-widest uppercase text-neutral-500">Editor</h2>
        <button 
          onClick={onExport}
          disabled={isExporting}
          className={`bg-white text-black px-4 py-2 rounded text-[10px] font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2 ${isExporting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-200'}`}
        >
          {isExporting ? (
            <>
              <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              SAVING...
            </>
          ) : 'DOWNLOAD PNG'}
        </button>
      </div>

      <div className="p-6 space-y-10 pb-32">
        {/* Sleeve Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block">Sleeve Customization</label>
            {state.coverImage && (
              <button onClick={() => clearImage('coverImage')} className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase transition-colors">Clear Img</button>
            )}
          </div>
          <div className="space-y-2">
            <input 
              type="text" 
              placeholder="Artist Name"
              value={state.artistName}
              onChange={(e) => updateState({ artistName: e.target.value })}
              className="w-full bg-white/5 border border-white/10 p-2.5 text-sm focus:outline-none focus:border-white/30 transition-colors rounded"
            />
            <input 
              type="text" 
              placeholder="Album Title"
              value={state.albumTitle}
              onChange={(e) => updateState({ albumTitle: e.target.value })}
              className="w-full bg-white/5 border border-white/10 p-2.5 text-sm focus:outline-none focus:border-white/30 transition-colors rounded"
            />
          </div>
          <div className="flex gap-2">
            {[FontType.SERIF, FontType.SANS, FontType.DISPLAY].map(f => (
              <button 
                key={f}
                onClick={() => updateState({ fontFamily: f })}
                className={`flex-1 py-1.5 border text-[10px] uppercase transition-all rounded ${state.fontFamily === f ? 'border-white bg-white/10 text-white' : 'border-white/10 text-white/40 hover:text-white/60'}`}
              >
                {f.split(' ')[0]}
              </button>
            ))}
          </div>
          <div className="relative border-2 border-dashed border-white/10 p-5 text-center cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all group rounded group">
            <span className="text-[10px] text-white/40 group-hover:text-white/80 transition-colors uppercase font-bold">Upload Sleeve Image</span>
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'coverImage')} />
          </div>
        </section>

        {/* Disc Section */}
        <section className="space-y-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block">Disc Customization</label>
            {state.vinylDesignImage && (
              <button onClick={() => clearImage('vinylDesignImage')} className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase transition-colors">Clear Img</button>
            )}
          </div>
          
          <div className="space-y-2">
            <input 
              type="text" 
              placeholder="Vinyl Disc Text"
              value={state.vinylText}
              onChange={(e) => updateState({ vinylText: e.target.value })}
              className="w-full bg-white/5 border border-white/10 p-2.5 text-sm focus:outline-none focus:border-white/30 transition-colors rounded"
            />
            <div className="relative border border-white/10 p-3 text-center cursor-pointer hover:bg-white/5 transition-all rounded">
              <span className="text-[10px] text-white/40 uppercase font-bold">Upload Disc Image</span>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'vinylDesignImage')} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-white/60">Base Disc Color</span>
            <input 
              type="color" 
              value={state.vinylColor} 
              onChange={(e) => updateState({ vinylColor: e.target.value })}
              className="w-8 h-8 bg-transparent border-none cursor-pointer"
            />
          </div>

          <div className="space-y-1">
             <div className="flex justify-between items-center text-[10px] text-white/40 uppercase font-bold">
                <span>Opacity</span>
                <span>{Math.round(state.vinylOpacity * 100)}%</span>
             </div>
             <input 
                type="range" min="0.1" max="1" step="0.01" 
                value={state.vinylOpacity}
                onChange={(e) => updateState({ vinylOpacity: parseFloat(e.target.value) })}
                className="w-full accent-white opacity-40 hover:opacity-100 transition-opacity"
             />
          </div>

          <div className="relative border border-white/5 p-2 text-center cursor-pointer hover:bg-white/5 transition-colors rounded group flex justify-between items-center px-4">
            <span className="text-[9px] text-white/20 group-hover:text-white/40 uppercase font-bold">Label Img</span>
            <div className="flex gap-4 items-center">
              {state.labelImage && <button onClick={(e) => { e.stopPropagation(); clearImage('labelImage'); }} className="text-[9px] text-red-400/60 hover:text-red-400 font-bold uppercase">X</button>}
              <div className="relative">
                <span className="text-[9px] text-white/20 group-hover:text-white/40 uppercase">Upload</span>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'labelImage')} />
              </div>
            </div>
          </div>
        </section>

        {/* AI Magic Generator */}
        <section className="space-y-4 p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/></svg>
            <label className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">AI Magic Generator</label>
          </div>
          <div className="space-y-2">
            <textarea 
              placeholder="Describe vinyl disc art..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full bg-black/40 border border-white/10 p-2.5 text-xs focus:outline-none focus:border-cyan-400/50 transition-colors rounded min-h-[60px] text-cyan-100"
            />
            <button 
              onClick={() => generateDiscDesign(aiPrompt)}
              disabled={state.isGenerating || !aiPrompt}
              className={`w-full py-2.5 rounded text-[10px] font-bold transition-all shadow-lg ${state.isGenerating ? 'bg-cyan-900 text-cyan-500 cursor-not-allowed' : 'bg-cyan-500 text-black hover:bg-cyan-400 active:scale-95'}`}
            >
              {state.isGenerating ? 'CREATING ART...' : 'GENERATE AI DISC ART'}
            </button>
          </div>
        </section>

        {/* Asset Library (Stickers) */}
        <section className="space-y-4">
          <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold block">Asset Library</label>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => addSticker('parental')} className="glass p-2 text-[8px] flex flex-col items-center gap-1 hover:bg-white/10 transition-colors rounded">
              <div className="w-full h-8 bg-white text-black font-bold flex items-center justify-center text-[6px]">PARENTAL</div>
              STK-01
            </button>
            <button onClick={() => addSticker('barcode')} className="glass p-2 text-[8px] flex flex-col items-center gap-1 hover:bg-white/10 transition-colors rounded">
              <div className="w-full h-8 bg-white/20 flex flex-col items-center justify-center gap-[1px] p-1">
                 <div className="w-full h-[1px] bg-white"></div><div className="w-full h-[1px] bg-white"></div><div className="w-full h-[1px] bg-white"></div>
              </div>
              STK-02
            </button>
            <button onClick={() => addSticker('hologram')} className="glass p-2 text-[8px] flex flex-col items-center gap-1 hover:bg-white/10 transition-colors rounded">
              <div className="w-full h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full opacity-50 shadow-[0_0_10px_rgba(6,182,212,0.3)]"></div>
              STK-03
            </button>
          </div>
          
          {/* Active Stickers List */}
          {state.stickers.length > 0 && (
            <div className="space-y-1.5 mt-4">
              <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold">Active Assets</p>
              {state.stickers.map((s, i) => (
                <div key={s.id} className="flex justify-between items-center glass px-3 py-1.5 rounded text-[10px] text-white/40">
                  <span>{s.type.toUpperCase()} #{i+1}</span>
                  <button onClick={() => removeSticker(s.id)} className="text-red-400/60 hover:text-red-400 transition-colors">REMOVE</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="mt-auto p-6 bg-[#0a0a0a] border-t border-white/5">
        <p className="text-[9px] text-white/20 italic text-center">Vinyl Studio 1.0.7 • UI/UX Optimized</p>
      </div>
    </aside>
  );
};

export default ControlPanel;
