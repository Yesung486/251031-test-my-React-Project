import { WeaponType, Skin, Chapter, Rarity } from './types';

export const CANVAS_WIDTH = window.innerWidth;
export const CANVAS_HEIGHT = window.innerHeight;

export const PLAYER_BASE_SPEED = 6.5; 
export const PLAYER_BASE_HP = 100;
export const PLAYER_SIZE = 15;

export const ENEMY_SPAWN_RATE = 60; 

export const COLORS = {
  PLAYER: '#3B82F6', 
  ZOMBIE: '#EF4444', 
  FAST: '#F59E0B',   
  TANK: '#7F1D1D',   
  BOSS: '#7e22ce',   
  GEM: '#10B981',    
  PROJECTILE: '#FFFFFF',
  TREASURE: '#FFD700',
};

export const SKINS: Skin[] = [
  // --- COMMON ---
  {
    id: 'skin_default',
    name: '기본 요원',
    description: 'EDF의 표준 작전 슈트입니다. 밸런스가 잡혀있습니다.',
    price: 0,
    rarity: 'COMMON',
    effectType: 'NONE',
    primaryColor: '#3B82F6',
    stats: {}
  },

  // --- RARE ---
  {
    id: 'skin_blade',
    name: '블레이드 마스터',
    description: '공격 시 붉은 검기를 휘날립니다. 공격력이 소폭 상승합니다.',
    price: 5000,
    rarity: 'RARE',
    effectType: 'BLOOD',
    primaryColor: '#EF4444',
    stats: { attackBonus: 0.1 }
  },
  {
    id: 'skin_toxic',
    name: '베놈 해저드',
    description: '주변에 독가스를 흩뿌립니다. 공격력이 상승합니다.',
    price: 15000,
    rarity: 'RARE',
    effectType: 'TOXIC',
    primaryColor: '#84cc16',
    stats: { attackBonus: 0.15 }
  },

  // --- EPIC ---
  {
    id: 'skin_gold',
    name: '골든 엠페러',
    description: '황금빛 오라를 두릅니다. 치명타 확률이 증가합니다.',
    price: 30000,
    rarity: 'EPIC',
    effectType: 'GOLD',
    primaryColor: '#F59E0B',
    stats: { critChanceBonus: 0.1 }
  },
  {
    id: 'skin_ice',
    name: '프로스트 로드',
    description: '냉기를 방출합니다. 최대 체력이 20% 증가합니다.',
    price: 65000,
    rarity: 'EPIC',
    effectType: 'ICE',
    primaryColor: '#06b6d4',
    stats: { hpBonus: 0.2 }
  },

  // --- LEGENDARY (Active Skills Start) ---
  {
    id: 'skin_cyber',
    name: '사이버 펑크',
    description: '디지털 글리치 에너지를 사용합니다. 스킬: 시스템 과부하',
    price: 80000,
    rarity: 'LEGENDARY',
    effectType: 'PIXEL',
    primaryColor: '#22D3EE',
    stats: { attackSpeedBonus: 0.15, speedBonus: 0.1 },
    activeSkill: {
      name: '시스템 과부하',
      description: '화면상의 모든 적을 일시 정지시키고 데미지를 줍니다.',
      cooldown: 45,
      iconName: 'ZapOff',
      visualColor: '#22D3EE'
    }
  },
  {
    id: 'skin_lightning',
    name: '라이트닝 플래시',
    description: '전장을 누비는 빛. 스킬: 천둥 작렬',
    price: 120000,
    rarity: 'LEGENDARY',
    effectType: 'LIGHTNING',
    primaryColor: '#facc15',
    stats: { speedBonus: 0.3 },
    activeSkill: {
      name: '천둥 작렬',
      description: '화면 내의 모든 적에게 벼락을 내리꽂습니다.',
      cooldown: 30,
      iconName: 'Zap',
      visualColor: '#facc15'
    }
  },
  {
    id: 'skin_ghost',
    name: '스펙터 (유령)',
    description: '영혼을 수확하는 자. 스킬: 유체 이탈',
    price: 150000,
    rarity: 'LEGENDARY',
    effectType: 'GHOST',
    primaryColor: '#4ade80',
    stats: { critChanceBonus: 0.15, attackBonus: 0.1 },
    activeSkill: {
      name: '유체 이탈',
      description: '5초 동안 무적 상태가 되며 이동 속도가 대폭 증가합니다.',
      cooldown: 60,
      iconName: 'Ghost',
      visualColor: '#4ade80'
    }
  },

  // --- MYTHIC (God Active Skills) ---
  {
    id: 'skin_void',
    name: '보이드 워커',
    description: '심연의 지배자. 스킬: 블랙홀',
    price: 200000,
    rarity: 'MYTHIC',
    effectType: 'VOID',
    primaryColor: '#7C3AED',
    stats: { attackBonus: 0.3 },
    activeSkill: {
      name: '블랙홀',
      description: '중앙에 거대한 블랙홀을 생성하여 모든 적을 빨아들이고 파괴합니다.',
      cooldown: 50,
      iconName: 'Aperture',
      visualColor: '#7C3AED'
    }
  },
  {
    id: 'skin_mecha',
    name: '메카 커맨더',
    description: '최첨단 병기. 스킬: 오비탈 레이저',
    price: 350000,
    rarity: 'MYTHIC',
    effectType: 'MECHA',
    primaryColor: '#3b82f6',
    stats: { hpBonus: 0.5, attackBonus: 0.2 },
    activeSkill: {
      name: '오비탈 레이저',
      description: '위성에서 레이저를 폭격하여 전방의 적을 소멸시킵니다.',
      cooldown: 40,
      iconName: 'Crosshair',
      visualColor: '#3b82f6'
    }
  },
  {
    id: 'skin_fire',
    name: '헬파이어',
    description: '파괴의 신. 스킬: 태양의 분노',
    price: 500000,
    rarity: 'MYTHIC',
    effectType: 'FIRE',
    primaryColor: '#f97316',
    stats: { attackBonus: 0.5, critChanceBonus: 0.2 },
    activeSkill: {
      name: '태양의 분노',
      description: '화면 전체를 뒤덮는 거대한 화염 폭발을 일으킵니다.',
      cooldown: 60,
      iconName: 'Flame',
      visualColor: '#f97316'
    }
  }
];

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    name: 'Chapter 1: 도시 외곽',
    description: '바이러스가 처음 창궐한 버려진 도시의 가장자리입니다.',
    theme: { bg: '#111827', grid: '#1f2937' },
  },
  {
    id: 2,
    name: 'Chapter 2: 녹슨 폐공장',
    description: '멈춰버린 기계들 사이로 변종 바이러스가 꿈틀거립니다.',
    theme: { bg: '#2a1a1a', grid: '#4f2a2a' },
  },
  {
    id: 3,
    name: 'Chapter 3: 수정 동굴',
    description: '신비로운 에너지가 흐르는 동굴 깊숙한 곳, 위험이 도사립니다.',
    theme: { bg: '#1a1a2e', grid: '#2a2a4e' },
  },
  {
    id: 4,
    name: 'Chapter 4: 심연의 균열',
    description: '현실의 경계가 무너진 곳, 가장 강력한 적들이 기다립니다.',
    theme: { bg: '#0c0c0d', grid: '#1e1e21' },
  },
];

