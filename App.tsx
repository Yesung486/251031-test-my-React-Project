// 파일 위치: App.tsx (가장 바깥에 있는 파일이야!)

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import SpaceShooter from './pages/SpaceShooter';
import './App.css';

function App() {
  // 1. 우리 프로젝트의 '아파트 이름'을 여기에 정확하게 적어주는 거야.
  const basename = "/251031-test-my-React-Project/";

  return (
    // 2. BrowserRouter에게 우리가 어디 사는지(basename) 알려주자!
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/neonbreaker" element={<SpaceShooter />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;