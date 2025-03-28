
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="pt-16 pb-20 sm:pt-24 permitsy-gradient text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
              Travel Visas Made
              <span className="text-teal-300 block">Simple & Fast</span>
            </h1>
            <p className="text-lg sm:text-xl opacity-90 mb-8 max-w-lg">
              Skip the embassy lines and paperwork. Apply for your tourist or visit visa online and get approved in days, not months.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link to="/visa-finder">
                <Button size="lg" className="bg-white text-navy hover:bg-gray-100 w-full sm:w-auto">
                  Find My Visa
                </Button>
              </Link>
              <Link to="/apply-now">
                <Button size="lg" className="bg-teal hover:bg-teal-600 text-white w-full sm:w-auto">
                  Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
              {['100% Online Application', 'Expert Document Review', 'Fast Processing Times', '24/7 Support'].map((feature, i) => (
                <div key={i} className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-teal-300" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-full h-full bg-teal rounded-lg opacity-20"></div>
              <div className="absolute -bottom-6 -right-6 w-full h-full bg-teal-600 rounded-lg opacity-20"></div>
              <div className="relative bg-white rounded-lg shadow-lg p-6 text-gray-800">
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-lg font-medium text-navy">US Tourist Visa (B-2)</h3>
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <span className="text-sm text-gray-500">Processing Time</span>
                      <p className="font-semibold">7-14 business days</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Success Rate</span>
                      <p className="font-semibold">98%</p>
                    </div>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-teal mt-0.5" />
                    <span className="text-sm">Complete document preparation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-teal mt-0.5" />
                    <span className="text-sm">Interview coaching and preparation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-teal mt-0.5" />
                    <span className="text-sm">24/7 expert support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-teal mt-0.5" />
                    <span className="text-sm">Application review by visa experts</span>
                  </li>
                </ul>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-500">From</span>
                    <p className="text-2xl font-bold text-navy">$149</p>
                  </div>
                  <Button className="bg-teal hover:bg-teal-600 text-white">
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