export const UPGRADE_DEFINITIONS = [
  {
    id: 'kunai',
    name: '쿠나이',
    description: '가장 가까운 적에게 수리검을 던집니다.',
    icon: 'Sword',
    type: 'WEAPON',
    rarity: 'COMMON'
  },
  {
    id: 'shotgun',
    name: '샷건',
    description: '전방 부채꼴 범위에 강력한 탄환을 발사합니다.',
    icon: 'Zap',
    type: 'WEAPON',
    rarity: 'RARE'
  },
  {
    id: 'bat',
    name: '야구방망이',
    description: '근접한 적들을 밀어내고 피해를 줍니다.',
    icon: 'Activity',
    type: 'WEAPON',
    rarity: 'COMMON'
  },
  {
    id: 'guardian',
    name: '수호자',
    description: '주변을 회전하는 칼날이 적을 밀어냅니다.',
    icon: 'Shield',
    type: 'WEAPON',
    rarity: 'EPIC'
  },
  {
    id: 'atk_up',
    name: '강력한 총알',
    description: '공격력이 20% 증가합니다.',
    icon: 'Sword',
    type: 'STAT',
    rarity: 'COMMON'
  },
  {
    id: 'spd_up',
    name: '신속의 장화',
    description: '이동 속도가 15% 증가합니다.',
    icon: 'Footprints',
    type: 'STAT',
    rarity: 'COMMON'
  },
  {
    id: 'atk_spd_up',
    name: '에너지 드링크',
    description: '공격 속도가 15% 빨라집니다.',
    icon: 'Zap',
    type: 'STAT',
    rarity: 'RARE'
  },
  {
    id: 'hp_up',
    name: '건강한 신체',
    description: '최대 체력이 30% 증가합니다.',
    icon: 'Heart',
    type: 'STAT',
    rarity: 'COMMON'
  },
  {
    id: 'multi_shot',
    name: '멀티 샷',
    description: '발사체가 1개 추가됩니다.',
    icon: 'Copy',
    type: 'WEAPON',
    rarity: 'LEGENDARY'
  },
  {
    id: 'magnet_core',
    name: '자석 코어',
    description: '경험치 획득 범위가 50% 증가합니다.',
    icon: 'Star',
    type: 'STAT',
    rarity: 'RARE'
  },
  {
    id: 'crit_chance_up',
    name: '정밀 조준경',
    description: '치명타 확률이 10% 증가합니다.',
    icon: 'Activity', 
    type: 'STAT',
    rarity: 'EPIC'
  },
  {
    id: 'crit_damage_up',
    name: '고폭탄',
    description: '치명타 피해량이 50% 증가합니다.',
    icon: 'Zap',
    type: 'STAT',
    rarity: 'EPIC'
  }
];

export const rarityProgression: Rarity[] = [
  'COMMON',
  'MAGIC',
  'EXQUISITE',
  'RARE',
  'EXCELLENT',
  'EPIC',
  'LEGEND',
  'ETERNAL',
  'TRANSCENDENT',
  'GOLDEN',
  'FOREVER',
];