import React, { useEffect, useRef, useState, useCallback } from 'react';
// 1. 주소를 우리 프로젝트에 맞게 모두 수정했어!
import { GameState, Player, Enemy, Projectile, Gem, Vector2, WeaponType, DamageNumber, UpgradeOption, SkinEffectType, TreasureChest, SupplyCrate, ItemDrop, ItemDropType, Chapter } from '../types';
import { COLORS, PLAYER_SIZE, ENEMY_SPAWN_RATE, UPGRADE_DEFINITIONS, SKINS, PLAYER_BASE_SPEED } from '../constants';
import Joystick from './Joystick';
import { Sword, Heart, Zap, RotateCcw, Shield, Activity, LogOut, Star, Clock, Gift, Copy, Footprints, Bomb, Magnet, Coins, Pause, Play, Box, ZapOff, Ghost, Aperture, Crosshair, Flame, Lock as LockIcon, AlertTriangle, Skull } from 'lucide-react';

interface Particle {
    id: string;
    position: Vector2;
    velocity: Vector2;
    color: string;
    life: number;
    maxLife: number;
    size: number;
    type: SkinEffectType | 'SHOCKWAVE' | 'ORBITAL_LASER' | 'SKILL_EXPLOSION'; 
}

interface GameProps {
  onGameOver: (score: number, isVictory?: boolean, level?: number) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  initialStats: {
    hp: number;
    attack: number;
  };
  equippedWeaponName?: string;
  equippedSkinId?: string;
  onGoldGained: (amount: number) => void;
  chapterTheme: Chapter['theme'];
  chapterId: number; 
}

const skillIcons: Record<string, React.FC<any>> = {
    Zap, ZapOff, Ghost, Aperture, Crosshair, Flame
};

