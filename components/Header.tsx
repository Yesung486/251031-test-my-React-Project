// 파일 위치: components/Header.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

// Header는 이제 카테고리 기능을 직접 관리하지 않아. 아주 심플해졌어!
const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 py-4">
      <div className="container mx-auto px-4">
        {/* 헤더 전체를 'glass-panel'로 감싸서 투명하고 동글동글하게! */}
        <div className="glass-panel px-4 py-3 flex justify-between items-center rounded-2xl">
          <Link to="/" className="text-decoration-none">
            <h1 className="text-xl font-bold text-text-primary hover:opacity-80 transition-opacity duration-300">
              <span className="text-primary font-bold">나만의</span> 웹사이트 빌더
            </h1>
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-text-secondary" />
            ) : (
              <Sun className="w-5 h-5 text-text-secondary" />
            )}
          </button>
        </div>
        {/* Navbar를 여기서 완전히 삭제했어! */}
      </div>
    </header>
  );
};

export default Header;