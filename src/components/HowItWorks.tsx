
import React, { useState } from 'react';
import { FileCheck, Clock, Award, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

const steps = [
  {
    id: 1,
    title: 'Complete Online Application',
    description: 'Fill out our user-friendly online application form with your travel details and personal information.',
    icon: FileCheck,
    color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    features: [
      'Intuitive form design',
      'Save and continue later',
      'Supporting document uploads'
    ],
    cta: 'Start Application'
  },
  {
    id: 2,
    title: 'Expert Document Review',
    description: 'Our visa specialists review your application and supporting documents to ensure everything meets requirements.',
    icon: Clock,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    features: [
      'Professional verification',
      'Accuracy checks',
      'Quick turnaround time'
    ],
    cta: 'Learn About Process'
  },
  {
    id: 3,
    title: 'Receive Your Visa',
    description: 'Get approved and receive your visa electronically or by mail, ready for your upcoming travels.',
    icon: Award,
    color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    features: [
      'Digital visa delivery',
      'Physical mail option',
      'Instant notifications'
    ],
    cta: 'View Sample Visa'
  }
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  // For mobile view - carousel
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-indigo-600/70 backdrop-blur-sm"></div>
      
      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-white mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/90 max-w-2xl mx-auto text-lg"
          >
            Get your visa in three simple steps. Our streamlined process makes visa applications quick and hassle-free.
          </motion.p>
        </div>
        
        {/* Desktop Process Flow */}
        <div className="hidden md:block">
          {/* Progress path */}
          <div className="relative mb-8">
            <div className="absolute top-1/3 left-0 w-full h-1 bg-white/20 rounded-full"></div>
            <div className="absolute top-1/3 left-0 h-1 bg-white rounded-full transition-all duration-500" 
                style={{ width: `${(activeStep / steps.length) * 100}%` }}></div>
          </div>
          
          <div className="grid grid-cols-3 gap-10 max-w-6xl mx-auto">
            {steps.map((step) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: step.id * 0.1 }}
                whileHover={{ y: -8 }}
                className={`relative p-6 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 transition-all duration-300 overflow-hidden ${
                  activeStep >= step.id ? "shadow-xl" : "opacity-80"
                } ${
                  hoveredStep === step.id ? "scale-105" : ""
                }`}
                onMouseEnter={() => {
                  setHoveredStep(step.id);
                  setActiveStep(step.id);
                }}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg transform transition-transform duration-300 ${hoveredStep === step.id ? "scale-110" : ""}`}>
                  <step.icon className="h-8 w-8" />
                </div>
                
                <h3 className="text-2xl font-semibold text-white mb-4">{step.title}</h3>
                <p className="text-white/80 mb-6 text-base">{step.description}</p>
                
                {hoveredStep === step.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <h4 className="text-white font-medium mb-3">Key Features:</h4>
                    <ul className="mb-6">
                      {step.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-white/90 mb-2">
                          <Check className="h-4 w-4 mr-2 text-emerald-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant="outline" 
                      className="mt-2 bg-white/10 text-white border-white/30 hover:bg-white/20"
                    >
                      {step.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
                
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                
                {activeStep >= step.id && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Mobile Carousel */}
        <div className="md:hidden">
          <Carousel 
            setApi={(api) => {
              api?.on('select', () => {
                setCurrentStep(api.selectedScrollSnap());
              });
            }}
          >
            <CarouselContent>
              {steps.map((step, index) => (
                <CarouselItem key={step.id}>
                  <div className="p-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <div className={`w-16 h-16 ${step.color} rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                        <step.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white text-center mb-3">{step.title}</h3>
                      <p className="text-white/80 text-center mb-4 text-sm">{step.description}</p>
                      
                      <ul className="mb-5 space-y-2">
                        {step.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-white/90 text-sm">
                            <Check className="h-3 w-3 mr-2 text-emerald-400 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        size="sm"
                        className="w-full mt-2 bg-white/10 text-white border border-white/30 hover:bg-white/20"
                        asChild
                      >
                        <Link to="/visa-finder">
                          {step.cta}
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-center mt-6 space-x-2">
              <CarouselPrevious className="relative left-0 right-auto h-8 w-8 border-white/40 text-white bg-white/10 hover:bg-white/20" />
              <Progress 
                value={((currentStep + 1) / steps.length) * 100} 
                className="w-40 h-2 bg-white/20" 
              />
              <CarouselNext className="relative right-0 left-auto h-8 w-8 border-white/40 text-white bg-white/10 hover:bg-white/20" />
            </div>
          </Carousel>
        </div>
        
        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-semibold text-white mb-5">Ready to begin your visa journey?</h3>
          <Button 
            size="lg" 
            variant="default"
            className="bg-white text-indigo-700 hover:bg-white/90 shadow-xl"
            asChild
          >
            <Link to="/visa-finder">
              Start Your Application
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
