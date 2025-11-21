// 파일 위치: App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout'; // 1. 우리의 새로운 '뼈대'를 불러오자!
import Homepage from './pages/Homepage';
import SpaceShooter from './pages/SpaceShooter';
import './App.css';

function App() {
  const basename = "/251031-test-my-React-Project/";

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* ↓↓↓ 바로 이 구조가 진짜 SPA의 핵심이야! ↓↓↓ */}
        <Route path="/" element={<Layout />}>
          {/* 주소가 그냥 `/`일 때는, Layout의 빈 공간(Outlet)에 Homepage를 보여줘! */}
          <Route index element={<Homepage />} />
          {/* 주소가 `/neonbreaker`일 때는, Layout의 빈 공간(Outlet)에 SpaceShooter를 보여줘! */}
          <Route path="neonbreaker" element={<SpaceShooter />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;