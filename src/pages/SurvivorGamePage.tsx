// 파일 위치: pages/SurvivorGamePage.tsx

import React from 'react';
// ↓↓↓ 바로 이 부분! 폴더 주소를 우리가 방금 바꾼 이름으로 고쳤어! ↓↓↓
import SurvivorGameApp from '../components/survivor-game/SurvivorGameApp';

const SurvivorGamePage: React.FC = () => {
  return (
    <div>
      <SurvivorGameApp />
    </div>
  );
};

export default SurvivorGamePage;