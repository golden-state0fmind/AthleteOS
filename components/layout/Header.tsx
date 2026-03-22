'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBackButton = true,
  onBack 
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 bg-background border-b border-white/10 z-40">
      <div className="flex items-center h-16 max-w-screen-xl mx-auto px-4">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 mr-2 text-white/80 hover:text-white active:text-accent transition-colors duration-200 rounded-lg"
            aria-label="Go back"
          >
            <BackIcon className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-xl font-semibold text-white">{title}</h1>
      </div>
    </header>
  );
};

// Back Icon Component
const BackIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);
