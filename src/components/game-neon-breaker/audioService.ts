// 이 파일은 게임의 모든 소리(효과음)를 담당하는 전문가야.
class AudioService {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private init() { if (!this.audioCtx) { this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); this.masterGain = this.audioCtx.createGain(); this.masterGain.connect(this.audioCtx.destination); this.masterGain.gain.value = 0.3; } }
  public setVolume(volume: number) { if (this.masterGain) { this.masterGain.gain.value = this.isMuted ? 0 : volume; } }
  public toggleMute() { this.isMuted = !this.isMuted; if (this.masterGain) { this.masterGain.gain.value = this.isMuted ? 0 : 0.3; } return this.isMuted; }
  public playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) { this.init(); if (!this.audioCtx || !this.masterGain) return; const osc = this.audioCtx.createOscillator(); const gain = this.audioCtx.createGain(); osc.type = type; osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + startTime); gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime + startTime); gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + startTime + duration); osc.connect(gain); gain.connect(this.masterGain); osc.start(this.audioCtx.currentTime + startTime); osc.stop(this.audioCtx.currentTime + startTime + duration); }
  public playPaddleHit() { this.playTone(440, 'sine', 0.1); this.playTone(880, 'triangle', 0.05); }
  public playBrickHit(tier: number) { const baseFreq = 500 + (tier * 200); this.playTone(baseFreq, 'square', 0.1); }
  public playWallHit() { this.playTone(200, 'sine', 0.05); }
  public playLostLife() { this.playTone(150, 'sawtooth', 0.4); this.playTone(100, 'sawtooth', 0.4, 0.2); }
  public playWin() { const now = 0; this.playTone(440, 'sine', 0.2, now); this.playTone(554, 'sine', 0.2, now + 0.1); this.playTone(659, 'sine', 0.4, now + 0.2); this.playTone(880, 'square', 0.6, now + 0.3); }
  public playItemSpawn() { this.playTone(1200, 'sine', 0.2); this.playTone(1500, 'sine', 0.2, 0.1); }
  public playPowerUp() { const now = 0; this.playTone(300, 'square', 0.1, now); this.playTone(600, 'square', 0.1, now + 0.1); this.playTone(900, 'square', 0.2, now + 0.2); }
}
export const audioService = new AudioService();