
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Lightbulb, Clock, Wallet, Map, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const TravelTipsSection = () => {
  const travelTips = [
    {
      icon: Calendar,
      title: "Apply Early",
      description: "Start your visa application at least 4-6 weeks before your planned travel date to avoid rush fees and potential delays.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Lightbulb,
      title: "Check Requirements",
      description: "Different countries have varying visa requirements. Verify the exact documents and information needed for your destination.",
      color: "bg-amber-100 text-amber-600"
    },
    {
      icon: Clock,
      title: "Track Processing Times",
      description: "Visa processing times vary by country and season. Stay informed about current processing times for your destination.",
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      icon: Wallet,
      title: "Budget Appropriately",
      description: "Include visa costs in your travel budget. Fees vary widely depending on destination, visa type, and processing speed.",
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      icon: Map,
      title: "Multi-Country Travel",
      description: "If visiting multiple countries, check if you need separate visas or if one visa (like Schengen) covers multiple destinations.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Info,
      title: "Visa Conditions",
      description: "Understand the conditions of your visa, including allowed duration of stay, single vs. multiple entry, and activities permitted.",
      color: "bg-rose-100 text-rose-600"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            Expert Advice
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Visa Application Tips
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Helpful tips from our visa experts to ensure a smooth application process
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {travelTips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="h-full"
            >
              <Card className="border border-gray-200 rounded-xl h-full shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className={`${tip.color} w-12 h-12 rounded-full flex items-center justify-center mb-3`}>
                    <tip.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">{tip.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{tip.description}</p>
                </CardContent>
              </Card>
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
            <Button size="lg" variant="outline" className="border-indigo-200 hover:bg-indigo-50 text-indigo-700 rounded-full px-8 shadow-sm">
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
