// 파일 위치: App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Homepage from './pages/Homepage';
import SpaceShooter from './pages/SpaceShooter';
// 1. 우리가 방금 만든 '가상 피팅 페이지'를 여기서 불러올게!
import VirtualTryOnPage from './pages/VirtualTryOnPage';
import './App.css';

function App() {
  const basename = "/251031-test-my-React-Project/";

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          <Route path="neonbreaker" element={<SpaceShooter />} />
          {/* ↓↓↓ 바로 이 한 줄이 '가상 피팅 페이지'로 가는 새로운 길이야! ↓↓↓ */}
          <Route path="virtual-try-on" element={<VirtualTryOnPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;