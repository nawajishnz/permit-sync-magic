
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-navy text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company info */}
          <div>
            <div className="mb-4">
              <img 
                src="/lovable-uploads/c6f0f3d8-3504-4698-82f8-c54a489198c6.png" 
                alt="Permitsy" 
                className="h-10 sm:h-12 bg-white p-2 rounded"
              />
            </div>
            <p className="text-gray-300 mb-4 mt-4">
              Making visa applications simple, transparent, and accessible for everyone.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-teal transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-teal transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-teal transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/countries" className="text-gray-300 hover:text-teal transition-colors">
                  Browse Countries
                </Link>
              </li>
              <li>
                <Link to="/visa-finder" className="text-gray-300 hover:text-teal transition-colors">
                  Visa Finder
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="text-gray-300 hover:text-teal transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-teal transition-colors">
                  Travel Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-teal transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-teal transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-300 hover:text-teal transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/refunds" className="text-gray-300 hover:text-teal transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Phone size={16} className="mr-2 text-teal" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2 text-teal" />
                <a href="mailto:support@permitsy.com" className="text-gray-300 hover:text-teal transition-colors">
                  support@permitsy.com
                </a>
              </li>
              <li className="flex items-start">
                <MapPin size={16} className="mr-2 text-teal mt-1" />
                <span className="text-gray-300">
                  123 Visa Avenue, <br />
                  San Francisco, CA 94103
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 mt-8 border-t border-gray-700 text-gray-400 text-sm text-center">
          <p>© {new Date().getFullYear()} Permitsy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
