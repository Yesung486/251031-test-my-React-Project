// 파일 위치: pages/VirtualTryOnPage.tsx

import React from 'react';
// '홈으로 돌아가기' 버튼이 필요 없으니 Link는 지웠어!
import VirtualTryOnApp from '../components/ai-virtual-try-on/VirtualTryOnApp';

const VirtualTryOnPage: React.FC = () => {
  // 이제 이 페이지는 아주 깔끔하게 가상 피팅 앱만 보여주면 돼.
  return (
    <VirtualTryOnApp />
  );
};

export default VirtualTryOnPage;