// 파일 위치: components/WebsiteCard.tsx

import React from 'react';
import { Website } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { Link } from 'react-router-dom'; // 1. SPA 페이지 이동을 위한 Link 불러오기!

interface WebsiteCardProps {
  website: Website;
  onDelete: (id: string) => void;
  onEdit: (website: Website) => void;
}

const WebsiteCard: React.FC<WebsiteCardProps> = ({ website, onDelete, onEdit }) => {
  // 2. 카드 내용은 똑같아.
  const cardInnerContent = (
    <>
      <img
        src={website.thumbnailUrl}
        alt={website.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-text-primary mb-2 truncate group-hover:text-primary transition-colors">{website.name}</h3>
        <p className="text-text-secondary text-sm flex-grow">{website.description}</p>
      </div>
      <div className="p-5 pt-0 mt-auto flex gap-2">
        <button
          onClick={(e) => {
            e.preventDefault(); // 3. 중요: 이걸로 링크 이동을 막고 수정 기능만 실행!
            onEdit(website);
          }}
          className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label={`${website.name} 수정`}
        >
          <PencilIcon />
          수정
        </button>
        <button
          onClick={(e) => {
            e.preventDefault(); // 3. 중요: 이걸로 링크 이동을 막고 삭제 기능만 실행!
            onDelete(website.id);
          }}
          className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label={`${website.name} 삭제`}
        >
          <TrashIcon />
          삭제
        </button>
      </div>
    </>
  );

  // 4. 만약 카드에 path가 있다면, SPA 링크로! 없다면, 원래대로 외부 링크로 만들어주는 똑똑한 코드!
  if (website.path) {
    return (
      <Link
        to={website.path}
        className="bg-surface rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-2xl duration-300 flex flex-col group h-full"
      >
        {cardInnerContent}
      </Link>
    );
  }

  return (
    <a
      href={website.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-surface rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-2xl duration-300 flex flex-col group h-full"
    >
      {cardInnerContent}
    </a>
  );
};

export default WebsiteCard;