
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="pt-20 pb-24 sm:pt-28 sm:pb-32 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="fade-in slide-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight tracking-tight mb-6">
              Travel Visas
              <span className="block">Made Simple</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Skip the embassy lines and paperwork. Apply for your tourist or visit visa online and get approved in days, not months.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link to="/visa-finder">
                <Button size="lg" className="bg-white shadow-sm border border-gray-100 text-black hover:bg-gray-50 rounded-full w-full sm:w-auto">
                  Find My Visa
                </Button>
              </Link>
              <Link to="/apply-now">
                <Button size="lg" className="bg-black hover:bg-gray-800 text-white rounded-full w-full sm:w-auto">
                  Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              {['100% Online Application', 'Expert Document Review', 'Fast Processing Times', '24/7 Support'].map((feature, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-black text-white mr-3">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm text-gray-600">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-yellow-100 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
              <div className="relative bg-white rounded-2xl shadow-apple-card p-8 text-gray-800 max-w-md mx-auto">
                <div className="border-b border-gray-100 pb-6 mb-6">
                  <h3 className="text-lg font-medium mb-2">US Tourist Visa (B-2)</h3>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Processing Time</span>
                      <p className="font-medium">7-14 business days</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Success Rate</span>
                      <p className="font-medium">98%</p>
                    </div>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    'Complete document preparation', 
                    'Interview coaching and preparation', 
                    '24/7 expert support', 
                    'Application review by visa experts'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-black text-white mt-0.5 mr-3 shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">From</span>
                    <p className="text-2xl font-semibold">$149</p>
                  </div>
                  <Button className="bg-black hover:bg-gray-800 text-white rounded-full">
                    Apply Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
