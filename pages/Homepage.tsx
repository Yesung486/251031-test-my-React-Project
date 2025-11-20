// 파일 위치: pages/Homepage.tsx

import React, { useState, useCallback } from 'react';
import { Website } from '../types';
import Header from '../components/Header';
import WebsiteList from '../components/WebsiteList';
import AddWebsiteModal from '../components/AddWebsiteModal';
import EditWebsiteModal from '../components/EditWebsiteModal';
import { PlusIcon } from '../components/icons/PlusIcon';
import Footer from '../components/Footer';

// 'App'이었던 이름을 'Homepage'로 바꿔줬어.
const Homepage: React.FC = () => {
  // --- 이 안의 모든 내용은 네 코드 그대로야! ---
  const [websites, setWebsites] = useState<Website[]>([
    {
      id: '1',
      name: '내 개인 블로그',
      description: '기술과 삶에 대한 제 생각을 공유하는 공간입니다.',
      thumbnailUrl: 'https://picsum.photos/seed/blog/500/300',
      category: '음악',
      url: 'https://example.com/blog',
    },
    {
      id: '2',
      name: '이커머스 스토어',
      description: '수제 공예품과 독특한 아이템을 판매합니다.',
      thumbnailUrl: 'https://picsum.photos/seed/store/500/300',
      category: '게임',
      url: 'https://example.com/store',
    },
     {
      id: '3',
      name: '사진 포트폴리오',
      description: '전 세계에서 찍은 최고의 작품들을 선보입니다.',
      thumbnailUrl: 'https://picsum.photos/seed/portfolio/500/300',
      category: '음악',
      url: 'https://example.com/portfolio',
    },
    {
      id: '4',
      name: '게임 리뷰 사이트',
      description: '최신 게임들에 대한 심층 리뷰.',
      thumbnailUrl: 'https://picsum.photos/seed/review/500/300',
      category: '게임',
      url: 'https://example.com/reviews',
    },
    // ↓↓↓ 바로 이 부분을 새로 추가했어! ↓↓↓
    {
      id: '5',
      name: '네온 브레이커 게임',
      description: '집중력 향상을 위한 벽돌깨기 게임 페이지로 이동합니다.',
      thumbnailUrl: 'https://picsum.photos/seed/neonbreaker/500/300',
      category: '게임',
      url: '#', // 내부 페이지로 이동할 거라 외부 주소는 필요 없어!
      path: '/neonbreaker', // <-- 이게 바로 그 '특별한 이정표'야!
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [activeCategory, setActiveCategory] = useState('전체');

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleOpenEditModal = useCallback((website: Website) => {
    setEditingWebsite(website);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingWebsite(null);
  }, []);

  const handleAddWebsite = useCallback((websiteData: Omit<Website, 'id' | 'thumbnailUrl'>) => {
    const newWebsite: Website = {
      ...websiteData,
      id: new Date().toISOString(),
      thumbnailUrl: `https://picsum.photos/seed/${Math.random()}/500/300`,
    };
    setWebsites(prevWebsites => [newWebsite, ...prevWebsites]);
    handleCloseModal();
  }, [handleCloseModal]);

  const handleUpdateWebsite = useCallback((updatedWebsite: Website) => {
    setWebsites(prevWebsites =>
      prevWebsites.map(website =>
        website.id === updatedWebsite.id ? updatedWebsite : website
      )
    );
    handleCloseEditModal();
  }, [handleCloseEditModal]);

  const handleDeleteWebsite = useCallback((id: string) => {
    setWebsites(prevWebsites => prevWebsites.filter(website => website.id !== id));
  }, []);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const filteredWebsites = websites.filter(
    website => activeCategory === '전체' || website.category === activeCategory
  );

  return (
    <div className="app-container">
      <Header activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
      <main className="main-content">
        <div className="main-header">
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
      </main>
      <AddWebsiteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAdd={handleAddWebsite}
      />
      <EditWebsiteModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onUpdate={handleUpdateWebsite}
        website={editingWebsite}
      />
      <Footer />
    </div>
  );
};

// 마지막 이름도 Homepage로 바꿔서 내보내기!
export default Homepage;