// 파일 위치: App.tsx (가장 바깥에 있는 파일이야!)

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import SpaceShooter from './pages/SpaceShooter'; // 게임 페이지를 불러올게.
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 주소가 그냥 `/` 일 때는 Homepage를 보여줘! */}
        <Route path="/" element={<Homepage />} />

        {/* 주소가 `/neonbreaker` 일 때는 SpaceShooter 페이지(게임 페이지)를 보여줘! */}
        <Route path="/neonbreaker" element={<SpaceShooter />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;