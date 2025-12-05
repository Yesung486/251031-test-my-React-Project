// 파일 위치: contexts/ThemeContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// 'theme'은 'dark' 또는 'light' 중 하나, setTheme는 그걸 바꾸는 함수
type ThemeContextType = {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
};

// 1. '테마' 정보를 담을 수 있는 특별한 상자를 만들었어.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 2. 이 함수는 우리 웹사이트 전체를 감싸서, '테마' 정보를 전달하는 역할을 해.
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    // 처음에 웹사이트를 켰을 때, 사용자의 컴퓨터 설정을 확인해서 자동으로 낮/밤 모드를 정해.
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // '테마'가 바뀔 때마다 html 태그에 'dark' 클래스를 붙이거나 떼는 아주 중요한 역할!
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. 이건 어떤 부품이든 쉽게 '테마' 정보를 꺼내 쓸 수 있게 해주는 마법의 도구야!
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};