export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  SHOP = 'SHOP',
  GAME_OVER = 'GAME_OVER',
}

export enum Lane {
  LEFT = -1,
  CENTER = 0,
  RIGHT = 1,
}

export enum ObstacleType {
  TRAIN = 'TRAIN',
  COIN = 'COIN',
}

export interface PlayerState {
  lane: Lane;
  y: number; // Vertical position (jump)
  dy: number; // Vertical velocity
  isJumping: boolean;
  skinId: string;
  runAnimFrame: number; // For limb animation
}

export interface GameEntity {
  id: number;
  type: ObstacleType;
  lane: Lane;
  z: number; // Depth distance
  active: boolean;
  rotation?: number; // For coins
}

export interface Skin {
  id: string;
  name: string;
  price: number;
  color: string;
  accentColor: string;
}

export interface SavedData {
  coins: number;
  unlockedSkins: string[];
  selectedSkin: string;
  highScore: number;
}