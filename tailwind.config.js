// 파일 위치: tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  // ↓↓↓ 바로 이 부분! 'src' 폴더 대신, 우리 프로젝트 전체를 보도록 수정했어! ↓↓↓
  content: [
    "./index.html",
    // "./src/**/*.{js,ts,jsx,tsx}", // 이 줄은 이제 필요 없어!
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'background': 'var(--background)',
        'surface': 'var(--surface)',
        'primary': 'var(--primary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'border': 'var(--border)',
        'header-bg': 'var(--header-bg)',
      },
    },
  },
  plugins: [],
}