const Game: React.FC<GameProps> = ({ onGameOver, gameState, setGameState, initialStats, equippedWeaponName = 'Kunai', equippedSkinId = 'skin_default', onGoldGained, chapterTheme, chapterId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const currentSkin = SKINS.find(s => s.id === equippedSkinId) || SKINS[0];
  const hasActiveSkill = !!currentSkin.activeSkill;

  let mainWeaponId = 'kunai';
  if (equippedWeaponName?.includes('Kunai') || equippedWeaponName?.includes('쿠나이')) mainWeaponId = 'kunai';
  else if (equippedWeaponName?.includes('Katana') || equippedWeaponName?.includes('카타나')) mainWeaponId = 'katana';
  else if (equippedWeaponName?.includes('Shotgun') || equippedWeaponName?.includes('샷건')) mainWeaponId = 'shotgun';
  else if (equippedWeaponName?.includes('Revolver') || equippedWeaponName?.includes('리볼버')) mainWeaponId = 'revolver';
  else if (equippedWeaponName?.includes('Bat') || equippedWeaponName?.includes('방망이')) mainWeaponId = 'bat';

  const initialSkills: Record<string, number> = {};
  initialSkills[mainWeaponId] = 1;

  const baseHp = initialStats.hp * (1 + (currentSkin.stats.hpBonus || 0));
  const baseSpeed = PLAYER_BASE_SPEED * (1 + (currentSkin.stats.speedBonus || 0));
  const baseDamageMulti = 1 + (currentSkin.stats.attackBonus || 0);
  const baseCritChance = 0.05 + (currentSkin.stats.critChanceBonus || 0);
  const baseAttackSpeed = 1 + (currentSkin.stats.attackSpeedBonus || 0);

  const playerRef = useRef<Player>({
    id: 'player',
    position: { x: 0, y: 0 },
    radius: PLAYER_SIZE,
    color: currentSkin.primaryColor,
    hp: baseHp,
    maxHp: baseHp,
    speed: baseSpeed,
    xp: 0,
    level: 1,
    nextLevelXp: 15,
    damageMulti: baseDamageMulti,
    attackSpeedMulti: baseAttackSpeed,
    projectileCount: 1,
    critChance: baseCritChance,
    critDamageMulti: 1.5,
    magnetRadius: 150,
    weapons: [], 
    skills: initialSkills,
  });
  
  const lastHitTimeRef = useRef<number>(0);
  const isInvincibleRef = useRef<boolean>(false);
  const skillCooldownRef = useRef<number>(0); 
  const skillDurationRef = useRef<number>(0); 
  const shakeIntensityRef = useRef<number>(0);

  useEffect(() => {
      const p = playerRef.current;
      const newWeapons: WeaponType[] = [];
      if (p.skills['kunai']) newWeapons.push(WeaponType.KUNAI);
      if (p.skills['katana']) newWeapons.push(WeaponType.KUNAI); 
      if (p.skills['shotgun']) newWeapons.push(WeaponType.SHOTGUN);
      if (p.skills['revolver']) newWeapons.push(WeaponType.SHOTGUN); 
      if (p.skills['bat']) newWeapons.push(WeaponType.BAT);
      if (p.skills['guardian']) newWeapons.push(WeaponType.GUARDIAN);
      p.weapons = newWeapons;
  }, []);

  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const pendingShotsRef = useRef<{ delay: number, velocity: Vector2, damage: number, color: string, radius: number, isEvo: boolean, duration: number, penetration: number, weaponId: string }[]>([]);
  const gemsRef = useRef<Gem[]>([]);
  const treasureChestsRef = useRef<TreasureChest[]>([]);
  const supplyCratesRef = useRef<SupplyCrate[]>([]);
  const itemDropsRef = useRef<ItemDrop[]>([]);
  const damageNumbersRef = useRef<DamageNumber[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  const frameRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const worldOffsetRef = useRef<Vector2>({ x: 0, y: 0 });
  const inputVectorRef = useRef<Vector2>({ x: 0, y: 0 });
  const joystickVectorRef = useRef<Vector2>({ x: 0, y: 0 });
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const lastFacingDirRef = useRef<Vector2>({ x: 1, y: 0 });
  const lastShotTimeRef = useRef<number>(0);
  const bossSpawnedRef = useRef<Set<number>>(new Set());
  const waveWarningShownRef = useRef<Set<number>>(new Set());
  
  const [hp, setHp] = useState(baseHp);
  const [maxHp, setMaxHp] = useState(baseHp);
  const [level, setLevel] = useState(1);
  const [xpProgress, setXpProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState("00:00");
  const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([]);
  const [treasureRewards, setTreasureRewards] = useState<UpgradeOption[]>([]);
  const [waveWarning, setWaveWarning] = useState<string | null>(null);
  const [skillCooldownDisplay, setSkillCooldownDisplay] = useState(0);
  const [showBossWarning, setShowBossWarning] = useState(false);
  const [currentBoss, setCurrentBoss] = useState<Enemy | null>(null);

  const playSound = useCallback((type: 'shoot' | 'hit' | 'gem' | 'levelup' | 'explosion' | 'boss_spawn' | 'treasure_open' | 'click' | 'powerup' | 'coin' | 'skill' | 'warning') => { if (!audioContextRef.current || audioContextRef.current.state === 'suspended') return; const ctx = audioContextRef.current; const t = ctx.currentTime; switch (type) { case 'shoot': { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'triangle'; osc.frequency.setValueAtTime(880, t); osc.frequency.exponentialRampToValueAtTime(220, t + 0.1); gain.gain.setValueAtTime(0.2, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1); osc.connect(gain).connect(ctx.destination); osc.start(t); osc.stop(t + 0.1); break; } case 'hit': { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'square'; osc.frequency.setValueAtTime(110, t); gain.gain.setValueAtTime(0.4, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2); osc.connect(gain).connect(ctx.destination); osc.start(t); osc.stop(t + 0.2); break; } case 'gem': { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(660, t); osc.frequency.exponentialRampToValueAtTime(1320, t + 0.1); gain.gain.setValueAtTime(0.15, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1); osc.connect(gain).connect(ctx.destination); osc.start(t); osc.stop(t + 0.1); break; } case 'levelup': { [600, 800, 1200].forEach((freq, i) => { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(freq, t + i * 0.1); gain.gain.setValueAtTime(0.3, t + i * 0.1); gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 0.2); osc.connect(gain).connect(ctx.destination); osc.start(t + i * 0.1); osc.stop(t + i * 0.1 + 0.2); }); break; } case 'explosion': { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'square'; osc.frequency.setValueAtTime(200, t); osc.frequency.exponentialRampToValueAtTime(50, t + 0.3); gain.gain.setValueAtTime(0.4, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3); osc.connect(gain).connect(ctx.destination); osc.start(t); osc.stop(t + 0.3); break; } case 'treasure_open': { [523, 659, 783, 1046].forEach((freq, i) => { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, t + i * 0.08); gain.gain.setValueAtTime(0.3, t + i * 0.08); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4); osc.connect(gain).connect(ctx.destination); osc.start(t + i * 0.08); osc.stop(t + 0.4); }); break; } case 'click': { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(440, t); gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1); osc.connect(gain).connect(ctx.destination); osc.start(t); osc.stop(t + 0.1); break; } case 'powerup': { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, t); osc.frequency.exponentialRampToValueAtTime(1200, t + 0.2); gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2); osc.connect(gain).connect(ctx.destination); osc.start(t); osc.stop(t + 0.2); break; } case 'coin': { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(1046, t); gain.gain.setValueAtTime(0.2, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1); osc.connect(gain).connect(ctx.destination); osc.start(t); osc.stop(t + 0.1); break; } case 'skill': { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, t); osc.frequency.exponentialRampToValueAtTime(800, t + 0.5); gain.gain.setValueAtTime(0.5, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 1); osc.connect(gain).connect(ctx.destination); osc.start(t); osc.stop(t + 1); break; } case 'warning': { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, t); gain.gain.setValueAtTime(0.5, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5); osc.connect(gain).connect(ctx.destination); osc.start(t); osc.stop(t + 0.5); break; } } }, []);

  useEffect(() => { const initAudio = () => { if (!audioContextRef.current) { try { audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch (e) { console.error("Web Audio API is not supported in this browser"); } } if (audioContextRef.current && audioContextRef.current.state === 'suspended') { audioContextRef.current.resume(); } window.removeEventListener('click', initAudio); window.removeEventListener('touchstart', initAudio); }; window.addEventListener('click', initAudio); window.addEventListener('touchstart', initAudio); return () => { window.removeEventListener('click', initAudio); window.removeEventListener('touchstart', initAudio); if (audioContextRef.current && audioContextRef.current.state !== 'closed') { audioContextRef.current.close(); } }; }, []);
  useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { keysPressedRef.current[e.key.toLowerCase()] = true; }; const handleKeyUp = (e: KeyboardEvent) => { keysPressedRef.current[e.key.toLowerCase()] = false; }; window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp); return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); }; }, []);
  useEffect(() => { playerRef.current.hp = baseHp; playerRef.current.maxHp = baseHp; playerRef.current.color = currentSkin.primaryColor; setHp(baseHp); setMaxHp(baseHp); }, [baseHp, currentSkin]);

  const getDistance = (a: Vector2, b: Vector2) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

  const triggerShake = (intensity: number) => {
      shakeIntensityRef.current = Math.min(shakeIntensityRef.current + intensity, 20); 
  };

  const drawSupplyCrate = (ctx: CanvasRenderingContext2D, crate: SupplyCrate) => { ctx.save(); ctx.translate(crate.position.x, crate.position.y); const scale = 1 + Math.sin(frameRef.current * 0.1 + crate.id.charCodeAt(0)) * 0.05; ctx.scale(scale, scale); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(0, 15, 18, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#a16207'; ctx.fillRect(-15, -15, 30, 30); ctx.strokeStyle = '#422006'; ctx.lineWidth = 2; ctx.strokeRect(-15, -15, 30, 30); ctx.fillStyle = '#a8a29e'; ctx.fillRect(-17, -5, 34, 10); ctx.fillRect(-5, -17, 10, 34); ctx.fillStyle = 'white'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 2); ctx.restore(); };
  const drawItemDrop = (ctx: CanvasRenderingContext2D, drop: ItemDrop) => { ctx.save(); ctx.translate(drop.position.x, drop.position.y); const scale = 1 + Math.sin(drop.life * 0.1) * 0.1; ctx.scale(scale, scale); const iconSize = 20; const bgSize = 24; ctx.beginPath(); ctx.arc(0, 0, bgSize, 0, Math.PI * 2); ctx.globalAlpha = 0.5 + Math.sin(drop.life * 0.1) * 0.2; let icon: React.FC<any> | null = null; let color = '#fff'; if (drop.type === ItemDropType.MAGNET) { icon = Magnet; color = '#3b82f6'; } if (drop.type === ItemDropType.BOMB) { icon = Bomb; color = '#ef4444'; } if (drop.type === ItemDropType.GOLD) { icon = Coins; color = '#f59e0b'; } ctx.fillStyle = color; ctx.fill(); ctx.globalAlpha = 1; ctx.shadowColor = color; ctx.shadowBlur = 15; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0,0,iconSize,0,Math.PI*2); ctx.fill(); ctx.shadowBlur = 0; ctx.restore(); };
  const drawTreasureChest = (ctx: CanvasRenderingContext2D, chest: TreasureChest) => { ctx.save(); ctx.translate(chest.position.x, chest.position.y); const scale = 1 + Math.sin(frameRef.current * 0.1) * 0.05; ctx.scale(scale, scale); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(0, 15, 20, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#854d0e'; ctx.fillRect(-20, -10, 40, 20); ctx.strokeStyle = '#fde047'; ctx.lineWidth = 3; ctx.strokeRect(-20, -10, 40, 20); ctx.fillStyle = '#a16207'; ctx.beginPath(); ctx.moveTo(-22, -10); ctx.quadraticCurveTo(0, -30, 22, -10); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fbbf24'; ctx.fillRect(-5, -5, 10, 10); ctx.fillStyle = 'white'; if (frameRef.current % 10 === 0) { const angle = Math.random() * Math.PI * 2; const dist = 25 + Math.random() * 10; ctx.fillRect(Math.cos(angle) * dist, Math.sin(angle) * dist - 10, 3, 3); } ctx.restore(); };
  const drawProjectile = (ctx: CanvasRenderingContext2D, p: Projectile) => { ctx.save(); ctx.translate(p.position.x, p.position.y); const angle = Math.atan2(p.velocity.y, p.velocity.x); ctx.rotate(angle); if (p.weaponId === 'kunai') { const rotation = frameRef.current * 0.5; ctx.rotate(rotation); ctx.fillStyle = p.isEvo ? '#a78bfa' : '#cbd5e1'; ctx.shadowColor = p.isEvo ? '#8b5cf6' : '#94a3b8'; ctx.shadowBlur = p.isEvo ? 15 : 5; ctx.beginPath(); const size = p.isEvo ? 14 : 10; for (let i = 0; i < 4; i++) { ctx.lineTo(0, -size); ctx.lineTo(size/2, -size/2); ctx.rotate(Math.PI / 2); } ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill(); } else if (p.weaponId === 'katana') { ctx.fillStyle = p.isEvo ? '#dc2626' : '#0ea5e9'; ctx.shadowColor = p.isEvo ? '#ef4444' : '#38bdf8'; ctx.shadowBlur = 15; ctx.scale(1.5, 1); ctx.beginPath(); ctx.arc(0, 0, p.isEvo ? 25 : 20, Math.PI * 1.2, Math.PI * 2.8); ctx.fill(); ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(-5, 0, p.isEvo ? 20 : 15, Math.PI * 1.2, Math.PI * 2.8); ctx.fill(); ctx.globalAlpha = 1; } else if (p.weaponId === 'revolver') { ctx.strokeStyle = p.isEvo ? '#ef4444' : '#fcd34d'; ctx.lineWidth = p.isEvo ? 4 : 2; ctx.shadowColor = p.isEvo ? '#f87171' : '#fef08a'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-40, 0); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill(); } else if (p.weaponId === 'shotgun') { if (p.isEvo) { ctx.fillStyle = '#fca5a5'; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 5; ctx.fillRect(-10, -2, 20, 4); ctx.fillStyle = '#fff'; ctx.fillRect(0, -1, 10, 2); } else { ctx.fillStyle = '#facc15'; ctx.shadowColor = '#eab308'; ctx.shadowBlur = 3; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(-6, -3, 3, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(-6, 3, 3, 0, Math.PI * 2); ctx.fill(); } } else if (p.weaponId === 'bat') { ctx.globalAlpha = 0.6; ctx.fillStyle = p.isEvo ? '#ef4444' : '#fff'; ctx.beginPath(); ctx.arc(0, 0, p.radius, Math.PI * 1.2, Math.PI * 2.8); ctx.lineTo(0, 0); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = p.isEvo ? '#fee2e2' : '#e5e7eb'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, p.radius, Math.PI * 1.2, Math.PI * 2.8); ctx.stroke(); } else { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); };
  const drawGuardian = (ctx: CanvasRenderingContext2D, x: number, y: number, isEvo: boolean) => { ctx.save(); ctx.translate(x, y); ctx.rotate(frameRef.current * (isEvo ? 0.4 : 0.2)); ctx.fillStyle = isEvo ? '#f43f5e' : '#e5e7eb'; ctx.shadowColor = isEvo ? '#e11d48' : '#9ca3af'; ctx.shadowBlur = isEvo ? 15 : 5; const size = isEvo ? 16 : 12; for(let i=0; i<3; i++) { ctx.rotate(Math.PI * 2 / 3); ctx.beginPath(); ctx.moveTo(0, -size/2); ctx.quadraticCurveTo(size, -size, 0, -size*2); ctx.quadraticCurveTo(-size, -size, 0, -size/2); ctx.fill(); } ctx.fillStyle = '#1f293b'; ctx.beginPath(); ctx.arc(0, 0, size/2, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = isEvo ? '#fda4af' : '#6b7280'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, size/3, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); };
  const createDeathEffect = (pos: Vector2, type: SkinEffectType) => { particlesRef.current.push({ id: Math.random().toString(), position: { ...pos }, velocity: { x: 0, y: 0 }, color: 'white', life: 20, maxLife: 20, size: 1, type: 'SHOCKWAVE' }); const count = type === 'NONE' ? 8 : 16; for (let i = 0; i < count; i++) { const angle = Math.random() * Math.PI * 2; let speed = Math.random() * 4 + 2; let color = '#fff'; let life = 30; let size = Math.random() * 4 + 2; if (type === 'BLOOD') { color = Math.random() > 0.5 ? '#991b1b' : '#ef4444'; size = Math.random() * 6 + 2; life = 45; } else if (type === 'GOLD') { color = '#fbbf24'; life = 60; speed = Math.random() * 5 + 2; } else if (type === 'PIXEL') { color = Math.random() > 0.5 ? '#22d3ee' : '#e879f9'; size = Math.random() * 5 + 3; life = 40; } else if (type === 'VOID') { color = '#7c3aed'; life = 50; } else if (type === 'GHOST') { color = '#4ade80'; life = 60; speed *= 0.5; } else if (type === 'MECHA') { color = Math.random() > 0.5 ? '#3b82f6' : '#facc15'; size = Math.random() * 4 + 2; life = 35; } else if (type === 'FIRE') { color = Math.random() > 0.5 ? '#f97316' : '#fcd34d'; size = Math.random() * 6 + 2; life = 40; speed *= 1.2; } else if (type === 'LIGHTNING') { color = '#fde047'; life = 30; speed *= 2; } else if (type === 'ICE') { color = '#a5f3fc'; life = 50; speed *= 0.8; } else if (type === 'TOXIC') { color = '#84cc16'; life = 45; size = Math.random() * 5 + 3; } particlesRef.current.push({ id: Math.random().toString(), position: { ...pos }, velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed }, color, life, maxLife: life, size, type }); } };
  const drawParticles = (ctx: CanvasRenderingContext2D, isPaused: boolean) => { for (let i = particlesRef.current.length - 1; i >= 0; i--) { const p = particlesRef.current[i]; if (p.type === 'SKILL_EXPLOSION') { const progress = 1 - (p.life / p.maxLife); const currentRadius = p.size * progress; ctx.save(); ctx.beginPath(); ctx.arc(p.position.x, p.position.y, currentRadius, 0, Math.PI * 2); ctx.lineWidth = 50 * (1 - progress); ctx.strokeStyle = p.color; ctx.globalAlpha = p.life / p.maxLife; ctx.stroke(); ctx.fillStyle = p.color; ctx.globalAlpha = (p.life / p.maxLife) * 0.3; ctx.fill(); ctx.restore(); if (!isPaused) { p.life--; if (p.life <= 0) particlesRef.current.splice(i, 1); } continue; } if (p.type === 'ORBITAL_LASER') { const progress = p.life / p.maxLife; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(59, 130, 246, ${Math.min(1, progress * 2)})`; ctx.fillRect(p.position.x - p.size / 2, 0, p.size, window.innerHeight); ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, progress * 3)})`; ctx.fillRect(p.position.x - p.size / 4, 0, p.size / 2, window.innerHeight); ctx.restore(); if (!isPaused) { p.life--; if (p.life <= 0) particlesRef.current.splice(i, 1); } continue; } if (p.type === 'SHOCKWAVE') { const progress = 1 - (p.life / p.maxLife); const maxRadius = 50; const currentRadius = maxRadius * progress; ctx.save(); ctx.globalAlpha = p.life / p.maxLife; ctx.strokeStyle = 'white'; ctx.lineWidth = 3 * (p.life / p.maxLife); ctx.beginPath(); ctx.arc(p.position.x, p.position.y, currentRadius, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); if (!isPaused) { p.life--; if (p.life <= 0) particlesRef.current.splice(i, 1); } continue; } ctx.globalAlpha = p.life / p.maxLife; ctx.fillStyle = p.color; if (p.type === 'PIXEL' || p.type === 'MECHA') { ctx.fillRect(p.position.x - p.size / 2, p.position.y - p.size / 2, p.size, p.size); } else if (p.type === 'VOID' || p.type === 'TOXIC') { ctx.beginPath(); ctx.arc(p.position.x, p.position.y, p.size, 0, Math.PI * 2); if (p.type === 'TOXIC') ctx.globalAlpha *= 0.7; ctx.fill(); if (!isPaused) { if (p.type === 'VOID') { p.velocity.x *= 0.96; p.velocity.y *= 0.96; } else { p.velocity.y -= 0.02; } } } else if (p.type === 'GOLD') { ctx.beginPath(); const spikes = 4; const outerRadius = p.size; const innerRadius = p.size / 2; let rot = Math.PI / 2 * 3; let x = p.position.x; let y = p.position.y; let step = Math.PI / spikes; ctx.moveTo(p.position.x, p.position.y - outerRadius); for (let j = 0; j < spikes; j++) { x = p.position.x + Math.cos(rot) * outerRadius; y = p.position.y + Math.sin(rot) * outerRadius; ctx.lineTo(x, y); rot += step; x = p.position.x + Math.cos(rot) * innerRadius; y = p.position.y + Math.sin(rot) * innerRadius; ctx.lineTo(x, y); rot += step; } ctx.lineTo(p.position.x, p.position.y - outerRadius); ctx.closePath(); ctx.fill(); if (!isPaused) p.velocity.y += 0.05; } else if (p.type === 'FIRE') { ctx.beginPath(); ctx.arc(p.position.x, p.position.y, p.size, 0, Math.PI * 2); ctx.fill(); if (!isPaused) { p.velocity.y -= 0.1; p.position.x += (Math.random() - 0.5); } } else if (p.type === 'GHOST' || p.type === 'ICE') { ctx.beginPath(); ctx.arc(p.position.x, p.position.y, p.size, 0, Math.PI * 2); ctx.fill(); if (!isPaused) p.velocity.y -= 0.05; } else if (p.type === 'LIGHTNING') { ctx.strokeStyle = p.color; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.position.x, p.position.y); ctx.lineTo(p.position.x + p.velocity.x * 2, p.position.y + p.velocity.y * 2); ctx.stroke(); } else { ctx.beginPath(); ctx.arc(p.position.x, p.position.y, p.size, 0, Math.PI * 2); ctx.fill(); } if (!isPaused) { p.position.x += p.velocity.x; p.position.y += p.velocity.y; p.life--; if (p.life <= 0) { particlesRef.current.splice(i, 1); } } } ctx.globalAlpha = 1; };
  
  const drawAura = (ctx: CanvasRenderingContext2D, player: Player) => { const type = currentSkin.effectType; const { x, y } = player.position; const time = frameRef.current; const r = player.radius + 15; ctx.save(); ctx.translate(x, y); 
    if (type === 'BLOOD') { 
        ctx.rotate(time * 0.15); 
        ctx.fillStyle = '#991b1b'; 
        for(let i=0; i<3; i++) {
            ctx.rotate(Math.PI * 2 / 3);
            ctx.beginPath(); ctx.arc(0, r + 5, 4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(0, r); ctx.quadraticCurveTo(10, r+10, 0, r+20); ctx.quadraticCurveTo(-5, r+10, 0, r);
            ctx.fillStyle = 'rgba(220, 20, 60, 0.6)'; ctx.fill();
        }
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0,0, r, 0, Math.PI*2); ctx.stroke();
    } else if (type === 'GOLD') { 
        ctx.rotate(time * 0.01); 
        ctx.fillStyle = 'rgba(255, 215, 0, 0.1)'; 
        ctx.beginPath(); for(let i=0; i<8; i++) { const a = i * Math.PI/4; ctx.moveTo(0,0); ctx.lineTo(Math.cos(a)*50, Math.sin(a)*50); } ctx.fill();
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r + 5 + Math.sin(time*0.1)*2, 0, Math.PI * 2); ctx.stroke(); 
    } else if (type === 'PIXEL') { 
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)'; ctx.lineWidth = 2;
        const gridSize = 50; 
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-gridSize/2, -gridSize/2, gridSize, gridSize); 
        ctx.rotate(Math.PI/4); ctx.strokeRect(-gridSize/2, -gridSize/2, gridSize, gridSize);
        ctx.setLineDash([]);
        if (time % 10 < 5) { ctx.fillStyle = '#22d3ee'; ctx.fillRect(-30, -30, 5, 5); ctx.fillRect(25, 25, 5, 5); }
    } else if (type === 'VOID') { 
        // Event Horizon
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0, 0, r + 5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 2; 
        for(let i=0; i<8; i++) { 
            const angle = (Math.PI * 2 / 8) * i + time * -0.05; 
            const dist = 60 - (time % 30); 
            ctx.beginPath(); ctx.moveTo(Math.cos(angle)*dist, Math.sin(angle)*dist); ctx.lineTo(0, 0); ctx.stroke(); 
        }
        ctx.shadowColor = '#4c1d95'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(0, 0, r + 20, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
    } else if (type === 'GHOST') { 
        ctx.fillStyle = 'rgba(74, 222, 128, 0.1)'; ctx.beginPath(); ctx.arc(0, 0, r + 15, 0, Math.PI * 2); ctx.fill(); 
        ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2;
        for(let i=0; i<3; i++) {
            const a = time * 0.05 + i * (Math.PI*2/3);
            ctx.beginPath(); ctx.arc(Math.cos(a)*30, Math.sin(a)*30, 5, 0, Math.PI*2); ctx.stroke();
        }
    } else if (type === 'MECHA') { 
        // Hexagon Field
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1; 
        ctx.rotate(time * 0.02); 
        ctx.beginPath(); 
        for (let i = 0; i < 6; i++) { 
            const angle = i * Math.PI / 3; 
            const hx = Math.cos(angle) * 40; const hy = Math.sin(angle) * 40; 
            ctx.moveTo(hx + 20, hy); for(let j=1; j<=6; j++) ctx.lineTo(hx + 20*Math.cos(j*Math.PI/3), hy + 20*Math.sin(j*Math.PI/3));
        } ctx.stroke(); 
    } else if (type === 'FIRE') { 
        // Massive Rune Circle for Hellfire
        ctx.shadowBlur = 20; ctx.shadowColor = '#f97316'; 
        ctx.rotate(time * 0.01);
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r + 40, 0, Math.PI * 2); ctx.stroke();
        ctx.save(); ctx.rotate(time * -0.03); ctx.strokeStyle = '#f97316'; ctx.lineWidth = 4; ctx.setLineDash([10, 10]); ctx.beginPath(); ctx.arc(0, 0, r + 25, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        ctx.fillStyle = 'rgba(234, 88, 12, 0.2)'; for(let i=0; i<3; i++) { ctx.rotate(Math.PI * 2 / 3); ctx.beginPath(); ctx.moveTo(0, -(r+30)); ctx.lineTo(15, -(r)); ctx.lineTo(-15, -(r)); ctx.fill(); }
        ctx.shadowBlur = 0; 
    } else if (type === 'LIGHTNING') { 
        if (time % 5 === 0) {
            ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2; ctx.shadowColor = '#fef08a'; ctx.shadowBlur = 10;
            ctx.beginPath();
            const startAngle = Math.random() * Math.PI * 2;
            let cx = Math.cos(startAngle) * 20, cy = Math.sin(startAngle) * 20;
            ctx.moveTo(cx, cy);
            for(let i=0; i<4; i++) { cx += (Math.random()-0.5)*30; cy += (Math.random()-0.5)*30; ctx.lineTo(cx, cy); }
            ctx.stroke(); ctx.shadowBlur = 0;
        }
    } else if (type === 'ICE') { 
        ctx.strokeStyle = '#a5f3fc'; ctx.lineWidth = 2; 
        ctx.rotate(time * -0.01);
        const spikes = 6; for(let i=0; i<spikes; i++) { const angle = (Math.PI * 2 / spikes) * i; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(angle)*40, Math.sin(angle)*40); ctx.stroke(); }
    } else if (type === 'TOXIC') { 
        ctx.fillStyle = 'rgba(132, 204, 22, 0.3)'; 
        for(let i=0; i<5; i++) { 
            const angle = (Math.PI * 2 / 5) * i + time * 0.03; 
            const pulse = Math.sin(time*0.1 + i)*5;
            ctx.beginPath(); ctx.arc(Math.cos(angle)*(30+pulse), Math.sin(angle)*(30+pulse), 10, 0, Math.PI * 2); ctx.fill(); 
        } 
    } ctx.restore(); };

  const drawPlayerSkin = (ctx: CanvasRenderingContext2D, player: Player) => { 
      const type = currentSkin.effectType; 
      const { x, y } = player.position; 
      const r = player.radius; 
      const t = frameRef.current; 
      const breath = Math.sin(t * 0.1) * 2;

      ctx.save(); 
      ctx.translate(x, y); 
      
      // Facing & Movement Bob
      if (lastFacingDirRef.current.x < 0) ctx.scale(-1, 1);
      ctx.translate(0, breath);

      // --- THEMATIC SKIN RENDERING ---
      if (type === 'FIRE') { 
          // DRAGON WARRIOR
          // Tail
          ctx.fillStyle = '#7c2d12';
          ctx.beginPath(); ctx.moveTo(-15, 10); ctx.quadraticCurveTo(-30, 20 + Math.sin(t*0.2)*5, -40, 15); ctx.lineTo(-20, 5); ctx.fill();
          // Body Armor
          ctx.fillStyle = '#991b1b';
          ctx.beginPath(); ctx.moveTo(-15, -10); ctx.lineTo(15, -10); ctx.lineTo(10, 20); ctx.lineTo(-10, 20); ctx.fill();
          // Chest Plate (Glowing)
          ctx.fillStyle = '#f97316'; ctx.shadowColor = '#f97316'; ctx.shadowBlur = 10;
          ctx.beginPath(); ctx.moveTo(-5, -5); ctx.lineTo(5, -5); ctx.lineTo(0, 5); ctx.fill(); ctx.shadowBlur = 0;
          // Helmet
          ctx.fillStyle = '#7f1d1d';
          ctx.beginPath(); ctx.arc(0, -15, 12, 0, Math.PI*2); ctx.fill();
          // Horns
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath(); ctx.moveTo(5, -20); ctx.quadraticCurveTo(15, -30, 10, -15); ctx.fill();
          ctx.beginPath(); ctx.moveTo(0, -20); ctx.quadraticCurveTo(-10, -35, -10, -15); ctx.fill();
          // Eyes
          ctx.fillStyle = '#fff';
          ctx.fillRect(2, -18, 4, 2);
      } 
      else if (type === 'MECHA') { 
          // MECHA ROBOT
          // Legs
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(-10, 10, 8, 12); ctx.fillRect(2, 10, 8, 12);
          // Body
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath(); ctx.moveTo(-15, -10); ctx.lineTo(15, -10); ctx.lineTo(10, 15); ctx.lineTo(-10, 15); ctx.fill();
          // Shoulders
          ctx.fillStyle = '#60a5fa';
          ctx.fillRect(-22, -12, 10, 10); ctx.fillRect(12, -12, 10, 10);
          // Head
          ctx.fillStyle = '#eff6ff';
          ctx.fillRect(-8, -24, 16, 14);
          // Visor
          ctx.fillStyle = '#00ff00'; ctx.shadowColor = '#00ff00'; ctx.shadowBlur = 5;
          ctx.fillRect(-6, -20, 12, 4); ctx.shadowBlur = 0;
          // Antenna
          ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(-8, -20); ctx.lineTo(-12, -35); ctx.stroke();
      } 
      else if (type === 'VOID') { 
          // VOID REAPER
          // Cloak Body (No legs, floating)
          ctx.fillStyle = '#000';
          ctx.beginPath(); 
          ctx.moveTo(0, -25); 
          ctx.bezierCurveTo(20, -20, 20, 20, 10, 30 + Math.sin(t*0.1)*5); // Right side
          ctx.bezierCurveTo(0, 25, -10, 35, -10, 30 + Math.sin(t*0.1+2)*5); // Bottom tatter
          ctx.bezierCurveTo(-20, 20, -20, -20, 0, -25); // Left side
          ctx.fill();
          // Hood
          ctx.fillStyle = '#2e1065';
          ctx.beginPath(); ctx.arc(0, -15, 14, Math.PI, 0); ctx.lineTo(14, 0); ctx.quadraticCurveTo(0, 10, -14, 0); ctx.fill();
          // Eyes
          ctx.fillStyle = '#a78bfa'; ctx.shadowColor = '#8b5cf6'; ctx.shadowBlur = 10;
          ctx.beginPath(); ctx.arc(4, -15, 3, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(-2, -15, 3, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
      } 
      else if (type === 'GHOST') { 
          // SPECTRE
          // Ghost Tail
          ctx.fillStyle = 'rgba(134, 239, 172, 0.6)';
          ctx.beginPath(); ctx.arc(0, -10, 12, Math.PI, 0); 
          ctx.lineTo(12, 10); 
          ctx.quadraticCurveTo(5, 20 + Math.sin(t*0.2)*5, 0, 15);
          ctx.quadraticCurveTo(-5, 20 + Math.sin(t*0.2 + 2)*5, -12, 10);
          ctx.fill();
          // Eyes
          ctx.fillStyle = '#064e3b';
          ctx.beginPath(); ctx.arc(4, -12, 2, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(-4, -12, 2, 0, Math.PI*2); ctx.fill();
      } 
      else if (type === 'GOLD') { 
          // GOLDEN KING
          // Cape
          ctx.fillStyle = '#dc2626';
          ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(10, -10); ctx.lineTo(15, 25); ctx.lineTo(-15, 25); ctx.fill();
          // Armor
          ctx.fillStyle = '#fcd34d';
          ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI*2); ctx.fill();
          // Crown
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath(); ctx.moveTo(-8, -12); ctx.lineTo(-8, -22); ctx.lineTo(-4, -18); ctx.lineTo(0, -24); ctx.lineTo(4, -18); ctx.lineTo(8, -22); ctx.lineTo(8, -12); ctx.fill();
          // Sash
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(8, 8); ctx.stroke();
      } 
      else if (type === 'BLOOD') { 
          // NINJA / ASSASSIN
          // Scarf
          ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(0, -10); ctx.quadraticCurveTo(-20, -15 + Math.sin(t*0.3)*5, -30, -5); ctx.stroke();
          // Body
          ctx.fillStyle = '#171717';
          ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI*2); ctx.fill();
          // Visor/Eye slit
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-8, -5, 16, 3);
          // Weapon on back
          ctx.strokeStyle = '#525252'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(10, 10); ctx.stroke();
      } 
      else if (type === 'ICE') { 
          // ICE GOLEM
          // Body Shards
          ctx.fillStyle = '#cffafe';
          ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(10, -5); ctx.lineTo(5, 10); ctx.lineTo(-5, 10); ctx.lineTo(-10, -5); ctx.fill();
          // Shoulders
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(-20, -15); ctx.lineTo(-12, 0); ctx.fill();
          ctx.beginPath(); ctx.moveTo(10, -10); ctx.lineTo(20, -15); ctx.lineTo(12, 0); ctx.fill();
          // Glowing Core
          ctx.fillStyle = '#fff'; ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 10;
          ctx.beginPath(); ctx.arc(0, -5, 3, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
      } 
      else if (type === 'TOXIC') { 
          // HAZMAT MUTANT
          // Body
          ctx.fillStyle = '#3f6212';
          ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI*2); ctx.fill();
          // Gas Mask
          ctx.fillStyle = '#1a2e05';
          ctx.beginPath(); ctx.arc(0, -5, 10, 0, Math.PI*2); ctx.fill();
          // Goggles
          ctx.fillStyle = '#84cc16';
          ctx.beginPath(); ctx.arc(-4, -8, 3, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(4, -8, 3, 0, Math.PI*2); ctx.fill();
          // Filter
          ctx.fillStyle = '#365314';
          ctx.fillRect(-3, -2, 6, 6);
      } 
      else if (type === 'PIXEL') { 
          // CYBER PUNK (Pixelated look using small rects)
          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(-10, -15, 20, 10); // Head
          ctx.fillStyle = '#ec4899';
          ctx.fillRect(-10, -5, 20, 20); // Body
          // Glitch effect
          if (t % 10 < 2) {
              ctx.fillStyle = '#fff';
              ctx.fillRect(10, 0, 5, 5);
          }
      } 
      else if (type === 'LIGHTNING') { 
          // SPEEDSTER
          // Streamlined Body
          ctx.fillStyle = '#facc15';
          ctx.beginPath(); ctx.ellipse(0, 0, 10, 15, 0, 0, Math.PI*2); ctx.fill();
          // Goggles
          ctx.fillStyle = '#fff';
          ctx.fillRect(-8, -10, 16, 4);
          // Spark
          if (t % 5 === 0) {
              ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
              ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(15, -5); ctx.stroke();
          }
      } 
      else { 
          // DEFAULT AGENT
          // Backpack
          ctx.fillStyle = '#374151';
          ctx.fillRect(-12, -10, 4, 14);
          // Body
          ctx.fillStyle = '#1e3a8a';
          ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI*2); ctx.fill();
          // Visor
          ctx.fillStyle = '#60a5fa';
          ctx.fillRect(4, -6, 6, 4);
      }
      
      ctx.restore(); 
  };

  const handleSkillTrigger = () => {
      if (!currentSkin.activeSkill) return;
      if (skillCooldownRef.current > 0) return;

      const skill = currentSkin.activeSkill;
      skillCooldownRef.current = skill.cooldown * 60; 
      playSound('skill');
      
      triggerShake(10);

      const skinType = currentSkin.effectType;
      const baseDamage = initialStats.attack * playerRef.current.damageMulti; 

      if (skinType === 'FIRE') {
          particlesRef.current.push({
              id: Math.random().toString(),
              position: { ...playerRef.current.position },
              velocity: { x:0, y:0 },
              color: '#f97316',
              life: 60,
              maxLife: 60,
              size: 500, 
              type: 'SKILL_EXPLOSION'
          });
          
          triggerShake(20); 

          const damage = baseDamage * 500; 
          enemiesRef.current.forEach(e => {
              e.hp -= damage;
              damageNumbersRef.current.push({
                  id: Math.random().toString(), position: e.position, value: Math.floor(damage), opacity: 1, life: 30, isCritical: true
              });
          });
          
          setWaveWarning("태양의 분노 발동!");
          setTimeout(() => setWaveWarning(null), 2000);

      } else if (skinType === 'MECHA') {
          const damage = baseDamage * 100;
          const count = 5;
          for(let i=0; i<count; i++) {
              const x = Math.random() * window.innerWidth;
              setTimeout(() => {
                  triggerShake(5);
                  particlesRef.current.push({
                      id: Math.random().toString(),
                      position: { x, y: 0 },
                      velocity: {x:0, y:0},
                      color: 'blue',
                      life: 30,
                      maxLife: 30,
                      size: 150,
                      type: 'ORBITAL_LASER'
                  });
                  enemiesRef.current.forEach(e => {
                      if (Math.abs(e.position.x - x) < 75) {
                          e.hp -= damage;
                          damageNumbersRef.current.push({
                              id: Math.random().toString(), position: e.position, value: Math.floor(damage), opacity: 1, life: 30, isCritical: true
                          });
                      }
                  }); 
                  playSound('explosion');
              }, i * 200);
          }
      } else if (skinType === 'VOID') {
          triggerShake(8);
          const damage = baseDamage * 200;
          const center = { x: window.innerWidth/2, y: window.innerHeight/2 };
          enemiesRef.current.forEach(e => {
              e.position = { ...center }; 
              e.hp -= damage;
              damageNumbersRef.current.push({
                  id: Math.random().toString(), position: e.position, value: Math.floor(damage), opacity: 1, life: 30, isCritical: true
              });
          });
          createDeathEffect(center, 'VOID');
      } else if (skinType === 'LIGHTNING') {
          triggerShake(8);
          const damage = baseDamage * 50;
          enemiesRef.current.forEach(e => {
              e.hp -= damage;
              createDeathEffect(e.position, 'LIGHTNING');
              damageNumbersRef.current.push({
                  id: Math.random().toString(), position: e.position, value: Math.floor(damage), opacity: 1, life: 30, isCritical: true
              });
          });
      } else if (skinType === 'GHOST') {
          skillDurationRef.current = 300; 
          playerRef.current.speed *= 2;
          setWaveWarning("유체 이탈 - 무적 상태");
          setTimeout(() => setWaveWarning(null), 1000);
      } else if (skinType === 'PIXEL') {
          triggerShake(5);
          const damage = baseDamage * 30;
          projectilesRef.current = []; 
          enemiesRef.current.forEach(e => {
              e.hp -= damage;
              damageNumbersRef.current.push({
                  id: Math.random().toString(), position: e.position, value: Math.floor(damage), opacity: 1, life: 30, isCritical: true
              });
          }); 
          setWaveWarning("시스템 과부하!");
          setTimeout(() => setWaveWarning(null), 1000);
      }
  };

  const spawnEnemy = (count: number = 1, isBoss: boolean = false, bossType: number = 0, forceWeak: boolean = false) => {
    for (let i = 0; i < count; i++) {
        const edge = Math.floor(Math.random() * 4);
        let x = 0, y = 0;
        const buffer = isBoss ? 100 : 50;
        const spawnDist = Math.max(window.innerWidth, window.innerHeight) / 2 + buffer;
        const angle = Math.random() * Math.PI * 2;
        
        x = window.innerWidth / 2 + Math.cos(angle) * spawnDist;
        y = window.innerHeight / 2 + Math.sin(angle) * spawnDist;

        const typeRoll = Math.random();
        let type: Enemy['type'] = 'ZOMBIE';
        
        const chapterMultiplier = 1 + (chapterId - 1) * 0.5;
        
        let baseHp = 800 * chapterMultiplier; 
        let xpValue = 3 * chapterMultiplier; 
        let baseSpeed = 1;
        let color = COLORS.ZOMBIE; 
        let radius = 10;
        
        if (isBoss) {
            type = 'BOSS';
            if (bossType === 2) { 
                baseHp = 1000000 * chapterMultiplier; 
                xpValue = 50000 * chapterMultiplier;
                baseSpeed = 0.8;
                radius = 80;
                color = '#000';
            } else { 
                baseHp = 80000 * chapterMultiplier;
                xpValue = 5000 * chapterMultiplier;
                baseSpeed = 0.6;
                radius = 40;
                color = '#b91c1c';
            }
        } else if (forceWeak) {
            type = 'ZOMBIE';
            baseHp = 500 * chapterMultiplier;
            xpValue = 1 * chapterMultiplier;
            baseSpeed = 1.2;
        } else if (typeRoll > 0.9) {
            type = 'TANK';
            baseHp = 4000 * chapterMultiplier;
            xpValue = 30 * chapterMultiplier;
            baseSpeed = 0.5;
            color = COLORS.TANK;
            radius = 20;
        } else if (typeRoll > 0.7) {
            type = 'FAST';
            baseHp = 600 * chapterMultiplier;
            xpValue = 5 * chapterMultiplier;
            baseSpeed = 2;
            color = COLORS.FAST;
            radius = 8;
        }

        const playerLevel = playerRef.current.level;
        
        const speed = isBoss ? baseSpeed : (baseSpeed + (Math.min(playerLevel, 20) * 0.05)) * (1 + (chapterId-1)*0.1); 

        let hpMultiplier = 1;
        if (!isBoss) {
            hpMultiplier = 1 + (playerLevel * 0.2); 
        }

        const hp = baseHp * hpMultiplier;
        const damage = (isBoss ? 200 : (50 + (playerLevel * 5))) * chapterMultiplier;

        enemiesRef.current.push({
            id: Math.random().toString(),
            position: { x, y },
            radius,
            color,
            hp,
            maxHp: hp,
            speed,
            damage,
            xpValue,
            type
        });
    }
  };

  const spawnSupplyCrate = () => {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(window.innerWidth, window.innerHeight) / 2 + 50;
    const x = window.innerWidth / 2 + Math.cos(angle) * dist;
    const y = window.innerHeight / 2 + Math.sin(angle) * dist;
    
    supplyCratesRef.current.push({
      id: Math.random().toString(),
      position: { x, y },
      radius: 15,
      color: '#a16207',
      hp: 50,
      maxHp: 50,
    });
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const killEnemy = (enemy: Enemy, byBomb: boolean = false) => {
        if (!byBomb) playSound('explosion');
        createDeathEffect(enemy.position, currentSkin.effectType);
        
        if (currentSkin.effectType === 'GHOST' && Math.random() < 0.1) {
            setHp(prev => Math.min(maxHp, prev + 1));
            damageNumbersRef.current.push({
                id: Math.random().toString(),
                position: { ...playerRef.current.position },
                value: 1, opacity: 1, life: 60, isCritical: false, isGold: false
            }); 
        }

        if (enemy.type === 'BOSS' && enemy.maxHp < 1000000) { 
             treasureChestsRef.current.push({
                 id: Math.random().toString(),
                 position: enemy.position,
                 radius: 20,
                 color: COLORS.TREASURE,
                 life: 300,
             });
        } else if (enemy.type !== 'BOSS') { 
            gemsRef.current.push({
                id: Math.random().toString(),
                position: enemy.position,
                radius: 5,
                color: COLORS.GEM,
                value: enemy.xpValue
            });
        }
        
        let scoreGain = 100;
        if (enemy.type === 'TANK') scoreGain = 500;
        if (enemy.type === 'BOSS') scoreGain = 10000;

        scoreRef.current += Math.floor(scoreGain * (1 + (chapterId - 1) * 0.5));
        setScore(scoreRef.current);

        if (enemy.type === 'BOSS' && enemy.maxHp >= 1000000) {
            onGameOver(scoreRef.current, true, playerRef.current.level);
        }
        
        if (enemy.type === 'BOSS') {
            setCurrentBoss(null); 
        }
    };

    const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
        ctx.save();
        ctx.translate(enemy.position.x, enemy.position.y);
        
        const time = frameRef.current;
        
        if (chapterId === 1) {
            if (enemy.type === 'BOSS') {
                ctx.fillStyle = '#4c1d95'; 
                ctx.beginPath(); ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 3; ctx.stroke();
                ctx.fillStyle = 'red';
                ctx.beginPath(); ctx.arc(-20, -10, 8, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(20, -10, 8, 0, Math.PI * 2); ctx.fill();
            } else {
                ctx.fillStyle = enemy.type === 'TANK' ? '#7f1d1d' : (enemy.type === 'FAST' ? '#d97706' : '#9f1239');
                ctx.beginPath();
                ctx.moveTo(enemy.radius, 0);
                for(let i=0; i<8; i++) {
                    const angle = (Math.PI*2/8) * i;
                    const r = enemy.radius + (Math.sin(angle * 3 + time * 0.2) * 2);
                    ctx.lineTo(Math.cos(angle)*r, Math.sin(angle)*r);
                }
                ctx.closePath();
                ctx.fill();
                
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath(); ctx.arc(-3, -3, 2, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(4, 2, 3, 0, Math.PI*2); ctx.fill();
            }

        } else if (chapterId === 2) {
            if (enemy.type === 'BOSS') {
                ctx.fillStyle = '#374151'; 
                ctx.fillRect(-enemy.radius, -enemy.radius, enemy.radius*2, enemy.radius*2);
                ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 4; ctx.strokeRect(-enemy.radius, -enemy.radius, enemy.radius*2, enemy.radius*2);
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(-30, -10, 60, 20);
            } else {
                ctx.fillStyle = enemy.type === 'TANK' ? '#57534e' : (enemy.type === 'FAST' ? '#b45309' : '#52525b');
                const size = enemy.radius * 1.6;
                ctx.fillRect(-size/2, -size/2, size, size);
                
                ctx.fillStyle = '#a1a1aa';
                ctx.fillRect(-size/2 + 2, -size/2 + 2, 2, 2);
                ctx.fillRect(size/2 - 4, -size/2 + 2, 2, 2);
                ctx.fillRect(-size/2 + 2, size/2 - 4, 2, 2);
                ctx.fillRect(size/2 - 4, size/2 - 4, 2, 2);
            }

        } else if (chapterId === 3) {
            if (enemy.type === 'BOSS') {
                ctx.rotate(time * 0.01);
                ctx.fillStyle = '#4c1d95'; 
                ctx.beginPath();
                for(let i=0; i<6; i++) {
                    const angle = (Math.PI*2/6) * i;
                    ctx.lineTo(Math.cos(angle)*enemy.radius, Math.sin(angle)*enemy.radius);
                }
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 3; ctx.stroke();
            } else {
                ctx.fillStyle = enemy.type === 'TANK' ? '#1e3a8a' : (enemy.type === 'FAST' ? '#8b5cf6' : '#0ea5e9');
                ctx.rotate(time * (enemy.type === 'FAST' ? 0.1 : 0.02));
                ctx.beginPath();
                ctx.moveTo(0, -enemy.radius);
                ctx.lineTo(enemy.radius, 0);
                ctx.lineTo(0, enemy.radius);
                ctx.lineTo(-enemy.radius, 0);
                ctx.closePath();
                ctx.fill();
                
                ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(0, -enemy.radius); ctx.lineTo(0, enemy.radius); ctx.stroke();
            }

        } else {
            if (enemy.type === 'BOSS') {
                ctx.shadowColor = '#d8b4fe'; ctx.shadowBlur = 20;
                ctx.fillStyle = '#000';
                ctx.beginPath(); ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.arc(0, 0, enemy.radius - 5, 0, Math.PI * 2); ctx.stroke();
            } else {
                ctx.fillStyle = '#000';
                ctx.beginPath();
                for(let i=0; i<=20; i++) {
                    const angle = (Math.PI*2/20) * i;
                    const wobble = Math.sin(time * 0.5 + i) * 3;
                    const r = enemy.radius + wobble;
                    ctx.lineTo(Math.cos(angle)*r, Math.sin(angle)*r);
                }
                ctx.closePath();
                ctx.fill();
                
                ctx.fillStyle = enemy.type === 'TANK' ? '#7f1d1d' : (enemy.type === 'FAST' ? '#4c1d95' : '#be123c');
                ctx.beginPath(); ctx.arc(0, 0, enemy.radius * 0.5, 0, Math.PI*2); ctx.fill();
            }
        }

        ctx.restore();
    };

    const render = () => {
      if (gameState === GameState.PLAYING) {
          frameRef.current++;
          
          if (skillCooldownRef.current > 0) skillCooldownRef.current--;
          if (skillDurationRef.current > 0) {
              skillDurationRef.current--;
              if (skillDurationRef.current === 0) {
                  if (currentSkin.effectType === 'GHOST') playerRef.current.speed = baseSpeed;
              }
          }
          setSkillCooldownDisplay(Math.ceil(skillCooldownRef.current / 60));
          
          if (shakeIntensityRef.current > 0) {
              shakeIntensityRef.current -= 0.5;
              if (shakeIntensityRef.current < 0) shakeIntensityRef.current = 0;
          }
          
          const boss = enemiesRef.current.find(e => e.type === 'BOSS');
          if (boss && !currentBoss) setCurrentBoss(boss);
          if (!boss && currentBoss) setCurrentBoss(null);
      }
      
      const totalSeconds = Math.floor(frameRef.current / 60);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setGameTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

      if (totalSeconds >= 180 && !waveWarningShownRef.current.has(180)) {
          waveWarningShownRef.current.add(180);
          setWaveWarning("거대한 좀비 무리가 접근 중입니다!");
          setTimeout(() => setWaveWarning(null), 2000);
      }
      if (totalSeconds >= 420 && !waveWarningShownRef.current.has(420)) {
          waveWarningShownRef.current.add(420);
          setWaveWarning("거대한 좀비 무리가 접근 중입니다!");
          setTimeout(() => setWaveWarning(null), 2000);
      }
      
      const spawnBoss = (typeId: number) => {
          spawnEnemy(1, true, typeId); 
          bossSpawnedRef.current.add(totalSeconds); 
          playSound('boss_spawn');
          setShowBossWarning(true);
          playSound('warning');
          setTimeout(() => setShowBossWarning(false), 3000);
      }

      if (!bossSpawnedRef.current.has(totalSeconds) && totalSeconds === 300) { spawnBoss(1); }
      if (!bossSpawnedRef.current.has(totalSeconds) && totalSeconds === 600) { spawnBoss(2); }

      if (gameState === GameState.PLAYING) {
          let dx = 0;
          let dy = 0;
          const keys = keysPressedRef.current;
          
          if (keys['w'] || keys['arrowup'] || keys['ㅈ']) dy -= 1;
          if (keys['s'] || keys['arrowdown'] || keys['ㄴ']) dy += 1;
          if (keys['a'] || keys['arrowleft'] || keys['ㅁ']) dx -= 1;
          if (keys['d'] || keys['arrowright'] || keys['ㅇ']) dx += 1;

          let final_x = dx;
          let final_y = dy;

          if (final_x === 0 && final_y === 0) {
              final_x = joystickVectorRef.current.x;
              final_y = joystickVectorRef.current.y;
          }

          const mag = Math.sqrt(final_x**2 + final_y**2);
          if (mag > 0) {
              inputVectorRef.current = { x: final_x / mag, y: final_y / mag };
          } else {
              inputVectorRef.current = { x: 0, y: 0 };
          }
          
          const player = playerRef.current;
          player.position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
          const worldVelocity = { x: -inputVectorRef.current.x * player.speed, y: -inputVectorRef.current.y * player.speed };

          worldOffsetRef.current.x += worldVelocity.x;
          worldOffsetRef.current.y += worldVelocity.y;

          if (inputVectorRef.current.x !== 0 || inputVectorRef.current.y !== 0) {
              const mag = Math.sqrt(inputVectorRef.current.x**2 + inputVectorRef.current.y**2);
              if (mag > 0) {
                lastFacingDirRef.current = { x: inputVectorRef.current.x / mag, y: inputVectorRef.current.y / mag };
              }
          }
          
          const skinType = currentSkin.effectType;
          
          if (skinType === 'LIGHTNING' && frameRef.current % 60 === 0) {
              const targets = enemiesRef.current.filter(e => getDistance(player.position, e.position) < 300);
              if (targets.length > 0) {
                  const target = targets[Math.floor(Math.random() * targets.length)];
                  const damage = initialStats.attack * player.damageMulti * 3;
                  target.hp -= damage;
                  damageNumbersRef.current.push({
                      id: Math.random().toString(), position: target.position, value: Math.floor(damage), opacity: 1, life: 30, isCritical: true
                  });
                  particlesRef.current.push({
                      id: Math.random().toString(),
                      position: target.position,
                      velocity: {x:0, y:0},
                      color: '#facc15',
                      life: 10,
                      maxLife: 10,
                      size: 2,
                      type: 'LIGHTNING'
                  });
              }
          }

          if (skinType === 'VOID') {
              enemiesRef.current.forEach(e => {
                  const dist = getDistance(player.position, e.position);
                  if (dist < 150) {
                      const angle = Math.atan2(player.position.y - e.position.y, player.position.x - e.position.x);
                      e.position.x += Math.cos(angle) * 2; 
                      e.position.y += Math.sin(angle) * 2;
                      if (frameRef.current % 10 === 0) {
                          e.hp -= (initialStats.attack * player.damageMulti * 0.2);
                      }
                  }
              });
          }

          if (skinType === 'MECHA' && frameRef.current % 300 === 0) { 
              const targets = enemiesRef.current;
              if (targets.length > 0) {
                  const target = targets[Math.floor(Math.random() * targets.length)];
                  particlesRef.current.push({
                      id: Math.random().toString(),
                      position: { x: target.position.x, y: 0 }, 
                      velocity: {x:0, y:0},
                      color: 'blue',
                      life: 30,
                      maxLife: 30,
                      size: 100, 
                      type: 'ORBITAL_LASER'
                  });
                  enemiesRef.current.forEach(e => {
                      if (Math.abs(e.position.x - target.position.x) < 50) {
                          e.hp -= (initialStats.attack * player.damageMulti * 10);
                          damageNumbersRef.current.push({
                              id: Math.random().toString(), position: e.position, value: 9999, opacity: 1, life: 40, isCritical: true
                          });
                      }
                  });
                  playSound('explosion');
              }
          }

          if (skinType === 'FIRE') {
              const ringRadius = 120 + Math.sin(frameRef.current * 0.05) * 20;
              if (frameRef.current % 5 === 0) {
                  enemiesRef.current.forEach(e => {
                      const dist = getDistance(player.position, e.position);
                      if (Math.abs(dist - ringRadius) < 20) {
                          e.hp -= (initialStats.attack * player.damageMulti * 0.5);
                      }
                  });
              }
          }

          if (frameRef.current % ENEMY_SPAWN_RATE === 0) spawnEnemy(Math.min(5, 1 + Math.floor(scoreRef.current / 20000)));

          const isWaveTime = (totalSeconds >= 180 && totalSeconds < 240) || (totalSeconds >= 420 && totalSeconds < 480);
          if (isWaveTime && frameRef.current % 15 === 0) {
              spawnEnemy(3, false, 0, true);
          }

          if (frameRef.current > 0 && frameRef.current % (60 * 25) === 0 && supplyCratesRef.current.length < 3) spawnSupplyCrate();

          const guardianLevel = player.skills['guardian'] || 0;
          if (guardianLevel > 0) {
              const isEvo = guardianLevel >= 6;
              const bladeCount = isEvo ? 6 : (guardianLevel + 1);
              const orbitRadius = isEvo ? 100 : 70;
              const rotationSpeed = isEvo ? 0.08 : 0.05;
              const currentRotation = frameRef.current * rotationSpeed;
              
              for (let i = 0; i < bladeCount; i++) {
                  const angle = currentRotation + (i * (Math.PI * 2 / bladeCount));
                  const bx = player.position.x + Math.cos(angle) * orbitRadius;
                  const by = player.position.y + Math.sin(angle) * orbitRadius;
                  
                  [...enemiesRef.current, ...supplyCratesRef.current].forEach(target => {
                      const dist = Math.sqrt(Math.pow(bx - target.position.x, 2) + Math.pow(by - target.position.y, 2));
                      if (dist < (isEvo ? 25 : 20) + target.radius) {
                           if ('type' in target) { 
                               const pushFactor = target.type === 'BOSS' ? 0.5 : 5;
                               const pushAngle = Math.atan2(target.position.y - player.position.y, target.position.x - player.position.x);
                               target.position.x += Math.cos(pushAngle) * pushFactor;
                               target.position.y += Math.sin(pushAngle) * pushFactor;
                           }
                           
                           const isCrit = Math.random() < player.critChance;
                           const damage = player.damageMulti * 10 * (isEvo ? 2 : 1) * (isCrit ? player.critDamageMulti : 1);
                           target.hp -= damage;
                           
                           if (frameRef.current % 5 === 0) {
                               damageNumbersRef.current.push({
                                   id: Math.random().toString(),
                                   position: { x: target.position.x, y: target.position.y },
                                   value: Math.floor(damage), opacity: 1, life: 30, isCritical: isCrit
                               });
                           }
                      }
                  });
              }
          }

          if (frameRef.current - lastShotTimeRef.current > (30 / player.attackSpeedMulti)) {
              player.weapons.forEach(weapon => {
                  if (weapon === WeaponType.GUARDIAN) return;
                  
                  let weaponVisualId = 'kunai';
                  if (weapon === WeaponType.KUNAI) {
                      if (player.skills['katana']) weaponVisualId = 'katana';
                      else weaponVisualId = 'kunai';
                  } else if (weapon === WeaponType.SHOTGUN) {
                      if (player.skills['revolver']) weaponVisualId = 'revolver';
                      else weaponVisualId = 'shotgun';
                  } else if (weapon === WeaponType.BAT) {
                      weaponVisualId = 'bat';
                  }

                  const skillId = weaponVisualId;
                  const level = player.skills[skillId] || 1;
                  const isEvo = level >= 6;
                  
                  let targetPos: Vector2 | null = null;
                  let minDist = Infinity;
                  
                  [...enemiesRef.current, ...supplyCratesRef.current].forEach(e => {
                      const d = getDistance(player.position, e.position);
                      if (d < minDist) { minDist = d; targetPos = e.position; }
                  });

                  let dir = { ...lastFacingDirRef.current };
                  if (targetPos) {
                      const angle = Math.atan2(targetPos.y - player.position.y, targetPos.x - player.position.x);
                      dir = { x: Math.cos(angle), y: Math.sin(angle) };
                  }

                  const baseDamage = initialStats.attack * player.damageMulti;
                  let shots = 1, spread = 0, speed = 12, duration = 120, delayBetweenShots = 0;
                  let radius = 5, color = '#fff', weaponDamage = baseDamage, penetration = 1;

                  if (weaponVisualId === 'kunai') {
                      shots = 1 + (level - 1) + (player.skills['multi_shot'] || 0);
                      if (isEvo) shots += 2;
                      speed = 18; color = isEvo ? '#8b5cf6' : '#2dd4bf'; 
                      delayBetweenShots = 3; duration = 80; penetration = isEvo ? 2 : 1;
                  } else if (weaponVisualId === 'katana') {
                      shots = 1 + (player.skills['multi_shot'] || 0);
                      speed = 10; duration = 40; radius = 20;
                      penetration = 999; 
                      weaponDamage = baseDamage * 1.2;
                      if(isEvo) { weaponDamage *= 1.5; speed = 12; }
                  } else if (weaponVisualId === 'shotgun') {
                      shots = 3 + (level - 1) + (player.skills['multi_shot'] || 0);
                      if (isEvo) { shots += 5; delayBetweenShots = 2; spread = 0.1; }
                      else { spread = 0.2; delayBetweenShots = 0; }
                      speed = 12; duration = 45; color = isEvo ? '#ef4444' : '#facc15';
                      weaponDamage = baseDamage * 0.7; penetration = 1;
                  } else if (weaponVisualId === 'revolver') {
                      shots = 1 + (level > 3 ? 1 : 0) + (player.skills['multi_shot'] || 0);
                      speed = 25; duration = 60; 
                      weaponDamage = baseDamage * 2.0;
                      penetration = isEvo ? 999 : 2;
                      delayBetweenShots = 10;
                  } else if (weaponVisualId === 'bat') {
                      shots = 1 + (level - 1) + (player.skills['multi_shot'] || 0);
                      if (isEvo) shots = Math.floor(shots * 1.5);
                      speed = 8; duration = 15; radius = 30; color = '#fff';
                      delayBetweenShots = 5; weaponDamage = baseDamage * 1.5; penetration = 999;
                  }

                  playSound('shoot');
                  for (let i = 0; i < shots; i++) {
                      let finalDir = { ...dir };
                      if (weaponVisualId === 'shotgun' || weaponVisualId === 'bat') {
                          const angleOffset = (i - (shots - 1) / 2) * (weaponVisualId === 'bat' ? 0.3 : spread);
                          const baseAngle = Math.atan2(dir.y, dir.x);
                          finalDir = { x: Math.cos(baseAngle + angleOffset), y: Math.sin(baseAngle + angleOffset) };
                      } else if (weaponVisualId === 'shotgun' && isEvo) {
                           const angleOffset = (Math.random() - 0.5) * 0.1;
                           finalDir = { x: Math.cos(Math.atan2(dir.y, dir.x) + angleOffset), y: Math.sin(Math.atan2(dir.y, dir.x) + angleOffset) };
                      }

                      const isCrit = Math.random() < player.critChance;
                      const finalDamage = weaponDamage * (isCrit ? player.critDamageMulti : 1);
                      
                      pendingShotsRef.current.push({
                          delay: i * delayBetweenShots,
                          velocity: { x: finalDir.x * speed, y: finalDir.y * speed },
                          damage: finalDamage,
                          color: color, radius, isEvo, duration, penetration, 
                          weaponId: weaponVisualId
                      });
                  }
              });
              lastShotTimeRef.current = frameRef.current;
          }

          for (let i = pendingShotsRef.current.length - 1; i >= 0; i--) {
              const shot = pendingShotsRef.current[i];
              if (shot.delay <= 0) {
                  projectilesRef.current.push({
                      id: Math.random().toString(),
                      position: { ...player.position },
                      velocity: shot.velocity,
                      radius: shot.radius, color: shot.color, damage: shot.damage,
                      duration: shot.duration, penetration: shot.penetration, isEvo: shot.isEvo,
                      weaponId: shot.weaponId
                  });
                  pendingShotsRef.current.splice(i, 1);
              } else {
                  shot.delay--;
              }
          }

          [...enemiesRef.current, ...gemsRef.current, ...projectilesRef.current, ...particlesRef.current, ...supplyCratesRef.current, ...itemDropsRef.current, ...treasureChestsRef.current, ...damageNumbersRef.current].forEach(e => {
              e.position.x += worldVelocity.x;
              e.position.y += worldVelocity.y;
          });

          for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
              const p = projectilesRef.current[i];
              p.position.x += p.velocity.x;
              p.position.y += p.velocity.y;
              p.duration--;
              
              if (p.duration <= 0) { projectilesRef.current.splice(i, 1); continue; }

              for (let j = [...enemiesRef.current, ...supplyCratesRef.current].length - 1; j >= 0; j--) {
                  const target = [...enemiesRef.current, ...supplyCratesRef.current][j];
                  const dist = getDistance(p.position, target.position);
                  if (dist < p.radius + target.radius) {
                      const isCrit = Math.random() < player.critChance;
                      const damageDealt = p.damage * (isCrit ? player.critDamageMulti : 1);
                      target.hp -= damageDealt;
                      p.penetration--;
                      
                      damageNumbersRef.current.push({
                          id: Math.random().toString(),
                          position: { x: target.position.x, y: target.position.y },
                          value: Math.floor(damageDealt), opacity: 1, life: 30, isCritical: isCrit
                      });

                      if (p.penetration <= 0) { projectilesRef.current.splice(i, 1); break; }
                  }
              }
          }

          for (let i = supplyCratesRef.current.length - 1; i >= 0; i--) {
              const crate = supplyCratesRef.current[i];
              if (crate.hp <= 0) {
                  playSound('explosion');
                  triggerShake(5);
                  createDeathEffect(crate.position, 'PIXEL');
                  const roll = Math.random();
                  let dropType: ItemDropType;
                  let value: number | undefined;

                  if (roll < 0.33) { dropType = ItemDropType.MAGNET; }
                  else if (roll < 0.66) { dropType = ItemDropType.BOMB; } 
                  else { 
                      dropType = ItemDropType.GOLD;
                      const goldAmounts = [10, 50, 100, 250];
                      value = goldAmounts[Math.floor(Math.random() * goldAmounts.length)];
                  }
                  
                  itemDropsRef.current.push({
                      id: Math.random().toString(),
                      position: crate.position,
                      radius: 20,
                      color: 'white',
                      type: dropType,
                      value: value,
                      life: 600,
                  });
                  supplyCratesRef.current.splice(i, 1);
              }
          }

          const isSkillInvincible = skillDurationRef.current > 0 && currentSkin.effectType === 'GHOST';
          isInvincibleRef.current = (frameRef.current - lastHitTimeRef.current < 30) || isSkillInvincible; 

          for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
              const enemy = enemiesRef.current[i];
              const angle = Math.atan2(player.position.y - enemy.position.y, player.position.x - enemy.position.x);
              enemy.position.x += Math.cos(angle) * enemy.speed;
              enemy.position.y += Math.sin(angle) * enemy.speed;

              if (getDistance(player.position, enemy.position) < player.radius + enemy.radius) {
                  let dodgeChance = 0;
                  if (currentSkin.effectType === 'PIXEL') dodgeChance = 0.15;

                  if (!isInvincibleRef.current) {
                      if (Math.random() > dodgeChance) {
                          playSound('hit');
                          triggerShake(3);
                          lastHitTimeRef.current = frameRef.current;
                          setHp(prev => {
                              const next = prev - enemy.damage;
                              if (next <= 0) onGameOver(scoreRef.current, false, playerRef.current.level);
                              return next;
                          });
                      } else {
                          damageNumbersRef.current.push({
                              id: Math.random().toString(), position: player.position, value: 0, opacity: 1, life: 30, isCritical: false
                          });
                      }
                  }
              }

              if (enemy.hp <= 0) {
                  killEnemy(enemy); 
                  enemiesRef.current.splice(i, 1);
              }
          }

          for (let i = itemDropsRef.current.length - 1; i >= 0; i--) {
              const drop = itemDropsRef.current[i];
              drop.life--;
              if (getDistance(player.position, drop.position) < player.radius + drop.radius) {
                  if (drop.type === ItemDropType.MAGNET) {
                      playSound('powerup');
                      gemsRef.current.forEach(g => g.isForcePulled = true);
                  }
                  if (drop.type === ItemDropType.BOMB) {
                      playSound('explosion');
                      triggerShake(10);
                      enemiesRef.current.forEach(e => { if (e.type !== 'BOSS') killEnemy(e, true); });
                      enemiesRef.current = enemiesRef.current.filter(e => e.type === 'BOSS');
                  }
                  if (drop.type === ItemDropType.GOLD && drop.value) {
                      playSound('coin');
                      onGoldGained(drop.value);
                      damageNumbersRef.current.push({id: Math.random().toString(), position: drop.position, value: drop.value, opacity: 1, life: 60, isCritical: false, isGold: true});
                  }
                  itemDropsRef.current.splice(i, 1);
              } else if (drop.life <= 0) {
                  itemDropsRef.current.splice(i, 1);
              }
          }
          
          for (let i = gemsRef.current.length - 1; i >= 0; i--) {
              const gem = gemsRef.current[i];
              const dist = getDistance(player.position, gem.position);
              
              if (dist < player.magnetRadius || gem.isForcePulled) {
                  const angle = Math.atan2(player.position.y - gem.position.y, player.position.x - gem.position.x);
                  const speed = gem.isForcePulled ? 25 : 12;
                  gem.position.x += Math.cos(angle) * speed;
                  gem.position.y += Math.sin(angle) * speed;
              }

              if (dist < player.radius + gem.radius) {
                  playSound('gem');
                  player.xp += gem.value;
                  setXpProgress((player.xp / player.nextLevelXp) * 100);
                  gemsRef.current.splice(i, 1);

                  if (player.xp >= player.nextLevelXp) {
                      playSound('levelup');
                      player.level++;
                      player.xp = 0;
                      player.nextLevelXp = Math.floor(player.nextLevelXp * 1.25);
                      setLevel(player.level);
                      setXpProgress(0);
                      setGameState(GameState.PAUSED);
                      generateUpgradeOptions();
                  }
              }
          }
          
          for (let i = treasureChestsRef.current.length - 1; i >= 0; i--) {
              const chest = treasureChestsRef.current[i];
              if (getDistance(player.position, chest.position) < player.radius + chest.radius) {
                  playSound('treasure_open');
                  generateTreasureRewards();
                  setGameState(GameState.TREASURE_OPENING);
                  treasureChestsRef.current.splice(i, 1);
              }
          }
      }

      ctx.fillStyle = chapterTheme.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const shakeX = (Math.random() - 0.5) * shakeIntensityRef.current;
      const shakeY = (Math.random() - 0.5) * shakeIntensityRef.current;
      
      ctx.save();
      ctx.translate(shakeX, shakeY);

      const gridSize = 50;
      const offsetX = worldOffsetRef.current.x % gridSize;
      const offsetY = worldOffsetRef.current.y % gridSize;
      
      ctx.strokeStyle = chapterTheme.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let x = offsetX; x < canvas.width; x += gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
      for(let y = offsetY; y < canvas.height; y += gridSize) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
      ctx.stroke();

      gemsRef.current.forEach(gem => {
          ctx.fillStyle = COLORS.GEM;
          ctx.shadowColor = COLORS.GEM;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(gem.position.x, gem.position.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
      });

      treasureChestsRef.current.forEach(chest => drawTreasureChest(ctx, chest));
      supplyCratesRef.current.forEach(crate => drawSupplyCrate(ctx, crate));
      itemDropsRef.current.forEach(drop => drawItemDrop(ctx, drop));

      projectilesRef.current.forEach(p => {
          drawProjectile(ctx, p);
      });
      
      if (playerRef.current.skills['guardian'] > 0) {
           const isEvo = playerRef.current.skills['guardian'] >= 6;
           const bladeCount = isEvo ? 6 : (playerRef.current.skills['guardian'] + 1);
           const orbitRadius = isEvo ? 100 : 70;
           const rotationSpeed = isEvo ? 0.08 : 0.05;
           const currentRotation = frameRef.current * rotationSpeed;
           for (let i = 0; i < bladeCount; i++) {
                const angle = currentRotation + (i * (Math.PI * 2 / bladeCount));
                const bx = playerRef.current.position.x + Math.cos(angle) * orbitRadius;
                const by = playerRef.current.position.y + Math.sin(angle) * orbitRadius;
                drawGuardian(ctx, bx, by, isEvo);
           }
      }

      drawAura(ctx, playerRef.current);
      
      if (!isInvincibleRef.current || frameRef.current % 4 < 2) {
          drawPlayerSkin(ctx, playerRef.current);
      }

      [...enemiesRef.current, ...supplyCratesRef.current].forEach(target => {
          if ('type' in target) {
              drawEnemy(ctx, target as Enemy);
          } else {
              ctx.fillStyle = target.color;
              ctx.beginPath();
              ctx.arc(target.position.x, target.position.y, target.radius, 0, Math.PI * 2);
              ctx.fill();
          }
          
          if ('type' in target && (target as Enemy).type === 'BOSS') {
              ctx.fillStyle = 'white'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
              ctx.fillText('BOSS', target.position.x, target.position.y - target.radius - 15);
          }

          if (!('type' in target) || (target as Enemy).type !== 'BOSS') {
              const hpBarWidth = ('maxHp' in target ? 30 : 20);
              ctx.fillStyle = '#b91c1c';
              ctx.fillRect(target.position.x - hpBarWidth/2, target.position.y - target.radius - 10, hpBarWidth, 4);
              ctx.fillStyle = '#4ade80';
              ctx.fillRect(target.position.x - hpBarWidth/2, target.position.y - target.radius - 10, hpBarWidth * (target.hp / target.maxHp), 4);
          }
      });
      
      drawParticles(ctx, gameState !== GameState.PLAYING);

      ctx.restore(); 

      ctx.textAlign = 'center';
      for (let i = damageNumbersRef.current.length - 1; i >= 0; i--) {
          const d = damageNumbersRef.current[i];
          ctx.font = d.isCritical ? 'bold 24px Arial' : 'bold 16px Arial';
          ctx.fillStyle = d.isGold ? `rgba(251, 191, 36, ${d.opacity})` : (d.isCritical ? `rgba(250, 204, 21, ${d.opacity})` : `rgba(255, 255, 255, ${d.opacity})`);
          const text = d.isGold ? `+${d.value}G` : d.value.toString();
          ctx.fillText(text, d.position.x, d.position.y);
          
          if (gameState === GameState.PLAYING) {
              d.position.y -= 0.5;
              d.life--;
              d.opacity = d.life / 30;
              if (d.life <= 0) damageNumbersRef.current.splice(i, 1);
          }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => { cancelAnimationFrame(animationFrameId); };
  }, [gameState, initialStats, onGameOver, currentSkin, playSound, chapterTheme, chapterId]);

  const generateUpgradeOptions = () => {
      const allUpgrades = [...UPGRADE_DEFINITIONS];
      const available = allUpgrades.filter(u => (playerRef.current.skills[u.id] || 0) < 6);
      const MAIN_WEAPON_IDS = ['kunai', 'shotgun', 'bat'];
      const filtered = available.filter(u => {
          if (MAIN_WEAPON_IDS.includes(u.id)) {
              return u.id === mainWeaponId;
          }
          return true;
      });
      const shuffled = filtered.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3).map((u): UpgradeOption => {
          const lvl = playerRef.current.skills[u.id] || 0;
          return {
              id: u.id,
              name: u.name,
              description: lvl === 5 ? 'Ultimate Upgrade!' : u.description,
              icon: u.icon,
              type: u.type as UpgradeOption['type'],
              rarity: u.rarity as UpgradeOption['rarity'],
              currentLevel: lvl,
              isEvo: lvl === 5,
              title: lvl === 5 ? 'EVOLUTION!' : (lvl === 0 ? 'NEW!' : `Level Up!`),
          };
      });
      setUpgradeOptions(selected);
  };

  const generateTreasureRewards = () => {
      const allUpgrades = [...UPGRADE_DEFINITIONS];
      const available = allUpgrades.filter(u => (playerRef.current.skills[u.id] || 0) < 6);
      const shuffled = available.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5).map((u): UpgradeOption => ({
        id: u.id,
        name: u.name,
        description: u.description,
        icon: u.icon,
        type: u.type as UpgradeOption['type'],
        rarity: u.rarity as UpgradeOption['rarity'],
        currentLevel: playerRef.current.skills[u.id] || 0,
        isEvo: (playerRef.current.skills[u.id] || 0) === 5,
        title: 'BONUS!',
      }));
      setTreasureRewards(selected);
  };
  
  const applyUpgrade = (option: UpgradeOption) => {
      const p = playerRef.current;
      const currentLvl = p.skills[option.id] || 0;
      p.skills[option.id] = currentLvl + 1;
      
      if (option.id === 'atk_up') p.damageMulti += 0.2;
      if (option.id === 'spd_up') p.speed += (PLAYER_BASE_SPEED * 0.15);
      if (option.id === 'atk_spd_up') p.attackSpeedMulti += 0.15;
      if (option.id === 'hp_up') {
          const ratio = p.hp / p.maxHp;
          p.maxHp *= 1.3;
          p.hp = p.maxHp * ratio;
          setMaxHp(p.maxHp);
          setHp(p.hp);
      }
      if (option.id === 'multi_shot') p.projectileCount += 1;
      if (option.id === 'magnet_core') p.magnetRadius *= 1.5;
      if (option.id === 'crit_chance_up') p.critChance += 0.1;
      if (option.id === 'crit_damage_up') p.critDamageMulti += 0.5;
  };

  const handleUpgradeSelect = (option: UpgradeOption) => {
      playSound('click');
      applyUpgrade(option);
      setGameState(GameState.PLAYING);
  };

  const handleClaimTreasure = () => {
      playSound('click');
      treasureRewards.forEach(reward => applyUpgrade(reward));
      setTreasureRewards([]);
      setGameState(GameState.PLAYING);
  }

  const handleJoystickMove = (vec: Vector2) => { joystickVectorRef.current = vec; };
  const handleJoystickStop = () => { joystickVectorRef.current = { x: 0, y: 0 }; };

  const handlePause = () => {
      playSound('click');
      setGameState(GameState.STATUS_MENU);
  };

  const handleResume = () => {
      playSound('click');
      setGameState(GameState.PLAYING);
  };

  const iconMap: { [key: string]: React.FC<any> } = {
    Sword, Heart, Zap, Shield, Activity, Footprints, Copy, Star
  };

  const renderStatusMenu = () => {
      const player = playerRef.current;
      const weaponSkills = Object.entries(player.skills).filter(([id, _]) => {
          const def = UPGRADE_DEFINITIONS.find(u => u.id === id);
          return def?.type === 'WEAPON';
      });
      const passiveSkills = Object.entries(player.skills).filter(([id, _]) => {
          const def = UPGRADE_DEFINITIONS.find(u => u.id === id);
          return def?.type === 'STAT';
      });

      return (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in duration-200">
              <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-lg border border-gray-600 shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-4">
                      <h2 className="text-2xl font-black text-white italic">일시정지</h2>
                      <div className="flex items-center gap-2">
                          <button onClick={handleResume} className="bg-green-600 hover:bg-green-500 text-white font-bold p-2 rounded-lg">
                              <Play className="w-6 h-6 fill-current" />
                          </button>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                      <div>
                          <h3 className="text-sm text-gray-400 font-bold mb-2 uppercase tracking-wider">Weapons</h3>
                          <div className="grid grid-cols-4 gap-3">
                              {weaponSkills.map(([id, level]) => {
                                  const def = UPGRADE_DEFINITIONS.find(u => u.id === id);
                                  if (!def) return null;
                                  const Icon = iconMap[def.icon] || Sword;
                                  const lvl = level as number;
                                  const isEvo = lvl >= 6; 
                                  return (
                                      <div key={id} className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative bg-gray-700 ${isEvo ? 'border-red-500 shadow-[0_0_10px_#ef4444]' : 'border-gray-600'}`}>
                                          <Icon className={`w-8 h-8 ${isEvo ? 'text-red-400' : 'text-gray-300'}`} />
                                          {isEvo && <div className="absolute -top-2 -right-2 text-[10px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded-full">EVO</div>}
                                          <div className="absolute bottom-1 flex gap-0.5">
                                              {Array.from({length: 5}).map((_, i) => (
                                                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < (isEvo ? 5 : lvl) ? 'bg-yellow-400' : 'bg-gray-600'}`} />
                                              ))}
                                          </div>
                                      </div>
                                  )
                              })}
                              {Array.from({length: Math.max(0, 6 - weaponSkills.length)}).map((_, i) => (
                                  <div key={`empty-w-${i}`} className="aspect-square rounded-xl border border-gray-700 bg-gray-800/50 flex items-center justify-center">
                                      <div className="w-8 h-8 text-gray-700"><Sword className="opacity-20"/></div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div>
                          <h3 className="text-sm text-gray-400 font-bold mb-2 uppercase tracking-wider">Supplies</h3>
                          <div className="grid grid-cols-4 gap-3">
                              {passiveSkills.map(([id, level]) => {
                                  const def = UPGRADE_DEFINITIONS.find(u => u.id === id);
                                  if (!def) return null;
                                  const Icon = iconMap[def.icon] || Activity;
                                  const lvl = level as number;
                                  return (
                                      <div key={id} className="aspect-square rounded-xl border-2 border-gray-600 flex flex-col items-center justify-center relative bg-gray-700">
                                          <Icon className="w-8 h-8 text-gray-300" />
                                          <div className="absolute bottom-1 flex gap-0.5">
                                              {Array.from({length: 5}).map((_, i) => (
                                                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < lvl ? 'bg-yellow-400' : 'bg-gray-600'}`} />
                                              ))}
                                          </div>
                                      </div>
                                  )
                              })}
                              {Array.from({length: Math.max(0, 6 - passiveSkills.length)}).map((_, i) => (
                                  <div key={`empty-p-${i}`} className="aspect-square rounded-xl border border-gray-700 bg-gray-800/50 flex items-center justify-center">
                                      <div className="w-8 h-8 text-gray-700"><Box className="opacity-20"/></div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-700">
                          <h3 className="text-sm text-gray-400 font-bold mb-3 uppercase tracking-wider">Current Stats</h3>
                          <div className="grid grid-cols-2 gap-y-2 text-sm">
                              <div className="flex justify-between px-2"><span className="text-gray-400">ATK</span> <span className="font-bold text-white">{Math.floor(initialStats.attack * player.damageMulti)}</span></div>
                              <div className="flex justify-between px-2"><span className="text-gray-400">HP</span> <span className="font-bold text-white">{Math.floor(hp)} / {Math.floor(maxHp)}</span></div>
                              <div className="flex justify-between px-2"><span className="text-gray-400">Speed</span> <span className="font-bold text-white">{player.speed.toFixed(1)}</span></div>
                              <div className="flex justify-between px-2"><span className="text-gray-400">Crit</span> <span className="font-bold text-yellow-400">{(player.critChance * 100).toFixed(0)}%</span></div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col gap-3">
                      <button onClick={handleResume} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all">
                          계속하기
                      </button>
                      <button onClick={() => onGameOver(scoreRef.current, false, level)} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-colors">
                          종료하기
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  const ActiveSkillButton = () => {
      if (!currentSkin.activeSkill) {
          return (
              <div className="absolute bottom-12 right-12 w-20 h-20 rounded-full bg-gray-800/80 border-2 border-gray-600 flex items-center justify-center pointer-events-none opacity-50 shadow-lg">
                  <LockIcon className="w-8 h-8 text-gray-500" />
              </div>
          );
      }

      const skill = currentSkin.activeSkill;
      const Icon = skillIcons[skill.iconName] || Zap;
      const isCooldown = skillCooldownDisplay > 0;

      return (
          <div 
            className="absolute bottom-12 right-12 w-24 h-24 rounded-full flex items-center justify-center z-40 touch-none active:scale-95 transition-transform"
            onTouchStart={(e) => { e.preventDefault(); handleSkillTrigger(); }}
            onMouseDown={(e) => { e.preventDefault(); handleSkillTrigger(); }}
          >
              <div className="absolute inset-[-4px] rounded-full animate-pulse" style={{ backgroundColor: skill.visualColor, opacity: 0.5 }}></div>
              <div 
                className="w-full h-full rounded-full border-4 flex items-center justify-center relative overflow-hidden bg-gray-900 shadow-2xl"
                style={{ borderColor: skill.visualColor }}
              >
                  <div className="absolute inset-0 opacity-20" style={{ backgroundColor: skill.visualColor }}></div>
                  <Icon 
                    className={`w-12 h-12 relative z-10 transition-all ${isCooldown ? 'text-gray-500' : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]'}`} 
                    strokeWidth={2}
                  />
                  {isCooldown && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                          <span className="text-white font-black text-2xl animate-pulse">{skillCooldownDisplay}</span>
                      </div>
                  )}
              </div>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white border border-gray-600">
                  {skill.name}
              </div>
          </div>
      );
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="block" />
      
      {showBossWarning && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-900/40 animate-[pulse_0.5s_infinite] pointer-events-none">
              <div className="flex flex-col items-center">
                  <AlertTriangle className="w-24 h-24 text-red-500 animate-bounce" />
                  <h1 className="text-6xl font-black text-red-500 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)] italic tracking-widest mt-4 animate-pulse">WARNING</h1>
                  <p className="text-white font-bold text-2xl mt-2 tracking-widest uppercase">Boss Approaching</p>
              </div>
          </div>
      )}

      {currentBoss && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[80%] max-w-2xl z-40 flex flex-col items-center pointer-events-none animate-in slide-in-from-top-10 fade-in duration-500">
              <div className="flex items-center gap-2 mb-1">
                  <Skull className="w-6 h-6 text-red-500" />
                  <span className="font-black text-red-500 text-xl drop-shadow-md">BOSS</span>
              </div>
              <div className="w-full h-6 bg-black/80 rounded-full border-2 border-red-900 overflow-hidden relative shadow-2xl">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-red-800 via-red-600 to-red-500 transition-all duration-200"
                    style={{ width: `${(currentBoss.hp / currentBoss.maxHp) * 100}%` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
              </div>
              <span className="text-white font-bold text-sm mt-1 drop-shadow-lg">{(currentBoss.hp / currentBoss.maxHp * 100).toFixed(1)}%</span>
          </div>
      )}
      
      {waveWarning && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
            <div className="bg-black/80 text-white font-black text-2xl md:text-3xl px-8 py-4 rounded-xl border-2 border-yellow-500 shadow-lg flex items-center gap-4"
                 style={{ animation: 'pulse-and-fade 2s ease-out forwards' }}>
                <AlertTriangle className="w-8 h-8 text-yellow-500" /> {waveWarning} <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
        </div>
      )}
      
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <div className="flex flex-col gap-1 w-1/3">
              <div className="h-4 bg-gray-800 rounded-full border border-gray-600 overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-300" style={{ width: `${(hp / maxHp) * 100}%` }}></div>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
                      {Math.ceil(hp)} / {Math.ceil(maxHp)}
                  </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full border border-gray-600 overflow-hidden relative mt-1">
                  <div className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300" style={{ width: `${xpProgress}%` }}></div>
              </div>
              <div className="text-white font-bold text-sm drop-shadow-md">LV. {level}</div>
          </div>

          <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-2 flex items-center gap-1 bg-black/40 px-3 py-1 rounded-full border border-gray-500">
               <Clock className="w-4 h-4 text-white" />
               <span className="font-mono text-xl font-bold text-white tracking-widest">{gameTime}</span>
          </div>
          
          <div className="flex items-center gap-2 pointer-events-auto">
              <div className="text-white font-black text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] hidden sm:block">
                  {score.toLocaleString()}
              </div>
              <button onClick={handlePause} className="bg-gray-800/80 hover:bg-gray-700 text-white p-2 rounded-lg backdrop-blur-sm border border-gray-600 transition-colors">
                  <Pause className="w-6 h-6 fill-current" />
              </button>
          </div>
      </div>

      <div className="absolute top-20 left-4 bg-black/40 p-2 rounded-lg border border-gray-600 pointer-events-none">
          <Sword className="w-6 h-6 text-white" />
          <span className="text-[10px] text-white font-bold block text-center mt-1">{mainWeaponId.toUpperCase()}</span>
      </div>

      {gameState === GameState.STATUS_MENU && renderStatusMenu()}

      {gameState === GameState.PAUSED && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in zoom-in duration-200">
              <div className="bg-gray-800 p-6 rounded-2xl max-w-md w-full border border-gray-600 shadow-2xl">
                  <h2 className="text-2xl font-black text-yellow-400 text-center mb-6 italic">LEVEL UP!</h2>
                  <div className="space-y-3">
                      {upgradeOptions.map((opt, idx) => {
                        const Icon = iconMap[opt.icon] || Activity;
                        return (
                          <div key={idx} onClick={() => handleUpgradeSelect(opt)} className={`p-4 rounded-xl border-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center gap-4 ${ opt.isEvo ? 'bg-purple-900/50 border-purple-400' : 'bg-gray-700 hover:bg-gray-600 border-gray-500' }`}>
                              <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${ opt.isEvo ? 'bg-purple-600 text-white shadow-[0_0_15px_#a855f7]' : 'bg-gray-800 text-gray-300' }`}>
                                  <Icon />
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                      <h3 className={`font-bold ${opt.isEvo ? 'text-purple-300' : 'text-white'}`}>{opt.name}</h3>
                                      {opt.isEvo ? (<div className="flex items-center gap-1 text-purple-400 text-xs font-black"><Star className="w-3 h-3 fill-current" /> EVO</div>) 
                                      : (<div className="flex gap-0.5">{Array.from({length: 5}).map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full ${i < (opt.currentLevel) ? 'bg-yellow-400' : 'bg-gray-600'}`} />))}<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-1" /></div>)}
                                  </div>
                                  <p className="text-xs text-gray-400">{opt.description}</p>
                              </div>
                          </div>
                        )})}
                  </div>
              </div>
          </div>
      )}
      
      {gameState === GameState.TREASURE_OPENING && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 animate-in fade-in duration-300">
              <div className="bg-gray-800 p-6 rounded-2xl max-w-lg w-full border-2 border-yellow-500 shadow-2xl shadow-yellow-500/20">
                  <div className="flex flex-col items-center mb-6">
                      <Gift className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_10px_#facc15]" />
                      <h2 className="text-3xl font-black text-yellow-300 text-center italic mt-2">TREASURE!</h2>
                      <p className="text-yellow-500 text-sm">보스가 특별한 보상을 남겼습니다!</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                      {treasureRewards.map((opt, idx) => {
                          const Icon = iconMap[opt.icon] || Activity;
                          return (
                              <div key={idx} className="p-3 rounded-xl bg-gray-700 border border-gray-600 flex flex-col items-center gap-2 text-center animate-in zoom-in-50 slide-in-from-bottom-5 duration-500" style={{animationDelay: `${idx*100}ms`}}>
                                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300"><Icon /></div>
                                  <h3 className="font-bold text-white text-xs">{opt.name}</h3>
                              </div>
                          )
                      })}
                  </div>
                  <button onClick={handleClaimTreasure} className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-colors border-b-4 border-yellow-800 active:border-b-0 active:translate-y-1">
                      모두 획득
                  </button>
              </div>
          </div>
      )}

      <Joystick onMove={handleJoystickMove} onStop={handleJoystickStop} />
      <ActiveSkillButton />
    </div>
  );
};

export default Game;
