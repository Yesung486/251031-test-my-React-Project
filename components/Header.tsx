import React from 'react';
import Navbar from './Navbar';

interface HeaderProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeCategory, onCategoryChange }) => {
  return (
    <header className="bg-surface shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-white">
          <span className="text-primary">나만의</span> 웹사이트 빌더
        </h1>
      </div>
      <Navbar activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
    </header>
  );
};

export default Header;
