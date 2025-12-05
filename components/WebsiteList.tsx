// 파일 위치: components/WebsiteList.tsx

import React from 'react';
import { Website } from '../types';
import WebsiteCard from './WebsiteCard';

interface WebsiteListProps {
  websites: Website[];
  onDelete: (id: string) => void;
  onEdit: (website: Website) => void;
}

const WebsiteList: React.FC<WebsiteListProps> = ({ websites, onDelete, onEdit }) => {
  if (websites.length === 0) {
    return (
      <div className="text-center py-20 bg-surface rounded-lg glass-panel mt-8">
        <h3 className="text-2xl font-semibold text-text-primary">표시할 웹사이트가 없습니다.</h3>
        <p className="text-text-secondary mt-2">다른 카테고리를 선택하거나 새 웹사이트를 추가해 보세요.</p>
      </div>
    );
  }

  // ↓↓↓ 바로 이 부분! TailwindCSS 대신, style 속성으로 직접 명령을 내릴 거야! ↓↓↓
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // 화면 크기에 따라 3~5개가 자동으로 보이게!
      gap: '1.5rem',
      marginTop: '2rem'
    }}>
      {websites.map(website => (
        <WebsiteCard key={website.id} website={website} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </div>
  );
};

export default WebsiteList;