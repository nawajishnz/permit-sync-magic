
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  UserCircle, 
  Search,
  MessageSquare,
  LogOut,
  Settings,
  User
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

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, userRole } = useAuth();

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-navy text-navy hover:bg-navy hover:text-white">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>{getInitials(user?.user_metadata?.full_name || '')}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{user?.user_metadata?.full_name || user.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer flex items-center">
                      <User className="mr-2 h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {userRole === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer flex items-center">
                        <Settings className="mr-2 h-4 w-4" /> Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/account-settings" className="cursor-pointer flex items-center">
                      <Settings className="mr-2 h-4 w-4" /> Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              <>
                <Link 
                  to="/dashboard" 
                  className="text-navy-700 hover:text-teal px-4 py-2 rounded-md hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                {userRole === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-navy-700 hover:text-teal px-4 py-2 rounded-md hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link 
                  to="/account-settings" 
                  className="text-navy-700 hover:text-teal px-4 py-2 rounded-md hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Account Settings
                </Link>
                <button 
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="text-left text-red-500 hover:text-red-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </button>
              </>
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
