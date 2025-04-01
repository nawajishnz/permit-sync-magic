
import React, { useState, useEffect } from 'react';
import { FileCheck, Clock, Award, ArrowRight, Check, Globe, Search, FileText, CreditCard, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

const steps = [
  {
    id: 1,
    title: 'Fill Out Your Details & Pay',
    description: 'Complete our user-friendly online application form with your travel details and personal information.',
    icon: FileText,
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    features: ['Intuitive form design', 'Save and continue later', 'Supporting document uploads']
  }, 
  {
    id: 2,
    title: 'AI-Powered Documentation',
    description: 'Our intelligent system prepares and verifies your documents automatically.',
    icon: Zap,
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    features: ['Automatic formatting', 'Error detection', 'Document generation']
  }, 
  {
    id: 3,
    title: 'Expert Human Review',
    description: 'Our visa specialists review your application and documents to ensure everything meets official requirements.',
    icon: Globe,
    color: 'from-teal-400 to-teal-600',
    bgColor: 'bg-teal-100',
    iconColor: 'text-teal-600',
    features: ['Professional verification', 'Accuracy checks', 'Quick turnaround time']
  }, 
  {
    id: 4,
    title: 'Receive Your Visa',
    description: 'Get approved and receive your visa electronically or by mail, ready for your upcoming travels.',
    icon: CreditCard,
    color: 'from-emerald-400 to-emerald-600',
    bgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    features: ['Digital visa delivery', 'Physical mail option', 'Instant notifications']
  }
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Auto advance through steps
  useEffect(() => {
    if (autoAdvance) {
      const timer = setInterval(() => {
        setActiveStep(prev => prev < 4 ? prev + 1 : 1);
      }, 4000);
      return () => {
        clearInterval(timer);
      };
    }
  }, [autoAdvance]);

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-indigo-600 to-indigo-700">
      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Expert Application With Permitsy
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/90 max-w-2xl mx-auto"
          >
            Our streamlined process makes visa applications quick and hassle-free in just 4 simple steps.
          </motion.p>
        </div>
        
        {/* Desktop View - Card Based Layout */}
        <div className="hidden md:block">
          <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto">
            {steps.map(step => (
              <motion.div
                key={step.id}
                className={`bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 transition-all duration-300 h-full flex flex-col ${activeStep === step.id ? 'ring-2 ring-white/50 transform -translate-y-2' : ''}`}
                onMouseEnter={() => {
                  setAutoAdvance(false);
                  setActiveStep(step.id);
                  setHoveredStep(step.id);
                }}
                onMouseLeave={() => {
                  setAutoAdvance(true);
                  setHoveredStep(null);
                }}
                whileHover={{
                  y: -8,
                  scale: 1.02
                }}
                initial={{
                  opacity: 0,
                  y: 20
                }}
                whileInView={{
                  opacity: 1,
                  y: 0
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  duration: 0.5,
                  delay: step.id * 0.1
                }}
              >
                <div className="relative flex-grow">
                  <motion.div 
                    className={`w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center mb-6 shadow-lg mx-auto`}
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
                    <step.icon className={`h-8 w-8 ${step.iconColor}`} />
                  </motion.div>
                  
                  {activeStep === step.id && (
                    <motion.div 
                      className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Check className="h-4 w-4 text-white" />
                    </motion.div>
                  )}
                </div>
                
                <div className="text-center flex-grow">
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-white/80 mb-4 text-sm">{step.description}</p>
                  
                  {hoveredStep === step.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4"
                    >
                      <div className="space-y-2 mb-4">
                        {step.features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            className="flex items-center text-white/90"
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.2 }}
                          >
                            <Check className="h-3 w-3 mr-2 text-green-400 flex-shrink-0" />
                            <span className="text-xs">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-white/10 text-white border-white/30 hover:bg-white/20 w-full"
                        asChild
                      >
                        <Link to="/visa-finder">
                          Get Started
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Mobile View - Card Based Layout (Updated) */}
        <div className="md:hidden">
          <div className="grid grid-cols-1 gap-6 max-w-sm mx-auto">
            {steps.map(step => (
              <motion.div
                key={step.id}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 flex flex-col"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: step.id * 0.1 }}
              >
                <div className="flex items-start">
                  <div className="mr-4 flex-shrink-0">
                    <div className="relative">
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-white/20 z-10">
                        <span className="text-indigo-600 font-bold text-sm">{step.id}</span>
                      </div>
                      
                      <motion.div 
                        className={`w-14 h-14 ${step.bgColor} rounded-xl flex items-center justify-center`}
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
                        <step.icon className={`h-6 w-6 ${step.iconColor}`} />
                      </motion.div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                    <p className="text-sm text-white/80">{step.description}</p>
                  </div>
                </div>
                
                <div className="mt-4 pl-18">
                  <div className="space-y-1">
                    {step.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-white/80">
                        <Check className="h-3 w-3 mr-2 text-green-400 flex-shrink-0" />
                        <span className="text-xs">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Mobile Progress Indicator */}
          <div className="flex items-center justify-center mt-6">
            <Progress value={activeStep / steps.length * 100} className="w-40 h-2 bg-white/20" />
          </div>
        </div>
        
        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
