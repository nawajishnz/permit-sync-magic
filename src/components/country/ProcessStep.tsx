
import React from 'react';
import { FileText } from 'lucide-react';

export interface Step {
  step: number;
  title: string;
  description: string;
}

export interface ProcessStepProps {
  steps: Step[];
}

const ProcessStep: React.FC<ProcessStepProps> = ({ steps }) => {
  if (!steps || steps.length === 0) {
    return null;
  }
  
  return (
    <div className="my-6">
      <h3 className="text-xl font-semibold mb-4">Application Process</h3>
      <div className="space-y-8">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {/* Connection line between steps */}
            {index < steps.length - 1 && (
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
            )}
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white text-lg font-semibold">
                {step.step}
              </div>
              
              <div>
                <h4 className="text-lg font-medium">{step.title}</h4>
                <p className="text-gray-600 mt-1">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessStep;
