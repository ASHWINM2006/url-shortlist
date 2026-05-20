import React from 'react';
import { clsx } from 'clsx';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div
      className={clsx(
        'rounded-full border-primary-500/30 border-t-primary-500 animate-spin',
        sizes[size],
        className
      )}
      style={{ borderWidth: size === 'md' ? '3px' : undefined }}
    />
  );
};

export const PageLoader = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-400 text-sm animate-pulse">Loading...</p>
    </div>
  </div>
);

export default LoadingSpinner;
