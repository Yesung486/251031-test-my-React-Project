
import React, { useRef } from 'react';

interface ImageUploaderProps {
  title: string;
  subtitle: string;
  onImageUpload: (dataUrl: string) => void;
  image: string | null;
  disabled?: boolean;
}

const UploadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, subtitle, onImageUpload, image, disabled = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg h-full flex flex-col justify-between transition-opacity duration-300">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>

      <div
        className={`mt-4 flex-grow flex items-center justify-center border-2 border-dashed rounded-lg transition-all duration-300 ${
          disabled
            ? 'cursor-not-allowed bg-slate-100 dark:bg-slate-800/50'
            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer'
        }`}
        onClick={!disabled ? handleUploadClick : undefined}
      >
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        {image ? (
          <div className="relative w-full h-full p-2">
            <img src={image} alt="Upload preview" className="w-full h-full object-contain rounded-md" />
          </div>
        ) : (
          <div className="text-center p-8">
            <UploadIcon />
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;