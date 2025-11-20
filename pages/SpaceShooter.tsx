// 파일 위치: pages/SpaceShooter.tsx

import React from 'react';

const SpaceShooter = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: '2rem',
      backgroundColor: '#111827' // 배경색을 어둡게
    }}>
      <h1 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '2rem' }}>
        🚀 스페이스 슈터 게임 🚀
      </h1>

      {/* ↓↓↓ 여기에 너의 AI 스튜디오 앱 URL을 붙여넣으면 돼! ↓↓↓ */}
      <iframe
        src="https://aistudio.google.com/apps/drive/1cm9_MJCX5AssdWzvTfPtqeTYzvgiRjhV?showAssistant=true&showPreview=true&resourceKey="
        style={{
          width: '800px',
          height: '600px',
          border: '2px solid #4B5563',
          borderRadius: '10px'
        }}
        title="AI Studio Space Shooter Game"
      />
    </div>
  );
};

export default SpaceShooter;