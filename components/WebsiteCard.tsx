import React from 'react';
import { Website } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { Link } from 'react-router-dom';

interface WebsiteCardProps {
  website: Website;
  onDelete: (id: string) => void;
  onEdit: (website: Website) => void;
  viewColumns: 1 | 2 | 3; // "지금 몇 열 모드야?" 라는 정보를 받아.
}

const WebsiteCard: React.FC<WebsiteCardProps> = ({ website, onDelete, onEdit, viewColumns }) => {
  const cardInnerContent = (
    <>
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={website.thumbnailUrl}
          alt={website.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {/* "1열 모드"일 때와 아닐 때, 글자 크기와 여백을 다르게 조절하는 똑똑한 코드! */}
      <div className={`flex flex-col flex-grow ${viewColumns === 1 ? 'p-6' : 'p-4'}`}>
        <h3 className={`font-bold text-text-primary mb-1 truncate ${viewColumns === 1 ? 'text-xl' : 'text-base'}`}>{website.name}</h3>
        <p className={`text-text-secondary flex-grow line-clamp-3 ${viewColumns === 1 ? 'text-base' : 'text-xs'}`}>{website.description}</p>
      </div>

      <div className={`pt-0 mt-auto ${viewColumns === 1 ? 'p-5' : 'p-3'}`}>
        <div className="border-t border-border pt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => { e.preventDefault(); onEdit(website); }}
            className="w-full flex justify-center items-center gap-2 p-2 bg-primary/80 text-white font-semibold rounded-md shadow-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            aria-label={`${website.name} 수정`}
            title="수정"
          >
            <PencilIcon />
            {viewColumns === 1 && <span>수정</span>} {/* 1열일 때만 글씨가 보여! */}
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onDelete(website.id); }}
            className="w-full flex justify-center items-center gap-2 p-2 bg-red-500/80 text-white font-semibold rounded-md shadow-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
            aria-label={`${website.name} 삭제`}
            title="삭제"
          >
            <TrashIcon />
            {viewColumns === 1 && <span>삭제</span>} {/* 1열일 때만 글씨가 보여! */}
          </button>
        </div>
      </div>
    </>
  );
  
  const cardClassName = "glass-panel overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-primary/20 hover:shadow-2xl flex flex-col group";

  if (website.path) {
    return (
      <Link to={website.path} className={cardClassName}>
        {cardInnerContent}
      </Link>
    );
  }

  return (
    <a href={website.url} target="_blank" rel="noopener noreferrer" className={cardClassName}>
      {cardInnerContent}
    </a>
  );
};

export default WebsiteCard;