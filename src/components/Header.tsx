
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, User, ChevronDown, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const {
    user,
    signOut
  } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navLinks = [{
    name: 'Home',
    path: '/'
  }, {
    name: 'Countries',
    path: '/countries'
  }, {
    name: 'Visa Finder',
    path: '/visa-finder'
  }, {
    name: 'Testimonials',
    path: '/testimonials'
  }];

  const headerClasses = `fixed top-0 w-full z-50 transition-all duration-200 ${isScrolled || isMobileMenuOpen ? 'bg-white shadow-md py-2' : 'bg-white py-3'}`;

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo and success rate indicator */}
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/1c870715-09d1-4e81-b217-5a58a6015173.png" 
            alt="Permitsy - Your Trusted Visa Partner" 
            className="h-14 md:h-16" 
          />
          <div className="hidden md:flex items-center ml-3 bg-blue-50 text-indigo-700 rounded-full px-3 py-1 text-sm">
            <span className="font-semibold">98% Success Rate</span>
            <span className="mx-2">•</span>
            <span className="flex items-center">
              4.9 <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 ml-1 mr-1" /> 
              <span className="text-gray-600">(1.2k+ reviews)</span>
            </span>
          </div>
        </Link>
        
        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center space-x-2">
          <ul className="flex items-center space-x-1">
            {navLinks.map(link => (
              <li key={link.name}>
                <Link 
                  to={link.path} 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path) ? 'text-navy-800 font-semibold' : 'text-gray-700 hover:text-navy-600 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="ml-4 flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span className="max-w-[100px] truncate">{user.email}</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="w-full cursor-pointer">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="w-full cursor-pointer">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="text-red-500 cursor-pointer">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="bg-navy-800 hover:bg-navy-900 text-white">
                <Link to="/auth">Login / Register</Link>
              </Button>
            )}
          </div>
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center">
          {!isMobileMenuOpen && (
            <div className="mr-4">
              <Badge variant="outline" className="bg-blue-50 text-indigo-700 border-none">
                <span className="flex items-center text-xs">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" /> 
                  4.9
                </span>
              </Badge>
            </div>
          )}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="rounded-md p-2 text-gray-700 hover:bg-gray-100" 
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }} 
            className="lg:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4">
              {/* Mobile success rate display */}
              <div className="mb-4 bg-blue-50 text-indigo-700 rounded-lg px-3 py-2">
                <div className="font-semibold">98% Success Rate</div>
                <div className="flex items-center">
                  4.9 <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mx-1" /> 
                  <span className="text-gray-600">(1.2k+ reviews)</span>
                </div>
              </div>
              
              <ul className="space-y-1">
                {navLinks.map(link => (
                  <li key={link.name}>
                    <Link 
                      to={link.path} 
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive(link.path) 
                          ? 'bg-gray-50 text-navy-800' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-navy-600'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Signed in as <span className="font-medium">{user.email}</span>
                    </div>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-navy-600">
                        Admin Dashboard
                      </Link>
                    )}
                    <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-navy-600">
                      Dashboard
                    </Link>
                    <button onClick={signOut} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-gray-50">
                      Logout
                    </button>
                  </div>
                ) : (
                  <Button asChild className="w-full bg-navy-800 hover:bg-navy-900 text-white">
                    <Link to="/auth">Login / Register</Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
