export type Vector2 = { x: number; y: number };

export enum EntityType {
  FRUIT = 'FRUIT',
  BOMB = 'BOMB'
}

export enum FruitType {
  WATERMELON = 'WATERMELON',
  ORANGE = 'ORANGE',
  KIWI = 'KIWI',
  LEMON = 'LEMON',
  GOLDEN = 'GOLDEN', // Special: High Score
  ICE = 'ICE'        // Special: Slow Motion
}

export interface BladePoint {
  x: number;
  y: number;
  life: number;
}

export interface GameTarget {
  id: number;
  type: EntityType;
  fruitType: FruitType; // Specific visual style
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  rotationSpeed: number;
  isSliced: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface SlicePart {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  fruitType: FruitType; // To render inner colors correctly
  rotation: number;
  rotationSpeed: number;
  startAngle: number;
  endAngle: number;
  life: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
  size: number;
}
