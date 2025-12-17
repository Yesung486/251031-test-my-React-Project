// 파일 위치: components/survivor-game/types.ts

export interface Vector2 {
  x: number;
  y: number;
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED', // For level up selection
  STATUS_MENU = 'STATUS_MENU', // For pause/status screen
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
  TREASURE_OPENING = 'TREASURE_OPENING',
}

export interface Entity {
  id: string;
  position: Vector2;
  radius: number;
  color: string;
}

export interface Player extends Entity {
  hp: number;
  maxHp: number;
  speed: number;
  xp: number;
  level: number;
  nextLevelXp: number;
  damageMulti: number;
  attackSpeedMulti: number;
  projectileCount: number;
  critChance: number;
  critDamageMulti: number;
  magnetRadius: number;
  weapons: WeaponType[];
  skills: Record<string, number>;
}

export interface Enemy extends Entity {
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  xpValue: number;
  type: 'ZOMBIE' | 'FAST' | 'TANK' | 'BOSS';
}

export interface Projectile extends Entity {
  velocity: Vector2;
  damage: number;
  duration: number;
  penetration: number;
  isEvo?: boolean;
  weaponId: string;
}

export interface Gem extends Entity {
  value: number;
  isForcePulled?: boolean;
}

export interface TreasureChest extends Entity {
  life: number;
}

export interface SupplyCrate extends Entity {
  hp: number;
  maxHp: number;
}

export enum ItemDropType {
    MAGNET = 'MAGNET',
    BOMB = 'BOMB',
    GOLD = 'GOLD',
}

export interface ItemDrop extends Entity {
    type: ItemDropType;
    value?: number;
    life: number;
}

export interface DamageNumber {
  id:string;
  position: Vector2;
  value: number;
  opacity: number;
  life: number;
  isCritical: boolean;
  isGold?: boolean;
}

export enum WeaponType {
  KUNAI = 'KUNAI',
  SHOTGUN = 'SHOTGUN',
  GUARDIAN = 'GUARDIAN',
  BAT = 'BAT'
}

export interface UpgradeOption {
  id: string;
  title: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  type: 'WEAPON' | 'STAT';
  currentLevel: number;
  isEvo: boolean;
}

export interface Chapter {
  id: number;
  name: string;
  description: string;
  theme: {
    bg: string;
    grid: string;
  };
}

export type Rarity = 'COMMON' | 'MAGIC' | 'EXQUISITE' | 'RARE' | 'EXCELLENT' | 'EPIC' | 'LEGEND' | 'ETERNAL' | 'TRANSCENDENT' | 'GOLDEN' | 'FOREVER';
export type EquipmentType = 'WEAPON' | 'NECKLACE' | 'GLOVES' | 'SUIT' | 'BELT' | 'BOOTS';

export interface InventoryItem {
  id: string;
  type: EquipmentType;
  rarity: Rarity;
  name: string;
}

export interface EquippedState {
  WEAPON: InventoryItem | null;
  NECKLACE: InventoryItem | null;
  GLOVES: InventoryItem | null;
  SUIT: InventoryItem | null;
  BELT: InventoryItem | null;
  BOOTS: InventoryItem | null;
}

export type SkinEffectType = 'NONE' | 'BLOOD' | 'GOLD' | 'PIXEL' | 'VOID' | 'GHOST' | 'MECHA' | 'FIRE' | 'LIGHTNING' | 'ICE' | 'TOXIC' | 'COSMIC' | 'SONIC' | 'DRAGON';

export interface SkinStats {
  attackBonus?: number;
  hpBonus?: number;
  speedBonus?: number;
  critChanceBonus?: number;
  attackSpeedBonus?: number;
}

export interface ActiveSkill {
  name: string;
  description: string;
  cooldown: number;
  iconName: string;
  visualColor: string;
}

export interface Skin {
  id: string;
  name: string;
  description: string;
  price: number;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  effectType: SkinEffectType;
  primaryColor: string;
  stats: SkinStats;
  activeSkill?: ActiveSkill;
}

export interface UserProfile {
  username: string;
  password?: string;
  highScore: number;
  gold: number;
  gems: number;
  keys: number;
  accountLevel: number;
  accountXp: number;
  gachaLevel: number;
  gachaXp: number;
  inventory: InventoryItem[];
  equipped: EquippedState;
  ownedSkins: string[];
  equippedSkinId: string;
  purchasedDaily: string[];
  unlockedChapter: number;
}

export type MergeSummary = { from: InventoryItem, to: InventoryItem, count: number }[];