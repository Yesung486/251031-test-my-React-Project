
import React, { useState } from 'react';
import { ParticleSettings, PresetType } from '../types';

interface ControlPanelProps {
  settings: ParticleSettings;
  onSettingsChange: (newSettings: Partial<ParticleSettings>) => void;
  onPresetSelect: (preset: PresetType) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ settings, onSettingsChange, onPresetSelect }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`fixed top-6 right-6 z-50 transition-all duration-300 ${isOpen ? 'w-80' : 'w-12 h-12 overflow-hidden'}`}>
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 text-white overflow-hidden relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>

        {isOpen && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight mb-4">Studio Controls</h2>
            
            <div className="flex gap-2">
              <button onClick={() => onPresetSelect(PresetType.LIQUID)} className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-all active:scale-95">Liquid</button>
              <button onClick={() => onPresetSelect(PresetType.EXPLOSIVE)} className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-all active:scale-95">Explosive</button>
              <button onClick={() => onPresetSelect(PresetType.SNOW)} className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-all active:scale-95">Snow</button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Text Content</label>
                <input 
                  type="text" 
                  value={settings.text}
                  onChange={(e) => onSettingsChange({ text: e.target.value })}
                  className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Particle Size</label>
                  <span className="text-xs text-white/80">{settings.particleSize}px</span>
                </div>
                <input 
                  type="range" min="1" max="10" step="0.5"
                  value={settings.particleSize}
                  onChange={(e) => onSettingsChange({ particleSize: parseFloat(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Repulsion Radius</label>
                  <span className="text-xs text-white/80">{settings.repulsionRadius}</span>
                </div>
                <input 
                  type="range" min="50" max="300"
                  value={settings.repulsionRadius}
                  onChange={(e) => onSettingsChange({ repulsionRadius: parseInt(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Return Speed</label>
                  <span className="text-xs text-white/80">{(settings.returnSpeed * 100).toFixed(1)}%</span>
                </div>
                <input 
                  type="range" min="0.01" max="0.5" step="0.01"
                  value={settings.returnSpeed}
                  onChange={(e) => onSettingsChange({ returnSpeed: parseFloat(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={settings.color}
                    onChange={(e) => onSettingsChange({ color: e.target.value })}
                    className="h-10 w-10 rounded-lg overflow-hidden bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono uppercase text-white/70">{settings.color}</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-white/30 text-center pt-4">© Kinetic Typo Studio</p>
          </div>
        )}
      </div>
      
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl hover:bg-white/20 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ControlPanel;
