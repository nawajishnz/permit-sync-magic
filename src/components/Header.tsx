
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  UserCircle, 
  Search,
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
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/countries?search=${encodeURIComponent(searchTerm)}`);
    } else {
      toast({
        title: "Search term required",
        description: "Please enter a country or visa type to search",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="backdrop-blur-md bg-white/90 border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/c6f0f3d8-3504-4698-82f8-c54a489198c6.png" 
              alt="Permitsy" 
              className="h-8 sm:h-10" 
            />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/countries" className="text-gray-800 text-sm font-medium hover:text-primary transition-colors">
              Browse Countries
            </Link>
            <Link to="/visa-finder" className="text-gray-800 text-sm font-medium hover:text-primary transition-colors">
              Visa Finder
            </Link>
            <Link to="/faqs" className="text-gray-800 text-sm font-medium hover:text-primary transition-colors">
              FAQs
            </Link>
            <Link to="/contact" className="text-gray-800 text-sm font-medium hover:text-primary transition-colors">
              Contact Us
            </Link>
          </nav>
          
          {/* Desktop CTA + User */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Search visas..." 
                className="w-40 pl-9 pr-3 py-1.5 h-9 rounded-full bg-gray-50 border-gray-100 text-sm focus-visible:ring-1 focus-visible:ring-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full p-0 w-9 h-9 flex items-center justify-center hover:bg-gray-100">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>{getInitials(user?.user_metadata?.full_name || '')}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl border-gray-100 p-1 shadow-apple-card">
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-normal text-gray-500">My Account</DropdownMenuLabel>
                  <DropdownMenuItem asChild className="rounded-lg px-3 py-2 hover:bg-gray-50">
                    <Link to="/dashboard" className="cursor-pointer flex items-center">
                      <User className="mr-2 h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {userRole === 'admin' && (
                    <DropdownMenuItem asChild className="rounded-lg px-3 py-2 hover:bg-gray-50">
                      <Link to="/admin" className="cursor-pointer flex items-center">
                        <Settings className="mr-2 h-4 w-4" /> Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="rounded-lg px-3 py-2 hover:bg-gray-50">
                    <Link to="/account-settings" className="cursor-pointer flex items-center">
                      <Settings className="mr-2 h-4 w-4" /> Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer rounded-lg px-3 py-2 hover:bg-red-50 text-red-500">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-sm rounded-full px-4 py-2 h-9 hover:bg-gray-50">
                  Sign In
                </Button>
              </Link>
            )}
            
            <Link to="/visa-finder">
              <Button size="sm" className="text-sm h-9 bg-black hover:bg-gray-800 text-white rounded-full">
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
              className="rounded-full w-9 h-9 hover:bg-gray-50"
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
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in">
          <nav className="flex flex-col space-y-1 p-4">
            <Link 
              to="/countries" 
              className="text-gray-800 hover:bg-gray-50 px-4 py-3 rounded-xl"
              onClick={() => setIsOpen(false)}
            >
              Browse Countries
            </Link>
            <Link 
              to="/visa-finder" 
              className="text-gray-800 hover:bg-gray-50 px-4 py-3 rounded-xl"
              onClick={() => setIsOpen(false)}
            >
              Visa Finder
            </Link>
            <Link 
              to="/faqs" 
              className="text-gray-800 hover:bg-gray-50 px-4 py-3 rounded-xl"
              onClick={() => setIsOpen(false)}
            >
              FAQs
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-800 hover:bg-gray-50 px-4 py-3 rounded-xl"
              onClick={() => setIsOpen(false)}
            >
              Contact Us
            </Link>
            
            <div className="h-px w-full bg-gray-100 my-2"></div>
            
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-800 hover:bg-gray-50 px-4 py-3 rounded-xl flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="mr-3 h-4 w-4" /> Dashboard
                </Link>
                {userRole === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-gray-800 hover:bg-gray-50 px-4 py-3 rounded-xl flex items-center"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="mr-3 h-4 w-4" /> Admin Dashboard
                  </Link>
                )}
                <Link 
                  to="/account-settings" 
                  className="text-gray-800 hover:bg-gray-50 px-4 py-3 rounded-xl flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="mr-3 h-4 w-4" /> Account Settings
                </Link>
                <button 
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="text-left text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl flex items-center w-full"
                >
                  <LogOut className="mr-3 h-4 w-4" /> Sign Out
                </button>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="text-gray-800 hover:bg-gray-50 px-4 py-3 rounded-xl flex items-center"
                onClick={() => setIsOpen(false)}
              >
                <UserCircle className="mr-3 h-4 w-4" /> Sign In
              </Link>
            )}
            
            <Link 
              to="/visa-finder" 
              className="bg-black text-white hover:bg-gray-800 px-4 py-3 rounded-xl mt-2 text-center"
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
