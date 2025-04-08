import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Lightbulb, Clock, Wallet, Map, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TravelTipsSection = () => {
  const travelTips = [
    {
      icon: Calendar,
      title: "Apply Early",
      description: "Start your visa application at least 4-6 weeks before your planned travel date to avoid rush fees and potential delays.",
      color: "bg-gradient-to-br from-blue-400 to-blue-600"
    },
    {
      icon: Lightbulb,
      title: "Check Requirements",
      description: "Different countries have varying visa requirements. Verify the exact documents and information needed for your destination.",
      color: "bg-gradient-to-br from-amber-400 to-amber-600"
    },
    {
      icon: Clock,
      title: "Track Processing Times",
      description: "Visa processing times vary by country and season. Stay informed about current processing times for your destination.",
      color: "bg-gradient-to-br from-indigo-400 to-indigo-600"
    },
    {
      icon: Wallet,
      title: "Budget Appropriately",
      description: "Include visa costs in your travel budget. Fees vary widely depending on destination, visa type, and processing speed.",
      color: "bg-gradient-to-br from-emerald-400 to-emerald-600"
    },
    {
      icon: Map,
      title: "Multi-Country Travel",
      description: "If visiting multiple countries, check if you need separate visas or if one visa (like Schengen) covers multiple destinations.",
      color: "bg-gradient-to-br from-purple-400 to-purple-600"
    },
    {
      icon: Info,
      title: "Visa Conditions",
      description: "Understand the conditions of your visa, including allowed duration of stay, single vs. multiple entry, and activities permitted.",
      color: "bg-gradient-to-br from-rose-400 to-rose-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-900 to-blue-800 text-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 bg-white/20 text-white rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
            Expert Advice
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Visa Application Tips
          </h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Helpful tips from our visa experts to ensure a smooth application process
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          {travelTips.slice(0, 3).map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 p-6 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-14 h-14 ${tip.color} rounded-xl flex items-center justify-center mb-5 shadow-lg`}>
                  <tip.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{tip.title}</h3>
                <p className="text-white/80 text-sm">{tip.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {travelTips.slice(3).map((tip, index) => (
            <motion.div
              key={index + 3}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index + 3) * 0.1 }}
              className="bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 p-6 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-14 h-14 ${tip.color} rounded-xl flex items-center justify-center mb-5 shadow-lg`}>
                  <tip.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{tip.title}</h3>
                <p className="text-white/80 text-sm">{tip.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/faqs">
            <Button variant="outline" size="lg" className="border-white/30 bg-white/10 hover:bg-white/20 text-white rounded-full px-8">
              View More Travel Resources
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default TravelTipsSection;
