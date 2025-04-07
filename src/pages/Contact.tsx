import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the contact form data
    console.log('Contact form submitted');
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <main className="flex-grow">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-navy to-indigo-800 text-white py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px_16px]" />
          <motion.div 
            className="container mx-auto px-4 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-100">
              Let's Connect
            </h1>
            <p className="text-xl opacity-90 max-w-2xl leading-relaxed">
              Have questions about your visa application? Our dedicated team is here to provide expert guidance every step of the way.
            </p>
          </motion.div>
        </div>

        {/* Contact content */}
        <div className="container mx-auto px-4 -mt-12 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact information */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-navy">Ways to Reach Us</h2>
                
                <div className="space-y-6">
                  <motion.div 
                    className="flex items-start group"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-navy/5 group-hover:bg-navy/10 p-4 rounded-xl mr-4 transition-colors">
                      <Phone className="h-6 w-6 text-navy" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1 text-gray-900">Phone Support</h3>
                      <p className="text-gray-600 group-hover:text-navy transition-colors">+91 7975208649</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-start group"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-navy/5 group-hover:bg-navy/10 p-4 rounded-xl mr-4 transition-colors">
                      <Mail className="h-6 w-6 text-navy" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1 text-gray-900">Email Us</h3>
                      <p className="text-gray-600 group-hover:text-navy transition-colors">info@permitsy.com</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-start group"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-navy/5 group-hover:bg-navy/10 p-4 rounded-xl mr-4 transition-colors">
                      <Clock className="h-6 w-6 text-navy" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1 text-gray-900">Business Hours</h3>
                      <div className="space-y-1">
                        <p className="text-gray-600">Monday - Friday: 9am - 6pm IST</p>
                        <p className="text-gray-600">Saturday: 10am - 4pm IST</p>
                        <p className="text-gray-600">Sunday: Closed</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
              
              <motion.div 
                className="bg-gradient-to-br from-navy to-indigo-800 rounded-2xl p-8 text-white shadow-lg"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center mb-4">
                  <MessageSquare className="h-6 w-6 mr-3" />
                  <h3 className="text-xl font-semibold">Live Chat Support</h3>
                </div>
                <p className="text-gray-100 mb-6 leading-relaxed">
                  Get instant answers from our visa experts via live chat. Our team is available 24/7 to assist you with any queries.
                </p>
                <Button className="w-full bg-white text-navy hover:bg-gray-100 group">
                  Start Live Chat
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>
            
            {/* Contact form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-navy">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700">Your Name</Label>
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        className="rounded-lg border-gray-200 focus:border-navy focus:ring-navy transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="john@example.com" 
                        className="rounded-lg border-gray-200 focus:border-navy focus:ring-navy transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-700">Subject</Label>
                    <Select>
                      <SelectTrigger 
                        id="subject" 
                        className="rounded-lg border-gray-200 focus:border-navy focus:ring-navy transition-colors"
                      >
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="application">Visa Application</SelectItem>
                        <SelectItem value="status">Application Status</SelectItem>
                        <SelectItem value="documents">Document Requirements</SelectItem>
                        <SelectItem value="payment">Payment Issues</SelectItem>
                        <SelectItem value="general">General Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="How can we help you?" 
                      className="min-h-[150px] rounded-lg border-gray-200 focus:border-navy focus:ring-navy transition-colors"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-navy hover:bg-indigo-800 text-white transition-colors group"
                  >
                    Send Message
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
