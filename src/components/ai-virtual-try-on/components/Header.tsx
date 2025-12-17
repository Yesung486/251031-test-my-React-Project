
import React from 'react';

const Header: React.FC = () => (
  <header className="bg-white dark:bg-slate-800/50 shadow-sm backdrop-blur-md sticky top-0 z-10">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
          AI 의류 가상 피팅
        </h1>
        <p className="mt-1 text-base text-slate-600 dark:text-slate-400">
          AI Virtual Try-On
        </p>
      </div>
    </div>
  </header>
);

export default Header;