// 파일 위치: components/ai-virtual-try-on/VirtualTryOnApp.tsx

import React, { useState, useCallback } from 'react';
// 1. 주소를 우리 프로젝트에 맞게 모두 수정했어!
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ResultPanel from './components/ResultPanel';
import { generateVirtualTryOn } from './services/geminiService';

// 2. 이름도 VirtualTryOnApp으로 바꿨어.
const VirtualTryOnApp: React.FC = () => {
  // --- 이 안의 모든 내용은 네 코드 그대로야! ---
  const [userImage, setUserImage] = useState<string | null>(null);
  const [clothingImage, setClothingImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!userImage || !clothingImage) {
      setError('Please upload both a person and a clothing image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      // 중요! 이 부분은 나중에 API 키 설정이 필요할 수 있어. 일단 지금은 그대로 둘게.
      const resultImageUrl = await generateVirtualTryOn(userImage, clothingImage);
      setGeneratedImage(resultImageUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate image. ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userImage, clothingImage]);

  const handleReset = () => {
    setUserImage(null);
    setClothingImage(null);
    setGeneratedImage(null);
    setIsLoading(false);
    setError(null);
  };

  const canGenerate = userImage && clothingImage && !isLoading;

  return (
    // 3. 이 앱은 자체 헤더/푸터를 가지고 있으니, 우리 웹사이트의 Layout과는 별개로 작동하도록 할게.
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ImageUploader title="Step 1: Your Photo" subtitle="Upload a full-body photo of yourself." onImageUpload={setUserImage} image={userImage} disabled={isLoading} />
          <ImageUploader title="Step 2: Clothing Item" subtitle="Upload a clear photo of the clothing." onImageUpload={setClothingImage} image={clothingImage} disabled={isLoading || !userImage} />
          <ResultPanel isLoading={isLoading} generatedImage={generatedImage} error={error} />
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button onClick={handleGenerate} disabled={!canGenerate} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104l-2.28 2.28-1.06-1.06a1.5 1.5 0 00-2.12 0l-.88.88a1.5 1.5 0 000 2.12l1.06 1.06L2.25 9.75l1.06 1.06-2.28 2.28a1.5 1.5 0 000 2.12l.88.88a1.5 1.5 0 002.12 0l2.28-2.28 1.06 1.06a1.5 1.5 0 002.12 0l.88-.88a1.5 1.5 0 000-2.12l-1.06-1.06 2.28-2.28a1.5 1.5 0 000-2.12l-.88-.88a1.5 1.5 0 00-2.12 0L9.75 5.384l-1.06-1.06a1.5 1.5 0 00-2.12 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.375 12.735l-1.06-1.06 2.28-2.28a1.5 1.5 0 000-2.12l-.88-.88a1.5 1.5 0 00-2.12 0l-2.28 2.28-1.06-1.06a1.5 1.5 0 00-2.12 0l-.88.88a1.5 1.5 0 000 2.12l1.06 1.06-2.28 2.28a1.5 1.5 0 000 2.12l.88.88a1.5 1.5 0 002.12 0l2.28-2.28 1.06 1.06a1.5 1.5 0 002.12 0l.88-.88a1.5 1.5 0 000-2.12z" /></svg>
            Virtual Try-On
          </button>
          {(userImage || clothingImage) && (<button onClick={handleReset} className="w-full sm:w-auto px-6 py-3 font-medium text-slate-600 dark:text-slate-300 bg-transparent rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">Start Over</button>)}
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-slate-500">
        Powered by Gemini.
      </footer>
    </div>
  );
};

export default VirtualTryOnApp;