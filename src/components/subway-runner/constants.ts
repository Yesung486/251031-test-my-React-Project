import { Skin } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const LANE_WIDTH = 160; 
export const HORIZON_Y = 250;
export const FOCAL_LENGTH = 300; 

// Physics
export const GRAVITY = 0.9;
export const JUMP_FORCE = -17; // Good jump height
export const BASE_SPEED = 18;  // Dynamic Speed
export const MAX_SPEED = 50;
export const SPEED_INCREMENT = 0.005;

// Entity Dimensions
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 40; 
export const PLAYER_DEPTH = 40;

// Obstacles: Shortened height (180 -> 70) to allow jumping over
export const TRAIN_SIZE = { w: 80, h: 70, d: 80 }; 
export const COIN_SIZE = 18;

// High Impact Skins
export const SKINS: Skin[] = [
  { 
    id: 'default', 
    name: 'GHOST WALKER', 
    price: 0, 
    color: '#e2e8f0', 
    accentColor: '#94a3b8' 
  },
  { 
    id: 'neon_samurai', 
    name: 'NEON SAMURAI', 
    price: 200, 
    color: '#06b6d4', // Cyan
    accentColor: '#cffafe' 
  },
  { 
    id: 'dragon_fire', 
    name: 'DRAGON FIRE', 
    price: 600, 
    color: '#dc2626', // Red
    accentColor: '#f59e0b' // Amber fire
  },
  { 
    id: 'void_god', 
    name: 'VOID GOD', 
    price: 1500, 
    color: '#020617', // Deepest Black
    accentColor: '#7c3aed' // Violet
  },
];