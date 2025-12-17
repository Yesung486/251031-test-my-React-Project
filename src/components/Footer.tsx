import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-gray-700 mt-16">
      <div className="container mx-auto px-4 py-6 text-center text-text-secondary text-sm">
        <p className="mb-2">
          &copy; {currentYear} Pumpkin Face. All rights reserved.
        </p>
        <p>
          경기 분당구 하오개로 351번길 4
        </p>
      </div>
    </footer>
  );
};

export default Footer;