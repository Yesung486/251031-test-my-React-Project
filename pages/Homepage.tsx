// 파일 위치: pages/Homepage.tsx

// 1. 부품(컴포넌트)들의 주소를 정확하게 수정했어! '../' -> '../'
import React, { useState, useCallback } from 'react';
import { Website } from '../types'; // types.ts는 밖에 있으니 ../types가 맞아!
import Header from '../components/Header';
import WebsiteList from '../components/WebsiteList';
import AddWebsiteModal from '../components/AddWebsiteModal';
import EditWebsiteModal from '../components/EditWebsiteModal';
import { PlusIcon } from '../components/icons/PlusIcon';
import Footer from '../components/Footer';

// 'App'이었던 이름을 'Homepage'로 바꿔줬어.
const Homepage: React.FC = () => {
  // --- 이 안의 모든 내용은 네 코드 그대로야! 하나도 안 건드렸어. ---
  const [websites, setWebsites] = useState<Website[]>([
    {
      id: '1',
      name: '내 개인 블로그',
      description: '기술과 삶에 대한 제 생각을 공유하는 공간입니다.',
      thumbnailUrl: 'https://picsum.photos/seed/blog/500/300',
      category: '음악',
      url: 'https://example.com/blog',
    },
    // ... (나머지 카드 데이터는 그대로) ...
    {
      id: '4',
      name: '게임 리뷰 사이트',
      description: '최신 게임들에 대한 심층 리뷰.',
      thumbnailUrl: 'https://picsum.photos/seed/review/500/300',
      category: '게임',
      url: 'https://example.com/reviews',
    }
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