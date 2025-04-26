import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin, Linkedin, Lock } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 text-gray-800 pt-16 pb-8 w-full overflow-hidden">
      <div className="container mx-auto px-4 max-w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company info */}
          <div>
            <div className="mb-6">
              <img 
                src="/lovable-uploads/c6f0f3d8-3504-4698-82f8-c54a489198c6.png" 
                alt="Permitsy" 
                className="h-10"
              />
            </div>
            <p className="text-gray-500 text-sm mb-6 mt-4 leading-relaxed">
              Making visa applications simple, transparent, and accessible for everyone.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-800 transition-colors p-2 bg-white rounded-full shadow-sm">
                <Facebook size={16} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-800 transition-colors p-2 bg-white rounded-full shadow-sm">
                <Instagram size={16} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-800 transition-colors p-2 bg-white rounded-full shadow-sm">
                <Twitter size={16} />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-gray-800 transition-colors p-2 bg-white rounded-full shadow-sm"
                aria-label="LinkedIn"
              >
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-medium mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/countries" className="text-gray-500 hover:text-gray-800 transition-colors text-sm">
                  Browse Countries
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="text-gray-500 hover:text-gray-800 transition-colors text-sm">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="text-gray-500 hover:text-gray-800 transition-colors text-sm">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-500 hover:text-gray-800 transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/admin-login" className="text-gray-500 hover:text-gray-800 transition-colors text-sm flex items-center">
                  <Lock className="h-3 w-3 mr-1" />
                  Admin Login
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-500 hover:text-gray-800 transition-colors text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-medium mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-gray-500 hover:text-gray-800 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-500 hover:text-gray-800 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-500 hover:text-gray-800 transition-colors text-sm">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/refunds" className="text-gray-500 hover:text-gray-800 transition-colors text-sm">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-medium mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-sm">
                <Mail size={16} className="mr-3 text-gray-400" />
                <a href="mailto:info@permitsy.com" className="text-gray-500 hover:text-gray-800 transition-colors">
                  info@permitsy.com
                </a>
              </li>
              <li className="flex items-start text-sm">
                <MapPin size={16} className="mr-3 text-gray-400 mt-1" />
                <span className="text-gray-500">
                  HSR Layout, <br />
                  Bangalore
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 mt-8 border-t border-gray-100 text-gray-400 text-xs text-center">
          <p>© {new Date().getFullYear()} Permitsy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
