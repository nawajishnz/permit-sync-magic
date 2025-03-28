
import React from 'react';
import { FileCheck, Clock, Award } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Complete Online Application',
    description: 'Fill out our user-friendly online application form with your travel details and personal information.',
    icon: FileCheck,
    color: 'bg-teal-50 text-teal border-teal'
  },
  {
    id: 2,
    title: 'Expert Document Review',
    description: 'Our visa specialists review your application and supporting documents to ensure everything meets requirements.',
    icon: Clock,
    color: 'bg-navy-50 text-navy border-navy'
  },
  {
    id: 3,
    title: 'Receive Your Visa',
    description: 'Get approved and receive your visa electronically or by mail, ready for your upcoming travels.',
    icon: Award,
    color: 'bg-teal-50 text-teal border-teal'
  }
];

const HowItWorks = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get your visa in three simple steps. Our streamlined process makes visa applications quick and hassle-free.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.id} className="text-center">
              <div className={`w-16 h-16 rounded-full ${step.color} mx-auto flex items-center justify-center mb-4`}>
                <step.icon className="h-8 w-8" />
              </div>
              <div className="relative mb-8">
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                {step.id < steps.length && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gray-200 -z-10">
                    <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 w-3 h-3 bg-teal rounded-full"></div>
                  </div>
                )}
              </div>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
