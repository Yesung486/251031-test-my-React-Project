// 파일 위치: pages/VirtualTryOnPage.tsx

import React from 'react';
// 1. 우리가 방금 리모델링한 진짜 '가상 피팅' 앱 부품을 여기서 불러올게!
import VirtualTryOnApp from '../components/ai-virtual-try-on/VirtualTryOnApp';

const VirtualTryOnPage: React.FC = () => {
  // 2. 이 페이지는 아주 간단해. 그냥 VirtualTryOnApp을 화면에 보여주는 역할만 해.
  return (
    <div>
      <VirtualTryOnApp />
    </div>
  );
};

export default VirtualTryOnPage;