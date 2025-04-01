
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Shield, Clock, Check, ArrowRight, Plane, Globe, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ProcessStep from './country/ProcessStep';

const ApplicationSteps = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const timerRef = useRef(null);
  
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
      icon: <FileText className="h-6 w-6" />,
      color: "from-blue-400 to-blue-600",
      animatedIcon: (isCurrent) => (
        <motion.div 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05 }}
            animate={isCurrent ? { 
              scale: [1, 1.05, 1], 
              boxShadow: ["0px 4px 12px rgba(59, 130, 246, 0.2)", "0px 8px 24px rgba(59, 130, 246, 0.4)", "0px 4px 12px rgba(59, 130, 246, 0.2)"]
            } : {}}
            transition={{ 
              duration: 2, 
              repeat: isCurrent ? Infinity : 0,
              repeatType: "reverse"
            }}
          >
            <FileText className="h-8 w-8 text-white" />
          </motion.div>
          
          {isCurrent && (
            <motion.div 
              className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Check className="h-4 w-4 text-white" />
            </motion.div>
          )}
        </motion.div>
      )
    },
    {
      id: 2,
      title: "Upload Documents",
      description: "Submit your passport, photos, and supporting documents securely online.",
      icon: <Shield className="h-6 w-6" />,
      color: "from-purple-400 to-purple-600",
      animatedIcon: (isCurrent) => (
        <motion.div 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05 }}
            animate={isCurrent ? { 
              scale: [1, 1.05, 1], 
              boxShadow: ["0px 4px 12px rgba(139, 92, 246, 0.2)", "0px 8px 24px rgba(139, 92, 246, 0.4)", "0px 4px 12px rgba(139, 92, 246, 0.2)"]
            } : {}}
            transition={{ 
              duration: 2, 
              repeat: isCurrent ? Infinity : 0,
              repeatType: "reverse"
            }}
          >
            <Shield className="h-8 w-8 text-white" />
          </motion.div>
          
          {isCurrent && (
            <motion.div 
              className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Check className="h-4 w-4 text-white" />
            </motion.div>
          )}
        </motion.div>
      )
    },
    {
      id: 3,
      title: "Expert Processing",
      description: "Our visa experts review and process your application with embassies and consulates.",
      icon: <Globe className="h-6 w-6" />,
      color: "from-teal-400 to-teal-600",
      animatedIcon: (isCurrent) => (
        <motion.div 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05 }}
            animate={isCurrent ? { 
              rotate: [0, 10, -10, 0],
              boxShadow: ["0px 4px 12px rgba(45, 212, 191, 0.2)", "0px 8px 24px rgba(45, 212, 191, 0.4)", "0px 4px 12px rgba(45, 212, 191, 0.2)"]
            } : {}}
            transition={{ 
              duration: 3, 
              repeat: isCurrent ? Infinity : 0,
              repeatType: "loop"
            }}
          >
            <Globe className="h-8 w-8 text-white" />
          </motion.div>
          
          {isCurrent && (
            <motion.div 
              className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Check className="h-4 w-4 text-white" />
            </motion.div>
          )}
        </motion.div>
      )
    },
    {
      id: 4,
      title: "Receive Your Visa",
      description: "Get your approved visa delivered to you electronically or by mail.",
      icon: <Plane className="h-6 w-6" />,
      color: "from-emerald-400 to-emerald-600",
      animatedIcon: (isCurrent) => (
        <motion.div 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05 }}
            animate={isCurrent ? { 
              y: [0, -8, 0],
              boxShadow: ["0px 4px 12px rgba(16, 185, 129, 0.2)", "0px 12px 24px rgba(16, 185, 129, 0.4)", "0px 4px 12px rgba(16, 185, 129, 0.2)"]
            } : {}}
            transition={{ 
              duration: 2, 
              repeat: isCurrent ? Infinity : 0,
              repeatType: "reverse"
            }}
          >
            <Plane className="h-8 w-8 text-white" />
          </motion.div>
          
          {isCurrent && (
            <motion.div 
              className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Check className="h-4 w-4 text-white" />
            </motion.div>
          )}
        </motion.div>
      )
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
          <div className="grid grid-cols-4 gap-6 mb-10">
            {steps.map((step) => (
              <motion.div
                key={step.id}
                className={`relative bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 ${activeStep === step.id ? 'ring-2 ring-teal-500 shadow-md' : ''}`}
                onMouseEnter={() => {
                  setAutoAdvance(false);
                  setActiveStep(step.id);
                }}
                onMouseLeave={() => {
                  setAutoAdvance(true);
                }}
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: step.id * 0.1 }}
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center border border-gray-100">
                  <span className="text-teal-600 font-bold">{step.id}</span>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  {step.animatedIcon(activeStep === step.id)}
                  
                  <h3 className="mt-5 mb-2 font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{step.description}</p>
                  
                  {activeStep === step.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full mt-auto"
                    >
                      <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full bg-gradient-to-r ${step.color}`}
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 4, repeat: Infinity }}
                        />
                      </div>
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
                      
                      <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center`}>
                        {step.icon && <div className="text-white">{step.icon}</div>}
                      </div>
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
          <Link to="/visa-finder">
            <Button className="bg-teal-600 hover:bg-teal-700">
              Start Your Application
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ApplicationSteps;
