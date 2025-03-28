
import React from 'react';
import { FileCheck, Clock, Award } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Complete Online Application',
    description: 'Fill out our user-friendly online application form with your travel details and personal information.',
    icon: FileCheck,
  },
  {
    id: 2,
    title: 'Expert Document Review',
    description: 'Our visa specialists review your application and supporting documents to ensure everything meets requirements.',
    icon: Clock,
  },
  {
    id: 3,
    title: 'Receive Your Visa',
    description: 'Get approved and receive your visa electronically or by mail, ready for your upcoming travels.',
    icon: Award,
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get your visa in three simple steps. Our streamlined process makes visa applications quick and hassle-free.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className={`text-center fade-in slide-up`} style={{ animationDelay: `${index * 0.2}s` }}>
              <div className="w-14 h-14 rounded-full bg-gray-50 mx-auto flex items-center justify-center mb-6">
                <step.icon className="h-6 w-6 text-gray-800" />
              </div>
              <div className="relative mb-8">
                <h3 className="text-xl font-medium mb-3">{step.title}</h3>
                {step.id < steps.length && (
                  <div className="hidden md:block absolute top-32 left-2/3 w-full h-0.5 bg-gray-100">
                    <div className="absolute top-0 left-full w-2 h-2 rounded-full bg-gray-200"></div>
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
