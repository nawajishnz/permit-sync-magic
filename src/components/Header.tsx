import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  UserCircle,
  LogOut,
  Settings,
  User,
  Package,
  Globe,
  MessageSquare,
  PhoneCall,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const [hideHeader, setHideHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Set scrolled state for visual effects
      if (currentScrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      
      // Hide header when scrolling down, show when scrolling up
      if (currentScrollY > 500) {
        setHideHeader(currentScrollY > lastScrollY.current);
      } else {
        setHideHeader(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U';
  };
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header 
      ref={headerRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out",
        scrolled 
          ? "bg-white/95 backdrop-blur-md shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-b border-gray-100" 
          : "bg-white border-b border-transparent",
        hideHeader ? "-translate-y-full" : "translate-y-0"
      )}
      style={{
        WebkitBackdropFilter: "saturate(180%) blur(10px)",
        backdropFilter: "saturate(180%) blur(10px)"
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative rounded-full p-1">
              <img 
                src="/lovable-uploads/c6f0f3d8-3504-4698-82f8-c54a489198c6.png" 
                alt="Permitsy" 
                className="h-9 sm:h-10" 
              />
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <NavLink to="/countries" isActive={isActive('/countries')}>
              <Globe className="w-4 h-4 mr-1.5" />
              <span>Browse Countries</span>
            </NavLink>
            
            <NavLink to="/addon-services" isActive={isActive('/addon-services')}>
              <Package className="w-4 h-4 mr-1.5" />
              <span>Add-on Services</span>
            </NavLink>
            
            <NavLink to="/testimonials" isActive={isActive('/testimonials')}>
              <MessageSquare className="w-4 h-4 mr-1.5" />
              <span>Testimonials</span>
            </NavLink>
            
            <NavLink to="/contact" isActive={isActive('/contact')}>
              <PhoneCall className="w-4 h-4 mr-1.5" />
              <span>Contact Us</span>
            </NavLink>
          </nav>
          
          {/* Desktop CTA + User */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "rounded-full p-1 hover:bg-gray-100 hover:shadow-sm transition-all duration-300",
                      scrolled ? "bg-white" : "bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
                          {getInitials(user?.user_metadata?.full_name || '')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium pr-1 hidden lg:block">
                        {user?.user_metadata?.full_name?.split(' ')[0] || 'Account'}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl border-gray-100 p-1 shadow-lg backdrop-blur-md bg-white/95">
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-normal text-gray-500">My Account</DropdownMenuLabel>
                  <DropdownMenuItem asChild className="rounded-lg px-3 py-2 hover:bg-indigo-50 cursor-pointer">
                    <Link to="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-indigo-600" /> 
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  {userRole === 'admin' && (
                    <DropdownMenuItem asChild className="rounded-lg px-3 py-2 hover:bg-indigo-50 cursor-pointer">
                      <Link to="/admin" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4 text-indigo-600" /> 
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="rounded-lg px-3 py-2 hover:bg-indigo-50 cursor-pointer">
                    <Link to="/account-settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4 text-indigo-600" /> 
                      <span>Account Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-lg px-3 py-2 hover:bg-red-50 text-red-500 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> 
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button 
                  size="sm" 
                  className={cn(
                    "relative text-sm font-medium rounded-full px-6 py-2.5 h-10 overflow-hidden",
                    "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700",
                    "text-white shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]",
                    "transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
                  )}
                >
                  <span className="relative z-10 flex items-center">
                    <UserCircle className="w-4 h-4 mr-1.5 -ml-0.5" />
                    Sign In
                  </span>
                  <span className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 hover:opacity-20 transition-opacity duration-300" />
                </Button>
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className={cn(
                "rounded-full w-10 h-10 hover:bg-gray-100 transition-colors duration-200",
                isOpen ? "bg-gray-100" : "bg-transparent"
              )}
            >
              {isOpen ? (
                <X className="h-5 w-5 text-gray-800" />
              ) : (
                <Menu className="h-5 w-5 text-gray-800" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={cn(
          "md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col space-y-1 p-4">
          <Link 
            to="/countries" 
            className={cn(
              "flex items-center px-4 py-3 rounded-xl transition-colors",
              isActive('/countries') 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-gray-800 hover:bg-gray-50"
            )}
            onClick={() => setIsOpen(false)}
          >
            <Globe className="mr-3 h-5 w-5" /> Browse Countries
          </Link>
          <Link 
            to="/addon-services" 
            className={cn(
              "flex items-center px-4 py-3 rounded-xl transition-colors",
              isActive('/addon-services') 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-gray-800 hover:bg-gray-50"
            )}
            onClick={() => setIsOpen(false)}
          >
            <Package className="mr-3 h-5 w-5" /> Add-on Services
          </Link>
          <Link 
            to="/testimonials" 
            className={cn(
              "flex items-center px-4 py-3 rounded-xl transition-colors",
              isActive('/testimonials') 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-gray-800 hover:bg-gray-50"
            )}
            onClick={() => setIsOpen(false)}
          >
            <MessageSquare className="mr-3 h-5 w-5" /> Testimonials
          </Link>
          <Link 
            to="/contact" 
            className={cn(
              "flex items-center px-4 py-3 rounded-xl transition-colors",
              isActive('/contact') 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-gray-800 hover:bg-gray-50"
            )}
            onClick={() => setIsOpen(false)}
          >
            <PhoneCall className="mr-3 h-5 w-5" /> Contact Us
          </Link>
          
          <div className="h-px w-full bg-gray-100 my-2"></div>
          
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className={cn(
                  "flex items-center px-4 py-3 rounded-xl transition-colors",
                  isActive('/dashboard') 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-gray-800 hover:bg-gray-50"
                )}
                onClick={() => setIsOpen(false)}
              >
                <User className="mr-3 h-5 w-5" /> Dashboard
              </Link>
              {userRole === 'admin' && (
                <Link 
                  to="/admin" 
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl transition-colors",
                    isActive('/admin') 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "text-gray-800 hover:bg-gray-50"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="mr-3 h-5 w-5" /> Admin Dashboard
                </Link>
              )}
              <Link 
                to="/account-settings" 
                className={cn(
                  "flex items-center px-4 py-3 rounded-xl transition-colors",
                  isActive('/account-settings') 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-gray-800 hover:bg-gray-50"
                )}
                onClick={() => setIsOpen(false)}
              >
                <Settings className="mr-3 h-5 w-5" /> Account Settings
              </Link>
              <button 
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="text-left text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl flex items-center w-full transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" /> Sign Out
              </button>
            </>
          ) : (
            <Link 
              to="/auth" 
              className="text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 px-4 py-3 rounded-xl flex items-center justify-center shadow-md transition-all duration-300"
              onClick={() => setIsOpen(false)}
            >
              <UserCircle className="mr-3 h-5 w-5" /> Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

// NavLink component for desktop navigation
const NavLink: React.FC<{ 
  children: React.ReactNode; 
  to: string; 
  isActive: boolean;
}> = ({ children, to, isActive }) => {
  return (
    <Link
      to={to}
      className={cn(
        "relative flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 overflow-hidden",
        isActive 
          ? "text-indigo-700 bg-indigo-50/90" 
          : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
      )}
    >
      <span className="relative z-10 flex items-center">
        {children}
      </span>
      
      {/* Active indicator */}
      {isActive && (
        <>
          <span className="absolute bottom-1.5 left-1/2 w-1/2 h-0.5 bg-indigo-500 transform -translate-x-1/2 rounded-full" />
          <span className="absolute inset-0 bg-indigo-100/20 rounded-full -z-10" />
        </>
      )}
      
      {/* Hover effect */}
      <span 
        className={cn(
          "absolute inset-0 -z-10 bg-gradient-to-r from-indigo-50/0 via-indigo-50/50 to-indigo-50/0",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          "transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
        )}
      />
    </Link>
  );
};

export default Header;
