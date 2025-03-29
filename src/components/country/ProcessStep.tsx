
import React from 'react';

interface ProcessStepProps {
  step: number;
  title: string;
  description: string;
  isLast?: boolean;
}

const ProcessStep: React.FC<ProcessStepProps> = ({ step, title, description, isLast = false }) => {
  // Don't render if title is empty (handles empty process steps)
  if (!title.trim()) {
    return null;
  }
  
  return (
    <div className="relative pb-8">
      {!isLast && (
        <div className="absolute top-0 left-5 ml-px border-l-2 border-teal-300 h-full z-0"></div>
      )}
      <div className="flex items-start relative z-10">
        <div className="flex-shrink-0 bg-teal-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shadow-sm">
          {step}
        </div>
        <div className="ml-4">
          <h3 className="font-medium text-gray-900 text-base sm:text-lg">{title}</h3>
          <p className="text-gray-600 text-sm sm:text-base mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default ProcessStep;
