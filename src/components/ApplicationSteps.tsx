import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { FileText, Shield, Clock, Check, ArrowRight, Plane, Globe, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ProcessStep from './country/ProcessStep';

const ApplicationSteps = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [animationComplete, setAnimationComplete] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  
  const steps = [
    {
      id: 1,
      title: "Fill Out Your Details",
      description: "Complete your application with our simple, guided form that adapts to your specific needs.",
      icon: <FileText className="h-8 w-8" strokeWidth={1.5} />,
      animation: {
        icon: (
          <motion.div 
            initial={{ y: 0 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          >
            <FileText className="h-10 w-10 text-teal-50" strokeWidth={1.5} />
          </motion.div>
        ),
        detail: (
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-teal-100">
            <div className="space-y-2">
              <div className="h-2 bg-teal-100 rounded-full w-4/5"></div>
              <div className="h-2 bg-teal-100 rounded-full w-3/5"></div>
              <div className="h-2 bg-teal-100 rounded-full w-2/3"></div>
              <motion.div 
                className="h-6 w-1/3 bg-teal-500 rounded-md ml-auto"
                initial={{ width: 0 }}
                animate={{ width: "33%" }}
                transition={{ duration: 1, delay: 0.5 }}
              ></motion.div>
            </div>
          </div>
        )
      }
    },
    {
      id: 2,
      title: "Document Verification",
      description: "Our experts verify your documents for accuracy and completeness with thorough review.",
      icon: <Shield className="h-8 w-8" strokeWidth={1.5} />,
      animation: {
        icon: (
          <motion.div 
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            <Shield className="h-10 w-10 text-teal-50" strokeWidth={1.5} />
          </motion.div>
        ),
        detail: (
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-teal-100">
            <div className="flex justify-around items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <FileText className="h-8 w-8 text-teal-500" />
              </motion.div>
              
              <motion.div 
                className="h-0.5 w-10 bg-teal-300"
                initial={{ width: 0 }}
                animate={{ width: 40 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Shield className="h-8 w-8 text-teal-500" />
              </motion.div>
              
              <motion.div 
                className="h-0.5 w-10 bg-teal-300"
                initial={{ width: 0 }}
                animate={{ width: 40 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <FileCheck className="h-8 w-8 text-teal-500" />
              </motion.div>
            </div>
          </div>
        )
      }
    },
    {
      id: 3,
      title: "Expert Human Review",
      description: "Visa specialists ensure everything is perfect before submission to authorities.",
      icon: <Clock className="h-8 w-8" strokeWidth={1.5} />,
      animation: {
        icon: (
          <motion.div className="relative">
            <Clock className="h-10 w-10 text-teal-50" strokeWidth={1.5} />
            <motion.div 
              className="absolute inset-0"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-1 h-4 bg-teal-200 rounded-full absolute top-1/2 left-1/2 -ml-0.5 -mt-4 origin-bottom"></div>
            </motion.div>
          </motion.div>
        ),
        detail: (
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-teal-100 relative overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 h-1 bg-teal-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="flex justify-center mt-2">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "loop", times: [0, 0.1, 1] }}
                className="w-8 h-8 flex items-center justify-center relative"
              >
                <Globe className="h-8 w-8 text-teal-500 absolute" />
              </motion.div>
            </div>
          </div>
        )
      }
    },
    {
      id: 4,
      title: "Visa Delivery",
      description: "Receive your approved visa electronically or by mail, ready for your travels.",
      icon: <Check className="h-8 w-8" strokeWidth={1.5} />,
      animation: {
        icon: (
          <motion.div>
            <Check className="h-10 w-10 text-teal-50" strokeWidth={1.5} />
          </motion.div>
        ),
        detail: (
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-teal-100">
            <div className="flex justify-center">
              <motion.div 
                className="relative"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <div className="p-1 bg-teal-500 rounded-md text-white">
                  <FileText className="h-6 w-6" />
                </div>
                <motion.div 
                  className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 }}
                >
                  <Check className="h-3 w-3 text-white" />
                </motion.div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="flex items-center ml-4"
              >
                <motion.div
                  animate={{ x: [0, 15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 2 }}
                >
                  <Plane className="h-6 w-6 text-teal-500" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        )
      }
    }
  ];

  // Auto-advance steps when in view
  useEffect(() => {
    if (!isInView || animationComplete) return;
    
    let currentStep = 1;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        currentStep++;
        setActiveStep(currentStep);
      } else {
        clearInterval(interval);
        setAnimationComplete(true);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isInView, steps.length, animationComplete]);

  // Restart animation on click
  const restartAnimation = () => {
    setActiveStep(1);
    setAnimationComplete(false);
  };

  return (
    <section 
      ref={containerRef}
      className="py-20 bg-gradient-to-b from-white to-teal-50 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-2xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-teal-600 font-medium mb-3 bg-teal-50 px-4 py-1 rounded-full text-sm tracking-wide">Simple Process</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Four Steps to Your Visa</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Our streamlined process takes the stress out of visa applications
          </p>
        </motion.div>

        {/* Desktop view with interactive 3D cards */}
        <div className="hidden md:block relative">
          {/* Progress indicator */}
          <div className="absolute left-0 right-0 top-28 h-0.5 bg-gray-200"></div>
          <motion.div 
            className="absolute left-0 top-28 h-0.5 bg-teal-500"
            initial={{ width: "0%" }}
            animate={{ width: `${(activeStep / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
          
          <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto">
            {steps.map((step) => (
              <div key={step.id}>
                {/* Step number indicator */}
                <motion.div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto z-10 relative mb-8 border-2 ${
                    activeStep >= step.id ? "bg-teal-500 border-teal-500 text-white" : "bg-white border-gray-200 text-gray-400"
                  }`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    backgroundColor: activeStep >= step.id ? "#0d9488" : "#ffffff",
                    borderColor: activeStep >= step.id ? "#0d9488" : "#e5e7eb",
                    color: activeStep >= step.id ? "#ffffff" : "#9ca3af"
                  }}
                  transition={{ duration: 0.3, delay: 0.1 * step.id }}
                  whileHover={{ scale: 1.05 }}
                  onMouseEnter={() => setActiveStep(step.id)}
                >
                  <span className="text-xl font-bold">{step.id}</span>
                </motion.div>
                
                {/* Card */}
                <motion.div
                  className={`bg-white rounded-2xl p-6 shadow-sm border h-full flex flex-col transition-all duration-300 ${
                    activeStep === step.id ? "border-teal-300 shadow-md" : "border-gray-100"
                  }`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ 
                    y: 0, 
                    opacity: 1,
                    borderColor: activeStep === step.id ? "#5eead4" : "#f3f4f6"
                  }}
                  transition={{ duration: 0.4, delay: 0.2 * step.id }}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  onMouseEnter={() => setActiveStep(step.id)}
                >
                  <div className="flex-grow">
                    {/* Icon */}
                    <div className={`w-20 h-20 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-md mx-auto mb-6 ${
                      activeStep === step.id ? "shadow-teal-200" : ""
                    }`}>
                      {activeStep === step.id ? step.animation.icon : step.icon}
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">{step.title}</h3>
                    <p className="text-gray-600 text-center mb-6">{step.description}</p>
                    
                    {/* Animation detail */}
                    <AnimatePresence>
                      {activeStep === step.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mb-4 overflow-hidden"
                        >
                          {step.animation.detail}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Next step indicator */}
                  {step.id < steps.length && (
                    <div className="absolute -right-3 top-1/2 z-10">
                      <motion.div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          activeStep >= step.id ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-400"
                        }`}
                        animate={
                          activeStep === step.id ? { x: [0, 5, 0] } : { x: 0 }
                        }
                        transition={{ duration: 1, repeat: activeStep === step.id ? Infinity : 0 }}
                      >
                        <ArrowRight className="h-3 w-3" />
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </div>
            ))}
          </div>
          
          {/* Animation restart button */}
          {animationComplete && (
            <motion.div 
              className="flex justify-center mt-12"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                variant="outline" 
                onClick={restartAnimation}
                className="text-teal-600 border-teal-200 hover:bg-teal-50"
              >
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Clock className="h-4 w-4" />
                </motion.div>
                Replay Animation
              </Button>
            </motion.div>
          )}
        </div>
        
        {/* Mobile vertical steps */}
        <div className="md:hidden">
          <div className="relative max-w-sm mx-auto px-4">
            {steps.map((step, index) => (
              <ProcessStep
                key={step.id}
                step={step.id}
                title={step.title}
                description={step.description}
                isLast={index === steps.length - 1}
                icon={step.icon}
              />
            ))}
          </div>
        </div>
        
        {/* Statistics Cards */}
        <motion.div 
          className="mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              { 
                icon: Clock, 
                value: "24-48 hrs", 
                label: "Average Processing Time",
                color: "bg-teal-50 text-teal-600"
              },
              { 
                icon: FileCheck, 
                value: "98%", 
                label: "Application Success Rate",
                color: "bg-teal-50 text-teal-600"
              },
              { 
                icon: Globe, 
                value: "50,000+", 
                label: "Satisfied Customers",
                color: "bg-teal-50 text-teal-600"
              }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center group hover:border-teal-200 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-teal-100 transition-colors`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* CTA button */}
        <motion.div 
          className="flex justify-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link to="/visa-finder">
            <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-8 shadow-md group">
              Start Your Application 
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ApplicationSteps;
