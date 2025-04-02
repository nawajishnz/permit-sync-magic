
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  
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
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Countries', path: '/countries' },
    { name: 'Visa Finder', path: '/visa-finder' },
    { name: 'Testimonials', path: '/testimonials' },
  ];
  
  const headerClasses = `fixed top-0 w-full z-50 transition-all duration-200 ${
    isScrolled || isMobileMenuOpen ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
  }`;

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/c6f0f3d8-3504-4698-82f8-c54a489198c6.png" 
            alt="Permitsy" 
            className="h-10 mr-2" 
          />
          <span className="text-xl font-bold text-navy">Permitsy</span>
        </Link>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-1">
          <ul className="flex items-center space-x-1">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-teal'
                      : 'text-gray-700 hover:text-teal hover:bg-gray-100'
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
              <Button asChild className="bg-teal hover:bg-teal/90">
                <Link to="/auth">Login / Register</Link>
              </Button>
            )}
          </div>
        </nav>
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden rounded-md p-2 text-gray-700 hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-2">
              <ul className="space-y-1">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive(link.path)
                          ? 'bg-gray-100 text-teal'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-teal'
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
                      <Link
                        to="/admin"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-teal"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-teal"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={signOut}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Button asChild className="w-full bg-teal hover:bg-teal/90">
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
