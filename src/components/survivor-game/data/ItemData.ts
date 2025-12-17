
import { Rarity } from '../types';

export interface ItemVariant {
  path: string;
  viewBox: string;
  color: string;
  accent: string;
}

export interface RarityStyle {
  color: string;
  bgGradient: string;
  border: string;
  boxShadow: string;
  animation?: string;
}

// 36 Unique SVG Paths for Items
export const ITEM_VARIANTS: Record<string, ItemVariant> = {
  // ⚔️ Weapon
  'Baseball Bat': {
    path: 'M20,80 C15,85 10,95 15,100 C20,105 30,100 35,95 L80,20 C85,15 95,5 90,0 C85,-5 75,5 70,10 Z M30,80 L40,70 M50,60 L60,50 M25,85 L35,75',
    viewBox: '0 0 100 100',
    color: '#8D6E63', // Wood
    accent: '#BDBDBD' // Nails
  },
  'Katana': {
    path: 'M10,90 L20,80 L30,85 L20,95 Z M25,75 Q50,50 90,10 L95,5 L85,15 Q45,55 20,80 Z',
    viewBox: '0 0 100 100',
    color: '#E0E0E0', // Silver
    accent: '#212121' // Handle
  },
  'Shotgun': {
    path: 'M10,60 L30,60 L35,50 L90,50 L90,65 L35,65 L30,75 L10,75 Z M40,65 L85,65 M40,55 L85,55',
    viewBox: '0 0 100 100',
    color: '#424242', // Dark Grey
    accent: '#8D6E63' // Wood Stock
  },
  'Revolver': {
    path: 'M10,70 L25,70 C30,60 35,60 40,55 L80,55 L80,45 L40,45 L35,35 L20,40 L25,50 L10,70 Z M45,50 A5,5 0 1,0 45,60 A5,5 0 1,0 45,50',
    viewBox: '0 0 100 100',
    color: '#B0BEC5', // Silver
    accent: '#5D4037' // Grip
  },
  'Kunai': {
    path: 'M50,10 L65,50 L50,90 L35,50 Z M45,85 L55,85 L55,95 L45,95 Z M50,95 A5,5 0 1,0 50,105 A5,5 0 1,0 50,95',
    viewBox: '0 0 100 120',
    color: '#212121', // Black
    accent: '#E0E0E0' // Edge
  },
  'Magic Staff': {
    path: 'M45,95 L55,95 L52,30 L48,30 Z M50,10 L35,25 L50,40 L65,25 Z',
    viewBox: '0 0 100 100',
    color: '#FFD700', // Gold
    accent: '#9C27B0' // Gem
  },

  // 📿 Necklace
  'Emerald Necklace': {
    path: 'M30,30 Q50,70 70,30 M50,70 L40,85 L50,100 L60,85 Z',
    viewBox: '0 0 100 100',
    color: '#50C878', // Emerald
    accent: '#FFD700' // Chain
  },
  'Thorn Necklace': {
    path: 'M20,20 Q50,80 80,20 M30,50 L20,60 M70,50 L80,60 M50,75 L50,90 L40,80 L60,80 Z',
    viewBox: '0 0 100 100',
    color: '#5D4037', // Brown
    accent: '#8D6E63' // Thorns
  },
  'Metal Necklace': {
    path: 'M25,25 Q50,75 75,25 M45,75 A10,10 0 1,0 55,75 M40,75 L60,75',
    viewBox: '0 0 100 100',
    color: '#B0BEC5', // Silver
    accent: '#607D8B' // Chain
  },
  'Bone Necklace': {
    path: 'M20,20 Q50,70 80,20 M45,70 A5,5 0 1,0 55,70 L52,90 A3,3 0 1,0 48,90 Z',
    viewBox: '0 0 100 100',
    color: '#FFF8E1', // Ivory
    accent: '#D7CCC8' // Bone
  },
  'Crystal Talisman': {
    path: 'M30,30 Q50,60 70,30 M50,60 L40,70 L50,95 L60,70 Z',
    viewBox: '0 0 100 100',
    color: '#00BCD4', // Cyan
    accent: '#E0F7FA' // Glow
  },
  'Golden Chain': {
    path: 'M20,20 C30,40 40,60 50,80 C60,60 70,40 80,20 M45,80 L55,80 L55,90 L45,90 Z',
    viewBox: '0 0 100 100',
    color: '#FFC107', // Gold
    accent: '#FFA000' // Dark Gold
  },

  // 🧤 Gloves
  'Leather Gloves': {
    path: 'M30,80 L30,40 L40,30 L50,30 L60,40 L70,30 L70,80 Z M30,80 L70,80',
    viewBox: '0 0 100 100',
    color: '#795548', // Brown
    accent: '#3E2723' // Stitching
  },
  'Shining Gloves': {
    path: 'M30,85 L25,45 L35,35 L50,25 L65,35 L75,45 L70,85 Z M40,50 L60,50 M50,30 L50,50',
    viewBox: '0 0 100 100',
    color: '#FFFFFF', // White
    accent: '#E1F5FE' // Light Blue
  },
  'Destroyer Gloves': {
    path: 'M25,85 L25,45 L35,35 L50,30 L65,35 L75,45 L75,85 Z M35,45 L30,40 M50,40 L50,35 M65,45 L70,40',
    viewBox: '0 0 100 100',
    color: '#212121', // Black
    accent: '#F44336' // Spikes
  },
  'Military Gloves': {
    path: 'M25,80 L25,50 L40,40 L60,40 L75,50 L75,80 Z M30,60 H70 M30,70 H70',
    viewBox: '0 0 100 100',
    color: '#558B2F', // Khaki
    accent: '#33691E' // Camo
  },
  "Ruler's Gloves": {
    path: 'M30,90 L25,50 L40,30 L60,30 L75,50 L70,90 Z M50,50 A10,10 0 1,0 50,70 A10,10 0 1,0 50,50',
    viewBox: '0 0 100 100',
    color: '#7B1FA2', // Purple
    accent: '#FFD700' // Gold Trim
  },
  'Void Gauntlets': {
    path: 'M30,90 L25,40 L40,20 L60,20 L75,40 L70,90 Z M40,50 L60,50 M50,30 L50,90',
    viewBox: '0 0 100 100',
    color: '#311B92', // Deep Purple
    accent: '#000000' // Void
  },

  // 🛡️ Suit
  'Metal Suit': {
    path: 'M20,20 L80,20 L90,40 L80,90 L20,90 L10,40 Z M40,40 L60,40 L60,60 L40,60 Z',
    viewBox: '0 0 100 100',
    color: '#90A4AE', // Steel
    accent: '#37474F' // Mechanical
  },
  'Traveler Cloak': {
    path: 'M30,20 L70,20 L80,90 L20,90 Z M40,20 L40,90 M60,20 L60,90',
    viewBox: '0 0 100 100',
    color: '#D7CCC8', // Beige
    accent: '#8D6E63' // Brown
  },
  'Bulletproof Vest': {
    path: 'M25,20 L75,20 L85,40 L80,85 L20,85 L15,40 Z M35,40 H65 M35,55 H65 M35,70 H65',
    viewBox: '0 0 100 100',
    color: '#212121', // Black
    accent: '#424242' // Grey
  },
  'Military Uniform': {
    path: 'M20,20 L80,20 L90,45 L85,90 L15,90 L10,45 Z M50,20 L50,90 M30,30 H70',
    viewBox: '0 0 100 100',
    color: '#33691E', // Dark Green
    accent: '#1B5E20' // Details
  },
  'Shadow Tunic': {
    path: 'M25,20 L75,20 L85,35 L80,90 L20,90 L15,35 Z M50,40 L60,50 L50,60 L40,50 Z',
    viewBox: '0 0 100 100',
    color: '#1A237E', // Navy
    accent: '#000000' // Shadow
  },
  'Full Plate': {
    path: 'M15,15 L85,15 L95,40 L80,95 L20,95 L5,40 Z M30,40 L70,40 M50,15 L50,95',
    viewBox: '0 0 100 100',
    color: '#CFD8DC', // Silver
    accent: '#B0BEC5' // Polish
  },

  // 🥋 Belt
  'Energy Belt': {
    path: 'M10,40 L90,40 L90,60 L10,60 Z M40,40 L40,60 M60,40 L60,60 M45,45 H55 V55 H45 Z',
    viewBox: '0 0 100 100',
    color: '#2979FF', // Neon Blue
    accent: '#80D8FF' // Battery
  },
  'Leather Belt': {
    path: 'M10,40 L90,40 L90,60 L10,60 Z M30,40 L30,60 M45,42 H55 V58 H45 Z',
    viewBox: '0 0 100 100',
    color: '#795548', // Brown
    accent: '#FFD700' // Buckle
  },
  'Fashion Belt': {
    path: 'M10,42 L90,42 L90,58 L10,58 Z M40,35 L50,65 L60,35',
    viewBox: '0 0 100 100',
    color: '#F48FB1', // Pink
    accent: '#E91E63' // Decoration
  },
  'Military Belt': {
    path: 'M10,40 L90,40 L90,60 L10,60 Z M20,40 V60 M35,40 V60 M65,40 V60 M80,40 V60',
    viewBox: '0 0 100 100',
    color: '#33691E', // Green
    accent: '#1B5E20' // Ammo
  },
  'Champion Belt': {
    path: 'M5,35 L95,35 L90,65 L10,65 Z M35,35 L35,65 M65,35 L65,65 M50,40 A10,10 0 1,0 50,60 A10,10 0 1,0 50,40',
    viewBox: '0 0 100 100',
    color: '#FFC107', // Gold
    accent: '#FF6F00' // Champion
  },
  'Assassin Sash': {
    path: 'M10,45 L90,45 L85,60 L15,60 Z M40,45 L40,75 M55,45 L50,75',
    viewBox: '0 0 100 100',
    color: '#D32F2F', // Red
    accent: '#B71C1C' // Knot
  },

  // 👢 Shoes
  'Military Boots': {
    path: 'M20,90 L20,50 L50,50 L50,80 L80,80 L80,90 Z M25,55 H45 M25,65 H45 M25,75 H45',
    viewBox: '0 0 100 100',
    color: '#212121', // Black
    accent: '#616161' // Laces
  },
  'Energy Runners': {
    path: 'M15,90 L20,60 L50,55 L85,75 L85,90 Z M30,90 L40,80 L60,80 L70,90',
    viewBox: '0 0 100 100',
    color: '#C6FF00', // Lime
    accent: '#76FF03' // Energy
  },
  'Prosthetic Leg': {
    path: 'M30,90 L30,40 L50,40 L50,90 Z M30,60 H50 M30,75 H50',
    viewBox: '0 0 100 100',
    color: '#BDBDBD', // Grey
    accent: '#757575' // Metal
  },
  'High Boots': {
    path: 'M25,90 L25,30 L50,30 L55,80 L80,80 L80,90 Z M25,30 L50,35',
    viewBox: '0 0 100 100',
    color: '#5D4037', // Dark Brown
    accent: '#3E2723' // Leather
  },
  'Ninja Tabi': {
    path: 'M20,90 L25,60 L50,60 L80,85 L80,90 Z M80,85 L80,60',
    viewBox: '0 0 100 100',
    color: '#212121', // Black
    accent: '#424242' // Sole
  },
  'Iron Greaves': {
    path: 'M25,90 L20,40 L55,40 L60,80 L85,80 L85,90 Z M30,50 L50,50 M30,70 L55,70',
    viewBox: '0 0 100 100',
    color: '#90A4AE', // Silver
    accent: '#546E7A' // Iron
  }
};

