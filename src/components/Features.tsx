import { Check, Globe, Shield, Clock, FileText, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Access visa services for over 190 countries worldwide'
  },
  {
    icon: Shield,
    title: 'Secure Process',
    description: 'Your data is protected with bank-level security measures'
  },
  {
    icon: Clock,
    title: 'Fast Processing',
    description: 'Expedited visa processing with real-time status updates'
  },
  {
    icon: FileText,
    title: 'Document Review',
    description: 'Expert review of your application and supporting documents'
  },
  {
    icon: CreditCard,
    title: 'Easy Payment',
    description: 'Multiple payment options with secure transactions'
  },
  {
    icon: Check,
    title: 'Success Guarantee',
    description: '98% success rate with our expert guidance'
  }
];

export const Features = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience a seamless visa application process with our comprehensive services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 