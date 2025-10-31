import React from 'react';
import { Website } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';

interface WebsiteCardProps {
  website: Website;
  onDelete: (id: string) => void;
  onEdit: (website: Website) => void;
}

const WebsiteCard: React.FC<WebsiteCardProps> = ({ website, onDelete, onEdit }) => {
  return (
    <div className="bg-surface rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-2xl duration-300 flex flex-col group">
      <a href={website.url} target="_blank" rel="noopener noreferrer" aria-label={`'${website.name}' 웹사이트로 이동`}>
        <img
          src={website.thumbnailUrl}
          alt={website.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-text-primary mb-2 truncate group-hover:text-primary transition-colors">{website.name}</h3>
          <p className="text-text-secondary text-sm flex-grow">{website.description}</p>
        </div>
      </a>
       <div className="p-5 pt-0 mt-auto flex gap-2">
         <button
            onClick={() => onEdit(website)}
            className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label={`${website.name} 수정`}
          >
            <PencilIcon />
            수정
          </button>
         <button
            onClick={() => onDelete(website.id)}
            className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label={`${website.name} 삭제`}
          >
            <TrashIcon />
            삭제
          </button>
       </div>
    </div>
  );
};

export default WebsiteCard;
