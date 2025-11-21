
import React from 'react';

interface ResultPanelProps {
  isLoading: boolean;
  generatedImage: string | null;
  error: string | null;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500"></div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Generating your look...</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">The AI is working its magic. This may take a moment.</p>
    </div>
);

const IdleState: React.FC = () => (
    <div className="text-center text-slate-500 dark:text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        <p className="mt-4 font-medium">Your virtual try-on will appear here.</p>
        <p className="text-sm">Upload your photos and click "Virtual Try-On".</p>
    </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
    <div className="text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-2 font-semibold">Oops! Something went wrong.</p>
        <p className="text-sm mt-1">{message}</p>
    </div>
);

const ResultPanel: React.FC<ResultPanelProps> = ({ isLoading, generatedImage, error }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Step 3: Result</h2>
      <div className="mt-4 flex-grow flex items-center justify-center bg-slate-100 dark:bg-slate-800/50 rounded-lg min-h-[300px] md:min-h-0">
        {isLoading && <LoadingSpinner />}
        {!isLoading && error && <ErrorState message={error} />}
        {!isLoading && !error && generatedImage && (
          <div className="p-2 w-full h-full">
            <img src={generatedImage} alt="Generated virtual try-on" className="w-full h-full object-contain rounded-md" />
          </div>
        )}
        {!isLoading && !error && !generatedImage && <IdleState />}
      </div>
    </div>
  );
};

export default ResultPanel;