export const RARITY_STYLES: Record<Rarity, RarityStyle> = {
  COMMON: {
    color: '#9E9E9E',
    bgGradient: 'linear-gradient(135deg, #424242 0%, #212121 100%)',
    border: '1px solid #616161',
    boxShadow: 'none'
  },
  MAGIC: {
    color: '#66BB6A',
    bgGradient: 'linear-gradient(135deg, #1B5E20 0%, #004D40 100%)',
    border: '1px solid #4CAF50',
    boxShadow: '0 0 5px rgba(76, 175, 80, 0.3)'
  },
  EXQUISITE: {
    color: '#42A5F5',
    bgGradient: 'linear-gradient(135deg, #0D47A1 0%, #01579B 100%)',
    border: '1px solid #2196F3',
    boxShadow: '0 0 8px rgba(33, 150, 243, 0.4)'
  },
  RARE: {
    color: '#AB47BC',
    bgGradient: 'linear-gradient(135deg, #4A148C 0%, #311B92 100%)',
    border: '2px solid #9C27B0',
    boxShadow: '0 0 10px rgba(156, 39, 176, 0.5)'
  },
  EXCELLENT: {
    color: '#FFA726',
    bgGradient: 'linear-gradient(135deg, #E65100 0%, #BF360C 100%)',
    border: '2px solid #FF9800',
    boxShadow: '0 0 12px rgba(255, 152, 0, 0.6)',
    animation: 'pulse 2s infinite'
  },
  EPIC: {
    color: '#FF5722',
    bgGradient: 'linear-gradient(135deg, #BF360C 0%, #880E4F 100%)',
    border: '2px solid #F4511E',
    boxShadow: '0 0 15px rgba(244, 81, 30, 0.7)',
    animation: 'pulse 1.5s infinite'
  },
  LEGEND: {
    color: '#F44336',
    bgGradient: 'linear-gradient(135deg, #B71C1C 0%, #880E4F 100%)',
    border: '2px solid #D32F2F',
    boxShadow: '0 0 20px rgba(211, 47, 47, 0.8)',
    animation: 'breathing 2s infinite alternate'
  },
  ETERNAL: {
    color: '#F50057',
    bgGradient: 'linear-gradient(135deg, #880E4F 0%, #4A148C 100%)',
    border: '2px solid #C51162',
    boxShadow: '0 0 25px rgba(245, 0, 87, 0.8), 0 0 10px #FF4081 inset',
    animation: 'pulse 1s infinite'
  },
  TRANSCENDENT: {
    color: '#00E5FF',
    bgGradient: 'linear-gradient(135deg, #006064 0%, #1A237E 100%)',
    border: '2px solid #00B8D4',
    boxShadow: '0 0 30px rgba(0, 229, 255, 0.8), 0 0 15px #18FFFF inset',
    animation: 'electric 0.5s infinite alternate'
  },
  GOLDEN: {
    color: '#FFD700',
    bgGradient: 'linear-gradient(135deg, #FF6F00 0%, #FFD700 50%, #FF6F00 100%)',
    border: '2px solid #FFD700',
    boxShadow: '0 0 40px rgba(255, 215, 0, 0.9), 0 0 20px #FFF59D inset',
    animation: 'shine 2s infinite linear'
  },
  FOREVER: {
    color: '#FFFFFF',
    bgGradient: 'conic-gradient(from 0deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3, #FF0000)',
    border: '3px solid #FFFFFF',
    boxShadow: '0 0 50px rgba(255, 255, 255, 1), 0 0 30px rgba(255,255,255,0.8) inset',
    animation: 'rotate-bg 3s linear infinite'
  }
};
