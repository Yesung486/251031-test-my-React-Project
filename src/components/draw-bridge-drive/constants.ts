import { LevelData } from './types';

export const PHYSICS = {
  GROUP_CAR: -1,
  GROUP_GROUND: 1,
  CAT_DEFAULT: 0x0001,
  CAT_CAR: 0x0002,
  CAT_GROUND: 0x0004,
};

export const COLORS = {
  CLIFF: '#334155', // slate-700
  BRIDGE: '#f59e0b', // amber-500
  CAR_CHASSIS: '#3b82f6', // blue-500
  CAR_WHEEL: '#1e293b', // slate-800
  CARGO: '#ef4444', // red-500
  GOAL: '#10b981', // emerald-500
  OBSTACLE: '#475569', // slate-600
};

export const DIMENSIONS = {
  CAR_WIDTH: 130, // Slightly shorter
  CAR_HEIGHT: 25, // Sleeker body
  WHEEL_SIZE: 15, // Significantly smaller wheels (was 20) to get stuck on bumps
};

export const LEVELS: LevelData[] = [
  {
    level: 1,
    title: "First Steps",
    description: "A simple gap. Draw a straight bridge.",
    terrainType: 'DEFAULT',
    inkLimit: 300,
    gapWidth: 150,
    heightDiff: 0,
    hasCargo: false,
    obstacles: [],
    carStability: 0.9
  },
  {
    level: 2,
    title: "Stepping Down",
    description: "The destination is lower. Mind the drop.",
    terrainType: 'DEFAULT',
    inkLimit: 400,
    gapWidth: 200,
    heightDiff: -80, // Target lower
    hasCargo: false,
    obstacles: [],
    carStability: 0.9
  },
  {
    level: 3,
    title: "The Ramp",
    description: "Climb the slope! Build a ramp.",
    terrainType: 'RAMP_UP',
    inkLimit: 600,
    gapWidth: 250,
    heightDiff: 100, // Target higher
    hasCargo: false,
    obstacles: [],
    carStability: 0.8
  },
  {
    level: 4,
    title: "Slippery Slope",
    description: "Start on a downhill slope. Control your speed!",
    terrainType: 'RAMP_DOWN',
    inkLimit: 500,
    gapWidth: 300,
    heightDiff: -150,
    hasCargo: false,
    obstacles: [],
    carStability: 0.8
  },
  {
    level: 5,
    title: "Stairway to Heaven",
    description: "The terrain is stepped. Smooth it out.",
    terrainType: 'STAIRS',
    inkLimit: 700,
    gapWidth: 300,
    heightDiff: 120,
    hasCargo: false,
    obstacles: [],
    carStability: 0.8
  },
  {
    level: 6,
    title: "The Needle",
    description: "Land on the narrow peak in the middle.",
    terrainType: 'NARROW_PEAK',
    inkLimit: 700,
    gapWidth: 400,
    heightDiff: 0,
    hasCargo: false,
    obstacles: [],
    carStability: 0.7
  },
  {
    level: 7,
    title: "Floating Isles",
    description: "Bridge across the floating island.",
    terrainType: 'ISLAND',
    inkLimit: 800,
    gapWidth: 500,
    heightDiff: 0,
    hasCargo: false,
    obstacles: [], // Handled by terrainType ISLAND logic
    carStability: 0.7
  },
  {
    level: 8,
    title: "Jagged Peaks",
    description: "Rough terrain ahead. Careful with the cargo.",
    terrainType: 'JAGGED',
    inkLimit: 800,
    gapWidth: 350,
    heightDiff: 50,
    hasCargo: true,
    obstacles: [],
    carStability: 0.6
  },
  {
    level: 9,
    title: "The Great Wall",
    description: "A massive obstacle blocks the path.",
    terrainType: 'DEFAULT',
    inkLimit: 1000,
    gapWidth: 300,
    heightDiff: 0,
    hasCargo: true,
    obstacles: [{ x: 0, y: -100, w: 30, h: 200, isStatic: true }], // Tall wall
    carStability: 0.5
  },
  {
    level: 10,
    title: "Impossible Mission",
    description: "Long gap, high climb, fragile cargo.",
    terrainType: 'RAMP_UP',
    inkLimit: 1200,
    gapWidth: 500,
    heightDiff: 200,
    hasCargo: true,
    obstacles: [{ x: 0, y: 0, w: 60, h: 60, rotation: 0.78 }], // Diamond obstacle
    carStability: 0.4
  }
];