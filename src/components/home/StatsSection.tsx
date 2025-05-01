
import React from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Users, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CounterProps {
  end: number;
  duration?: number;
}

const Counter = ({ end, duration = 2 }: CounterProps) => {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref);
  const controls = useAnimation();
  
  React.useEffect(() => {
    if (isInView) {
      let startTime: number;
      let animationFrame: number;
  
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / (duration * 1000);
  
        if (progress < 1) {
          setCount(Math.floor(end * progress));
          animationFrame = requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };
  
      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isInView, end, duration]);
  
  return <span ref={ref}>{count}</span>;
};

const StatsSection: React.FC = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-white/90"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-40 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-indigo-100 rounded-full opacity-10 blur-3xl"></div>
      
      <div className="container relative mx-auto px-4 z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.span 
            className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Our Success Metrics
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-700">Why Travelers Trust Permitsy</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">Our proven track record speaks for itself - join thousands of satisfied travelers who've simplified their visa journey with us.</p>
        </motion.div>
        
        <div className="grid grid-cols-3 gap-2 md:gap-6 mb-4">
          {[
            { 
              icon: Shield, 
              count: 98,
              suffix: '%', 
              label: 'Success Rate', 
              description: 'Applications approved on first submission',
              color: 'from-blue-500 to-blue-600',
              bgColor: 'bg-blue-50',
              textColor: 'text-blue-600',
              iconBg: 'from-blue-400 via-blue-500 to-blue-600'
            },
            { 
              icon: Users, 
              count: 50,
              suffix: 'k+', 
              label: 'Happy Travelers', 
              description: 'Satisfied customers worldwide',
              color: 'from-indigo-500 to-indigo-600',
              bgColor: 'bg-indigo-50',
              textColor: 'text-indigo-600',
              iconBg: 'from-indigo-400 via-indigo-500 to-indigo-600'
            },
            { 
              icon: Clock, 
              count: 10,
              suffix: 'x', 
              label: 'Faster Processing', 
              description: 'Compared to traditional methods',
              color: 'from-teal-500 to-teal-600',
              bgColor: 'bg-teal-50',
              textColor: 'text-teal-600',
              iconBg: 'from-teal-400 via-teal-500 to-teal-600'
            }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="flex flex-col items-center justify-center p-2 md:p-4">
                <motion.div 
                  className={`w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br ${stat.iconBg} flex items-center justify-center mb-2 md:mb-3 shadow-md relative overflow-hidden group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent rotate-180 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <stat.icon className="h-5 w-5 md:h-7 md:w-7 text-white drop-shadow-md" />
                </motion.div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 relative flex items-center">
                  <Counter end={stat.count} />
                  {stat.suffix}
                  <div className="absolute -top-0.5 -right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-70 animate-pulse"></div>
                </h3>
                <p className="text-sm md:text-base font-semibold text-gray-800 mb-1 text-center">{stat.label}</p>
                <p className="text-[10px] leading-tight md:text-xs text-gray-600 text-center max-w-[90%] md:max-w-[85%]">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link to="/countries">
            <Button variant="gradient" size="lg">
              Browse Destination Countries
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
