import React from 'react';
// 👇 파일 위치 잘 확인해! components 폴더 안에 있어야 해
import Art from '../components/generative-art/Art';

const GenerativeArtPage: React.FC = () => {
  return (
    // 화면 꽉 채우기 + 중앙 정렬 + 검은 배경 (예술 작품이라 검은색이 어울려!)
    <div className="w-full h-[calc(100vh-80px)] bg-black overflow-hidden relative">
      
      {/* 작품이 화면 크기에 딱 맞게 들어가도록 설정 */}
      <div className="absolute top-0 left-0 w-full h-full">
        <Art />
      </div>

    </div>
  );
};

export default GenerativeArtPage;