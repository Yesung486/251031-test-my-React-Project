
export class EtherealAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillator: OscillatorNode | null = null;

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  startAmbient() {
    if (!this.ctx || !this.masterGain) return;
    this.oscillator = this.ctx.createOscillator();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.setValueAtTime(110, this.ctx.currentTime);
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    this.oscillator.connect(filter);
    filter.connect(this.masterGain);
    
    this.oscillator.start();
    this.masterGain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 2);
  }

  playInteraction(freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.5);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.5);
  }

  updateModulation(mouseX: number, width: number) {
    if (!this.oscillator || !this.ctx) return;
    const freq = 110 + (mouseX / width) * 55;
    this.oscillator.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
  }
}

export const audioService = new EtherealAudio();
