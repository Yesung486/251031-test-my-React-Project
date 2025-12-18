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
import SubwayRunnerGamePage from './pages/SubwayRunnerGamePage';
import SliceGame from './components/slice-game/SliceGame';
import NeonStackPage from './pages/NeonStackPage';
import GenerativeArtPage from './pages/GenerativeArtPage';
import TypoStudioPage from './pages/TypoStudioPage';
import { ThemeProvider } from '../contexts/ThemeContext';
import './App.css';
import { Slice } from 'lucide-react';

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
            <Route path="subway-runner" element={<SubwayRunnerGamePage />} />
            <Route path="slice-game" element={<SliceGame />} />
            <Route path="neon-stack" element={<NeonStackPage />} />
            <Route path="generative-art" element={<GenerativeArtPage />} />
            <Route path="/kinetic-typo" element={<TypoStudioPage />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;