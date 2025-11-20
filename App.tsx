// 파일 위치: App.tsx (가장 바깥에 있는 파일이야!)

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage'; // 우리가 이사시킨 Homepage를 불러올게.
import SpaceShooter from './pages/SpaceShooter'; // 게임 페이지도 불러오고.
import './App.css'; // 원래 있던 CSS 파일은 그대로 쓸게.

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 주소가 그냥 `/` 일 때는 Homepage를 보여줘! */}
        <Route path="/" element={<Homepage />} />

        {/* 주소가 `/spaceshooter` 일 때는 SpaceShooter 페이지를 보여줘! */}
        <Route path="/spaceshooter" element={<SpaceShooter />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;