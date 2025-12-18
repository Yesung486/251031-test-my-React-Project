
export interface ParticleSettings {
  text: string;
  particleSize: number;
  repulsionRadius: number;
  returnSpeed: number;
  color: string;
  density: number;
  friction: number;
}

export enum PresetType {
  LIQUID = 'Liquid',
  EXPLOSIVE = 'Explosive',
  SNOW = 'Snow'
}
