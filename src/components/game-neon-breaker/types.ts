// 이 파일은 게임에서 사용하는 모든 데이터의 모양(설계도)을 정의해.
export interface Vector { x: number; y: number; }
export interface Ball { id: string; pos: Vector; vel: Vector; radius: number; active: boolean; speed: number; }
export enum ItemType { MULTI_BALL = 'MULTI_BALL' }
export interface Item { id: string; pos: Vector; vel: Vector; type: ItemType; width: number; height: number; active: boolean; }
export interface Paddle { pos: Vector; width: number; height: number; color: string; }
export interface Brick { id: string; pos: Vector; width: number; height: number; value: number; status: number; maxHealth: number; color: string; itemType?: ItemType | null; }
export interface Particle { id: string; pos: Vector; vel: Vector; life: number; color: string; size: number; }
export enum GameState { MENU = 'MENU', PLAYING = 'PLAYING', PAUSED = 'PAUSED', GAME_OVER = 'GAME_OVER', VICTORY = 'VICTORY' }
export interface GameSettings { volume: number; sensitivity: number; }