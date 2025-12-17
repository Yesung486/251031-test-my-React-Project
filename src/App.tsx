// 파일 위치: App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Homepage from './pages/Homepage';
import SpaceShooter from './pages/SpaceShooter';
import VirtualTryOnPage from './pages/VirtualTryOnPage';
import AivocaPage from './pages/AivocaPage';
import SurvivorGamePage from './pages/SurvivorGamePage';
import DrawBridgeGame from './pages/DrawBridgeGamePage';
import { ThemeProvider } from '../contexts/ThemeContext';
import './App.css';

function App() {
  const basename = "/251031-test-my-React-Project/";

  return (
    <ThemeProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Homepage />} />
            <Route path="neonbreaker" element={<SpaceShooter />} />
            <Route path="virtual-try-on" element={<VirtualTryOnPage />} />
            <Route path="aivoca" element={<AivocaPage />} />
            <Route path="survivor-game" element={<SurvivorGamePage />} />
            <Route path="drawbridgegame" element={<DrawBridgeGame />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;