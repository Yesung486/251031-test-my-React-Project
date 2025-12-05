// 파일 위치: pages/SpaceShooter.tsx

import React from 'react';
// '홈으로 돌아가기' 버튼이 필요 없으니 Link는 지웠어!
import NeonBreakerGame from '../components/game-neon-breaker/NeonBreakerGame';

const SpaceShooter: React.FC = () => {
  // 이제 이 페이지는 아주 깔끔하게 게임만 보여주면 돼.
  return (
    <NeonBreakerGame />
  );
};

export default SpaceShooter;