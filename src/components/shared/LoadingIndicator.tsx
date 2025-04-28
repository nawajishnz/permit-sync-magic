
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  size = 'md', 
  text, 
  className = '' 
}) => {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const iconSize = sizeMap[size];
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${iconSize} animate-spin text-gray-500`} />
      {text && <span className="ml-3 text-gray-700">{text}</span>}
    </div>
  );
};

export default LoadingIndicator;
