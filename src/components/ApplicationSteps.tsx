import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Shield, Check, ArrowRight, Plane, Globe, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ApplicationSteps = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auto advance through steps
  useEffect(() => {
    if (autoAdvance) {
      timerRef.current = setInterval(() => {
        setActiveStep(prev => prev < 4 ? prev + 1 : 1);
      }, 4000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoAdvance]);
  
  // Define application steps
  const steps = [
    {
      id: 1,
      title: "Fill Application Form",
      description: "Complete a simple online form with your travel details and visa requirements.",
      icon: FileText,
      color: "from-blue-400 to-blue-600",
      features: [
        'Quick online form',
        'Save progress',
        'Multiple languages'
      ],
    },
    {
      id: 2,
      title: "Upload Documents",
      description: "Submit your passport, photos, and supporting documents securely online.",
      icon: Shield,
      color: "from-purple-400 to-purple-600",
      features: [
        'Secure uploads',
        'Document checklist',
        'Auto-verification'
      ],
    },
    {
      id: 3,
      title: "Expert Processing",
      description: "Our visa experts review and process your application with embassies and consulates.",
      icon: Globe,
      color: "from-teal-400 to-teal-600",
      features: [
        'Expert review',
        'Embassy liaison',
        'Priority processing'
      ],
    },
    {
      id: 4,
      title: "Receive Your Visa",
      description: "Get your approved visa delivered to you electronically or by mail.",
      icon: Plane,
      color: "from-emerald-400 to-emerald-600",
      features: [
        'Digital delivery',
        'Express shipping',
        'Travel-ready format'
      ],
    }
  ];
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Four Steps to Your Visa</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Our simplified visa application process makes getting your travel documents quick and hassle-free.</p>
        </div>
        
        {/* Desktop View - Card Based Layout */}
        <div className="hidden md:block">
          <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto">
            {steps.map((step) => (
              <motion.div
                key={step.id}
                className={`relative bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 ${
                  activeStep === step.id ? 'ring-2 ring-teal-500 shadow-md transform -translate-y-2' : ''
                }`}
                onMouseEnter={() => {
                  setAutoAdvance(false);
                  setActiveStep(step.id);
                  setHoveredStep(step.id);
                }}
                onMouseLeave={() => {
                  setAutoAdvance(true);
                  setHoveredStep(null);
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: step.id * 0.1 }}
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center border border-gray-100">
                  <span className="text-teal-600 font-bold">{step.id}</span>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <motion.div 
                    className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg mx-auto`}
                    whileHover={{ scale: 1.05 }}
                    animate={activeStep === step.id ? { 
                      scale: [1, 1.05, 1], 
                      boxShadow: ["0px 4px 12px rgba(59, 130, 246, 0.2)", "0px 8px 24px rgba(59, 130, 246, 0.4)", "0px 4px 12px rgba(59, 130, 246, 0.2)"]
                    } : {}}
                    transition={{ 
                      duration: 2, 
                      repeat: activeStep === step.id ? Infinity : 0,
                      repeatType: "reverse"
                    }}
                  >
                    <step.icon className="h-8 w-8" />
                  </motion.div>
                  
                  <h3 className="mt-2 mb-2 font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{step.description}</p>
                  
                  {hoveredStep === step.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 w-full"
                    >
                      <div className="space-y-2 mb-4">
                        {step.features.map((feature, idx) => (
                          <motion.div 
                            key={idx} 
                            className="flex items-center text-gray-700"
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.2 }}
                          >
                            <Check className="h-3 w-3 mr-2 text-teal-500 flex-shrink-0" />
                            <span className="text-xs">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  {activeStep === step.id && (
                    <motion.div 
                      className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Check className="h-4 w-4 text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Mobile View */}
        <div className="md:hidden">
          <div className="space-y-5">
            {steps.map((step) => (
              <motion.div
                key={step.id}
                className={`relative bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 ${activeStep === step.id ? 'ring-2 ring-teal-500 shadow-md' : ''}`}
                onTouchStart={() => {
                  setAutoAdvance(false);
                  setActiveStep(step.id);
                }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: step.id * 0.1 }}
              >
                <div className="flex items-start">
                  <div className="mr-4 flex-shrink-0">
                    <div className="relative">
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-white shadow-sm rounded-full flex items-center justify-center border border-gray-100 z-10">
                        <span className="text-teal-600 font-bold text-sm">{step.id}</span>
                      </div>
                      
                      <motion.div 
                        className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center`}
                        animate={activeStep === step.id ? { 
                          scale: [1, 1.05, 1],
                          boxShadow: ["0px 4px 12px rgba(0, 0, 0, 0.1)", "0px 8px 24px rgba(0, 0, 0, 0.2)", "0px 4px 12px rgba(0, 0, 0, 0.1)"]
                        } : {}}
                        transition={{ 
                          duration: 2, 
                          repeat: activeStep === step.id ? Infinity : 0,
                          repeatType: "reverse"
                        }}
                      >
                        <step.icon className="h-6 w-6 text-white" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="text-center mt-10">
          <Link to="/countries" className="bg-teal-600 hover:bg-teal-700">
            Browse Countries
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ApplicationSteps;
