import { SavedData } from '../types';

const STORAGE_KEY = 'traffic_runner_save_v1';

const DEFAULT_DATA: SavedData = {
  coins: 0,
  unlockedSkins: ['default'],
  selectedSkin: 'default',
  highScore: 0,
};

export const saveGameData = (data: SavedData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save game data', e);
  }
};

export const loadGameData = (): SavedData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load game data', e);
    return DEFAULT_DATA;
  }
};