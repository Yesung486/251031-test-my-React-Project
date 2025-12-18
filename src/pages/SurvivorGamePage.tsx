// src/pages/SurvivorGamePage.tsx

import React from 'react';
// 👇 경로가 맞는지 확인해! (SurvivorGameApp을 불러와야 해)
import SurvivorGameApp from '../components/survivor-game/SurvivorGameApp'; 

const SurvivorGamePage: React.FC = () => {
  return (
    // 👇 [핵심] 높이는 메뉴바(80px) 빼고, relative로 좌표 기준점 잡기!
    <div className="w-full h-[calc(100vh-80px)] bg-gray-900 overflow-hidden relative">
      
      {/* 게임이 부모 크기를 100% 따라가도록 설정 */}
      <div className="absolute top-0 left-0 w-full h-full">
        <SurvivorGameApp />
      </div>

    </div>
  );
};

export default SurvivorGamePage;