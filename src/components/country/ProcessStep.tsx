
import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react'; // Adding a default icon

interface ProcessStepProps {
  step: number;
  title: string;
  description: string;
  isLast?: boolean;
  icon?: React.ReactNode; // Making icon optional
}

const ProcessStep: React.FC<ProcessStepProps> = ({ step, title, description, icon, isLast = false }) => {
  // Don't render if title is empty (handles empty process steps)
  if (!title.trim()) {
    return null;
  }
  
  // Default icon if none provided
  const displayIcon = icon || <FileText className="h-6 w-6" />;
  
  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.1 * step }}
    >
      <div className="flex items-start gap-4 relative z-10">
        <div className="flex flex-col items-center">
          <motion.div
            className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center shadow-md relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-teal-600 text-sm font-bold shadow-sm">
              {step}
            </span>
            <div className="text-white">
              {displayIcon}
            </div>
          </motion.div>
          
          {!isLast && (
            <div className="w-0.5 h-16 bg-gradient-to-b from-teal-500 to-transparent mt-3"></div>
          )}
        </div>
        
        <div className="pt-2">
          <h3 className="font-medium text-gray-900 text-lg sm:text-xl mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProcessStep;
