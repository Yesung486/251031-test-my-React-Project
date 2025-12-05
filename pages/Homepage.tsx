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
      {/* ↓↓↓ 바로 이 부분! '1, 2, 3열' 버튼을 깨끗하게 지웠어! ↓↓↓ */}
      <div className="main-header mt-8 px-4 flex justify-between items-center">
        <h2 className="main-title">내 웹사이트</h2>
        <button
          onClick={handleOpenModal}
          className="add-website-button"
        >
          <PlusIcon />
          새로 만들기
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