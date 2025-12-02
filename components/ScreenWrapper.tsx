import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../types';

interface ScreenWrapperProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
  footerContent?: React.ReactNode;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, title, showBackButton = true, footerContent }) => {
  const { setCurrentScreen, ageGroup } = useAppContext();

  const getWrapperClass = () => {
    switch (ageGroup) {
      case '7-9':
        return "w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 relative min-h-[calc(100vh-2rem)] flex flex-col";
      case '10-12':
        return "w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 relative min-h-[calc(100vh-2rem)] flex flex-col";
      default:
        return "w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 relative min-h-[calc(100vh-2rem)] flex flex-col";
    }
  };

  return (
    <div className="flex flex-col items-center justify-start p-4 min-h-screen">
        <div className={getWrapperClass()}>
            <main className="flex-grow flex flex-col">
                {title && (
                    <header className="relative flex items-center justify-center mb-6">
                        {showBackButton && (
                            <button
                            onClick={() => setCurrentScreen(Screen.Home)}
                            className="absolute left-0 text-teal-600 hover:text-teal-800 text-4xl leading-none"
                            aria-label="Back to Home"
                            >
                            ‹
                            </button>
                        )}
                        <h1 className="text-3xl font-bold text-center text-teal-800 px-12">{title}</h1>
                    </header>
                )}
                {children}
            </main>
            {footerContent && (
                <footer className="text-center pt-6 text-gray-500 border-t border-gray-200/80 mt-8">
                    {footerContent}
                </footer>
            )}
        </div>
    </div>
  );
};

export default ScreenWrapper;