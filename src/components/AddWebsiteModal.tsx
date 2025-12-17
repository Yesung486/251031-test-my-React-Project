import React, { useState, useEffect } from 'react';
import { Website } from '../types';

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (websiteData: Omit<Website, 'id' | 'thumbnailUrl'>) => void;
}

const AddWebsiteModal: React.FC<AddWebsiteModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('게임');
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setCategory('게임');
      setUrl('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim() && url.trim()) {
      onAdd({ name, description, category, url });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-lg shadow-2xl p-8 w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-text-primary mb-6">새 웹사이트 만들기</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="website-name" className="block text-text-secondary text-sm font-bold mb-2">
              웹사이트 이름
            </label>
            <input
              id="website-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 나의 멋진 포트폴리오"
              className="w-full px-3 py-2 text-text-primary bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="website-url" className="block text-text-secondary text-sm font-bold mb-2">
              URL
            </label>
            <input
              id="website-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 text-text-primary bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="website-category" className="block text-text-secondary text-sm font-bold mb-2">
              카테고리
            </label>
            <select
              id="website-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-text-primary bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="게임">게임</option>
              <option value="음악">음악</option>
              <option value="학습">학습</option>
              <option value="기타">기타</option>
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="website-description" className="block text-text-secondary text-sm font-bold mb-2">
              설명
            </label>
            <textarea
              id="website-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="웹사이트에 대한 짧은 설명"
              className="w-full px-3 py-2 text-text-primary bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
              required
            />
          </div>
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              웹사이트 만들기
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AddWebsiteModal;