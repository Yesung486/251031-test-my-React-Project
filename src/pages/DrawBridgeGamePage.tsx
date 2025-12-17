// src/pages/DrawbridgegamePage.tsx
import React from 'react';
// 1. 게임 본체를 불러와서
import DrawBridgeDrive from '../components/draw-bridge-drive/DrawBridgeGame';

const DrawbridgegamePage: React.FC = () => {
  return (
    // 2. 여기서 보여줌 (포장)
    <DrawBridgeDrive />
  );
};

export default DrawbridgegamePage;