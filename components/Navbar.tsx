import React from 'react';

interface NavbarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = ['전체', '게임', '학습', '기타'];

const Navbar: React.FC<NavbarProps> = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="container mx-auto px-4 mt-4">
      <div className="glass-panel rounded-2xl p-1">
        <ul className="flex items-center justify-around">
          {categories.map(category => (
            <li key={category} className="flex-1 text-center">
              <button
                onClick={() => onCategoryChange(category)}
                className={`w-full py-2.5 text-sm font-semibold rounded-[18px] transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;