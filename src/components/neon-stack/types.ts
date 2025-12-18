
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Block {
  id: string;
  pos: Vector3;
  width: number;
  depth: number;
  color: string;
  hue: number;
}

export interface Debris {
  id: string;
  pos: Vector3;
  width: number;
  depth: number;
  color: string;
  velocity: Vector3;
  rotation: number;
  rotationVel: number;
  opacity: number;
}

export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}

export interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}
