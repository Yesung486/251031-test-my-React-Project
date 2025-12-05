// 파일 위치: App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Homepage from './pages/Homepage';
import SpaceShooter from './pages/SpaceShooter';
import VirtualTryOnPage from './pages/VirtualTryOnPage';
import AivocaPage from './pages/AivocaPage';
import { ThemeProvider } from './contexts/ThemeContext'; // 1. 우리가 만든 '상태 관리자'를 불러오자!
import './App.css';

function App() {
  const basename = "/251031-test-my-React-Project/";

  return (
    // 2. ThemeProvider로 BrowserRouter 전체를 감싸주면 끝!
    <ThemeProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Homepage />} />
            <Route path="neonbreaker" element={<SpaceShooter />} />
            <Route path="virtual-try-on" element={<VirtualTryOnPage />} />
            <Route path="aivoca" element={<AivocaPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;