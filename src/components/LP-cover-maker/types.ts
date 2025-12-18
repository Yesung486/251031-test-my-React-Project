
export enum FontType {
  SERIF = 'Playfair Display',
  SANS = 'Inter',
  DISPLAY = 'Bungee'
}

export interface Sticker {
  id: string;
  type: 'parental' | 'barcode' | 'hologram';
  x: number;
  y: number;
}

export interface StudioState {
  artistName: string;
  albumTitle: string;
  fontFamily: FontType;
  coverImage: string | null;
  vinylColor: string;
  vinylOpacity: number;
  labelImage: string | null;
  vinylDesignImage: string | null;
  labelColor: string;
  vinylText: string; // New: Text specifically for the vinyl disc
  isEjected: boolean;
  isSpinning: boolean;
  isGenerating: boolean;
  stickers: Sticker[];
  textPositions: {
    artist: { x: number; y: number };
    title: { x: number; y: number };
    vinyl: { x: number; y: number }; // New: Position for vinyl text
  };
}
