// 파일 위치: pages/Layout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header'; // 너의 진짜 헤더 파일이야!
import Footer from '../components/Footer';

const Layout: React.FC = () => {
  // Header가 '카테고리' 기능을 사용하기 때문에,
  // 에러가 나지 않도록 여기서 기본값을 만들어 줄게.
  const [activeCategory, setActiveCategory] = React.useState('전체');

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <div>
      {/* 이제 모든 페이지는 이 Header와 Footer를 함께 사용하게 될 거야. */}
      <Header
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <Outlet /> {/* 이 부분에 Homepage나 게임 페이지 내용이 들어올 거야. */}

      <Footer />
    </div>
  );
};

export default Layout;