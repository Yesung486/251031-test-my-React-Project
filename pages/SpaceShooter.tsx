// 파일 위치: pages/SpaceShooter.tsx

import React from 'react';
// 1. 우리가 방금 완성한 진짜 게임 부품을 여기서 불러올게!
import NeonBreakerGame from '../components/game-neon-breaker/NeonBreakerGame';

const SpaceShooter: React.FC = () => {
  // 2. 이 페이지는 아주 간단해. 그냥 NeonBreakerGame을 화면에 보여주는 역할만 해.
  return (
    <div>
      <NeonBreakerGame />
    </div>
  );
};

export default SpaceShooter;