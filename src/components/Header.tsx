
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  UserCircle, 
  Search,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/c6f0f3d8-3504-4698-82f8-c54a489198c6.png" 
              alt="Permitsy" 
              className="h-10 sm:h-12" 
            />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/countries" className="text-navy-700 hover:text-teal-500 transition-colors">
              Browse Countries
            </Link>
            <Link to="/visa-finder" className="text-navy-700 hover:text-teal-500 transition-colors">
              Visa Finder
            </Link>
            <Link to="/faqs" className="text-navy-700 hover:text-teal-500 transition-colors">
              FAQs
            </Link>
            <Link to="/contact" className="text-navy-700 hover:text-teal-500 transition-colors">
              Contact Us
            </Link>
          </nav>
          
          {/* Desktop CTA + User */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center rounded-full bg-gray-100 px-3 py-1.5">
              <Search className="h-4 w-4 text-gray-500 mr-2" />
              <input 
                type="text" 
                placeholder="Search visas..." 
                className="bg-transparent border-none focus:outline-none text-sm w-32"
              />
            </div>
            
            {user ? (
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="border-navy text-navy hover:bg-navy hover:text-white">
                  <UserCircle className="mr-2 h-4 w-4" /> Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="border-navy text-navy hover:bg-navy hover:text-white">
                  <UserCircle className="mr-2 h-4 w-4" /> Sign In
                </Button>
              </Link>
            )}
            
            <Link to="/apply-now">
              <Button size="sm" className="bg-navy hover:bg-navy-600 text-white">
                Apply Now
              </Button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6 text-navy" />
              ) : (
                <Menu className="h-6 w-6 text-navy" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-4">
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/countries" 
              className="text-navy-700 hover:text-teal px-4 py-2 rounded-md hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Browse Countries
            </Link>
            <Link 
              to="/visa-finder" 
              className="text-navy-700 hover:text-teal px-4 py-2 rounded-md hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Visa Finder
            </Link>
            <Link 
              to="/faqs" 
              className="text-navy-700 hover:text-teal px-4 py-2 rounded-md hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              FAQs
            </Link>
            <Link 
              to="/contact" 
              className="text-navy-700 hover:text-teal px-4 py-2 rounded-md hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Contact Us
            </Link>
            {user ? (
              <Link 
                to="/dashboard" 
                className="text-navy-700 hover:text-teal px-4 py-2 rounded-md hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <Link 
                to="/auth" 
                className="text-navy-700 hover:text-teal px-4 py-2 rounded-md hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
            )}
            <Link 
              to="/apply-now" 
              className="bg-navy hover:bg-navy-600 text-white px-4 py-2 rounded-md text-center"
              onClick={() => setIsOpen(false)}
            >
              Apply Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
