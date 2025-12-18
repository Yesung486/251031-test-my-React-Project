// 파일 위치: pages/Homepage.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { Website, WebsiteCategory } from '../types';
import WebsiteList from '../components/WebsiteList';
import AddWebsiteModal from '../components/AddWebsiteModal';
import EditWebsiteModal from '../components/EditWebsiteModal';
import { PlusIcon } from '../components/icons/PlusIcon';
import Navbar from '../components/Navbar';

const Homepage: React.FC = () => {
  const [websites, setWebsites] = useState<Website[]>([
    { id: '1', name: '네온 브레이커 게임', description: '집중력 향상을 위한 벽돌깨기 게임 페이지로 이동합니다.', thumbnailUrl: 'https://picsum.photos/seed/neonbreaker/500/300', category: '게임', url: '#', path: '/neonbreaker', },
    { id: '2', name: 'AI 가상 피팅', description: 'AI를 사용하여 옷을 가상으로 입어보는 페이지로 이동합니다.', thumbnailUrl: 'https://picsum.photos/seed/tryon/500/300', category: '기타', url: '#', path: '/virtual-try-on', },
    { id: '3', name: 'AIVOCA 단어장', description: 'AI와 함께 나만의 영어 단어장을 만들고 학습하는 앱입니다.', thumbnailUrl: 'https://picsum.photos/seed/aivoca/500/300', category: '학습', url: '#', path: '/aivoca', },
    { id: '4', name: '서바이벌게임', description: '서바이벌 게임을 즐길 수 있는 페이지입니다.', thumbnailUrl: 'https://picsum.photos/seed/survivor/500/300', category: '게임', url: '#', path: '/survivor-game', },
    { id: '5', name: '다리 만드는 게임', description: '다리 만드는 게임을 즐길 수 있는 페이지입니다.', thumbnailUrl: 'https://picsum.photos/seed/drawbridge/500/300', category: '게임', url: '#', path: '/drawbridgegame', },
    { id: '6', name: '지하철 러너 게임', description: '지하철 러너 게임을 즐길 수 있는 페이지입니다.', thumbnailUrl: 'https://picsum.photos/seed/subwayrunner/500/300', category: '게임', url: '#', path: '/subway-runner', },
    { id: '7', name: '슬라이스 게임', description: '과일을 슬라이스하는 재미있는 게임 페이지로 이동합니다.', thumbnailUrl: 'https://picsum.photos/seed/slicegame/500/300', category: '게임', url: '#', path: '/slice-game', },
    { id: '8', name: '네온 스택 게임', description: '네온 블록을 쌓아 올리는 스택 게임 페이지로 이동합니다.', thumbnailUrl: 'https://picsum.photos/seed/neonstack/500/300', category: '게임', url: '#', path: '/neon-stack', },
    
    // 👇 [여기에 추가했어!]
    { 
      id: '9', 
      name: '제너레이티브 아트', 
      description: '코드로 그려지는 아름다운 예술 작품을 감상해보세요.', 
      thumbnailUrl: 'https://picsum.photos/seed/genart/500/300', 
      category: '예술', 
      url: '#', 
      path: '/generative-art', // ★ App.tsx에 등록한 주소랑 똑같아야 해!
    },
    {
    id: '10',
    name: '키네틱 타이포 스튜디오',
    description: '텍스트가 입자로 변해 마우스에 반응하는 인터랙티브 아트입니다. 직접 디자인해보세요!',
    thumbnailUrl: 'https://picsum.photos/seed/kinetic/500/300', // 썸네일은 나중에 예쁜걸로 바꾸세요
    category: '예술', 
    url: '#',
    path: '/kinetic-typo', // 👈 아까 App.tsx에서 만든 주소랑 똑같아야 합니다!
  },
  { 
    id: '11', 
    name: 'LP 커버 메이커', 
    description: '나만의 감성적인 LP판 커버를 디자인하고 만들어보세요.', 
    thumbnailUrl: 'https://picsum.photos/seed/lpvinyl/500/300', 
    category: '예술', 
    url: '#', 
    path: '/LP-cover-maker', // ★ 중요: App.tsx에 이 주소를 등록해야 해!
  },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [activeCategory, setActiveCategory] = useState<WebsiteCategory | '전체'>('전체');

  const handleOpenModal = useCallback(() => { setIsModalOpen(true); }, []);
  const handleCloseModal = useCallback(() => { setIsModalOpen(false); }, []);
  const handleOpenEditModal = useCallback((website: Website) => { setEditingWebsite(website); setIsEditModalOpen(true); }, []);
  const handleCloseEditModal = useCallback(() => { setIsEditModalOpen(false); setEditingWebsite(null); }, []);
  const handleAddWebsite = useCallback((websiteData: Omit<Website, 'id' | 'thumbnailUrl'>) => { const newWebsite: Website = { ...websiteData, id: new Date().toISOString(), thumbnailUrl: `https://picsum.photos/seed/${Math.random()}/500/300` }; setWebsites(prevWebsites => [newWebsite, ...prevWebsites]); handleCloseModal(); }, [handleCloseModal]);
  const handleUpdateWebsite = useCallback((updatedWebsite: Website) => { setWebsites(prevWebsites => prevWebsites.map(website => website.id === updatedWebsite.id ? updatedWebsite : website)); handleCloseEditModal(); }, [handleCloseEditModal]);
  const handleDeleteWebsite = useCallback((id: string) => { setWebsites(prevWebsites => prevWebsites.filter(website => website.id !== id)); }, []);
  const handleCategoryChange = (category: string) => { setActiveCategory(category); };

  const filteredWebsites = useMemo(() => {
    if (activeCategory === '전체') return websites;
    return websites.filter(website => website.category === activeCategory);
  }, [websites, activeCategory]);

  return (
    <>
      <Navbar activeCategory={activeCategory as string} onCategoryChange={handleCategoryChange} />
      <div className="main-header mt-8 px-4 flex justify-between items-center">
        <h2 className="main-title">내 웹사이트</h2>
        <button
          onClick={handleOpenModal}
          className="add-website-button"
        >
          <PlusIcon />
        </button>
      </div>
      <WebsiteList
        websites={filteredWebsites}
        onDelete={handleDeleteWebsite}
        onEdit={handleOpenEditModal}
      />
      <AddWebsiteModal isOpen={isModalOpen} onClose={handleCloseModal} onAdd={handleAddWebsite} />
      <EditWebsiteModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} onUpdate={handleUpdateWebsite} website={editingWebsite} />
    </>
  );
};

export default Homepage;