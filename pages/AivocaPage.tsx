// 파일 위치: pages/AivocaPage.tsx

import React from 'react';
// '홈으로 돌아가기' 버튼이 필요 없으니 Link는 지웠어!
import AivocaApp from '../components/aivoca/AivocaApp';

const AivocaPage: React.FC = () => {
  // 이제 이 페이지는 아주 깔끔하게 단어장 앱만 보여주면 돼.
  return (
    <AivocaApp />
  );
};

export default AivocaPage;