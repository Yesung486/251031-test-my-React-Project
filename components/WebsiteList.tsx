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
      <div className="text-center py-20 bg-surface rounded-lg">
        <h3 className="text-2xl font-semibold text-text-primary">표시할 웹사이트가 없습니다.</h3>
        <p className="text-text-secondary mt-2">다른 카테고리를 선택하거나 새 웹사이트를 추가해 보세요.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {websites.map(website => (
        <WebsiteCard key={website.id} website={website} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </div>
  );
};

export default WebsiteList;
