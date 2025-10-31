import React from 'react';

interface NavbarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = ['전체', '게임', '음악'];

const Navbar: React.FC<NavbarProps> = ({ activeCategory, onCategoryChange }) => {
  return (
    <nav className="bg-surface/80 backdrop-blur-sm border-b border-t border-gray-700">
      <div className="container mx-auto px-4">
        <ul className="flex items-center gap-6">
          {categories.map(category => (
            <li key={category}>
              <button
                onClick={() => onCategoryChange(category)}
                className={`py-3 text-sm font-medium transition-colors duration-200 border-b-2 ${
                  activeCategory === category
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
