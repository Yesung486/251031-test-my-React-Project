import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ResultPanel from './components/ResultPanel';
import { generateVirtualTryOn } from './services/geminiService';

interface VirtualTryOnAppState {
  userImage: string | null;
  clothingImage: string | null;
  generatedImage: string | null;
  isLoading: boolean;
  error: string | null;
}

const VirtualTryOnApp: React.FC = () => {
  const [state, setState] = useState<VirtualTryOnAppState>({
    userImage: null,
    clothingImage: null,
    generatedImage: null,
    isLoading: false,
    error: null,
  });

  const handleGenerate = useCallback(async () => {
    if (!state.userImage || !state.clothingImage) {
      setState((prev) => ({ ...prev, error: 'Please upload both a person and a clothing image.' }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null, generatedImage: null }));

    try {
      const resultImageUrl = await generateVirtualTryOn(state.userImage, state.clothingImage);
      setState((prev) => ({ ...prev, generatedImage: resultImageUrl, isLoading: false }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setState((prev) => ({ ...prev, error: `Failed to generate image. ${errorMessage}`, isLoading: false }));
      console.error(err);
    }
  }, [state.userImage, state.clothingImage]);

  const handleReset = () => {
    setState({
      userImage: null,
      clothingImage: null,
      generatedImage: null,
      isLoading: false,
      error: null,
    });
  };

  const canGenerate = state.userImage && state.clothingImage && !state.isLoading;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ImageUploader
            title="Step 1: Your Photo"
            subtitle="Upload a full-body photo of yourself."
            onImageUpload={(img) => setState((prev) => ({ ...prev, userImage: img }))}
            image={state.userImage}
            disabled={state.isLoading}
          />
          <ImageUploader
            title="Step 2: Clothing Item"
            subtitle="Upload a clear photo of the clothing."
            onImageUpload={(img) => setState((prev) => ({ ...prev, clothingImage: img }))}
            image={state.clothingImage}
            disabled={state.isLoading || !state.userImage}
          />
          <ResultPanel
            isLoading={state.isLoading}
            generatedImage={state.generatedImage}
            error={state.error}
          />
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 3.104l-2.28 2.28-1.06-1.06a1.5 1.5 0 00-2.12 0l-.88.88a1.5 1.5 0 000 2.12l1.06 1.06L2.25 9.75l1.06 1.06-2.28 2.28a1.5 1.5 0 000 2.12l.88.88a1.5 1.5 0 002.12 0l2.28-2.28 1.06 1.06a1.5 1.5 0 002.12 0l.88-.88a1.5 1.5 0 000-2.12l-1.06-1.06 2.28-2.28a1.5 1.5 0 000-2.12l-.88-.88a1.5 1.5 0 00-2.12 0L9.75 5.384l-1.06-1.06a1.5 1.5 0 00-2.12 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.375 12.735l-1.06-1.06 2.28-2.28a1.5 1.5 0 000-2.12l-.88-.88a1.5 1.5 0 00-2.12 0l-2.28 2.28-1.06-1.06a1.5 1.5 0 00-2.12 0l-.88.88a1.5 1.5 0 000 2.12l1.06 1.06-2.28 2.28a1.5 1.5 0 000 2.12l.88.88a1.5 1.5 0 002.12 0l2.28-2.28 1.06 1.06a1.5 1.5 0 002.12 0l.88-.88a1.5 1.5 0 000-2.12z"
              />
            </svg>
            Virtual Try-On
          </button>
          {(state.userImage || state.clothingImage) && (
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-3 font-medium text-slate-600 dark:text-slate-300 bg-transparent rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-slate-500">
        Powered by Gemini.
      </footer>
    </div>
  );
};

export default VirtualTryOnApp;