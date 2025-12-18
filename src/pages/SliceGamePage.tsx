import React from 'react';
import SliceGame from '../components/slice-game/SliceGame';

const SliceGamePage: React.FC = () => (
  // 👇 flex justify-center, items-center를 뺐어! (중앙 정렬 해제)
  // 대신 w-full, h-full로 꽉 채워서 좌표가 꼬이지 않게 함.
  <div className="w-full h-[calc(100vh-80px)] bg-gray-900 overflow-hidden relative">
    
    {/* 게임이 왼쪽 위(0,0)부터 시작하도록 둠 */}
    <div className="absolute top-0 left-0 w-full h-full">
      <SliceGame />
    </div>

  </div>
);

export default SliceGamePage;