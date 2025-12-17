export enum GameStatus {
  PLANNING = 'PLANNING',
  RUNNING = 'RUNNING',
  WON = 'WON',
  LOST = 'LOST',
}

export interface Obstacle {
  x: number; // Offset from center
  y: number; // Offset from base height (negative is up)
  w: number;
  h: number;
  isStatic?: boolean; // Default true
  rotation?: number;
}

export type TerrainType = 'DEFAULT' | 'RAMP_UP' | 'RAMP_DOWN' | 'ISLAND' | 'STAIRS' | 'JAGGED' | 'NARROW_PEAK';

export interface LevelData {
  level: number;
  title: string;
  description: string;
  terrainType: TerrainType;
  inkLimit: number;
  gapWidth: number;     // Distance between cliffs
  heightDiff: number;   // Target height relative to start (positive = target is higher)
  hasCargo: boolean;
  obstacles: Obstacle[];
  carStability: number; // Constraint stiffness
}