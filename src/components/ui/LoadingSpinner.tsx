import React from 'react';
import { Clock } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <Clock className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
        <div className={`absolute inset-0 ${sizeClasses[size]} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
      </div>
      {message && (
        <p className="mt-3 text-sm text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
};