
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Globe, Users, Package, FileText, Calendar, LogOut } from 'lucide-react';

const AdminNav = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-navy text-white min-h-screen w-64 py-6 hidden md:block">
      <div className="px-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1 text-sm">Manage visa services</p>
      </div>
      
      <nav className="mt-8">
        <div className="space-y-1 px-3">
          <Link to="/admin">
            <Button 
              variant={isActive('/admin') ? 'secondary' : 'ghost'} 
              className={`w-full justify-start ${isActive('/admin') ? 'bg-teal text-white' : 'text-white hover:text-white hover:bg-navy-700'}`}
            >
              <Globe className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
          </Link>
          
          <Link to="/admin/countries">
            <Button 
              variant={isActive('/admin/countries') ? 'secondary' : 'ghost'} 
              className={`w-full justify-start ${isActive('/admin/countries') ? 'bg-teal text-white' : 'text-white hover:text-white hover:bg-navy-700'}`}
            >
              <Globe className="mr-2 h-5 w-5" />
              Countries
            </Button>
          </Link>
          
          <Link to="/admin/visa-types">
            <Button 
              variant={isActive('/admin/visa-types') ? 'secondary' : 'ghost'} 
              className={`w-full justify-start ${isActive('/admin/visa-types') ? 'bg-teal text-white' : 'text-white hover:text-white hover:bg-navy-700'}`}
            >
              <FileText className="mr-2 h-5 w-5" />
              Visa Types
            </Button>
          </Link>
          
          <Link to="/admin/packages">
            <Button 
              variant={isActive('/admin/packages') ? 'secondary' : 'ghost'} 
              className={`w-full justify-start ${isActive('/admin/packages') ? 'bg-teal text-white' : 'text-white hover:text-white hover:bg-navy-700'}`}
            >
              <Package className="mr-2 h-5 w-5" />
              Packages
            </Button>
          </Link>
          
          <Link to="/admin/appointments">
            <Button 
              variant={isActive('/admin/appointments') ? 'secondary' : 'ghost'} 
              className={`w-full justify-start ${isActive('/admin/appointments') ? 'bg-teal text-white' : 'text-white hover:text-white hover:bg-navy-700'}`}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Appointments
            </Button>
          </Link>
          
          <Link to="/admin/users">
            <Button 
              variant={isActive('/admin/users') ? 'secondary' : 'ghost'} 
              className={`w-full justify-start ${isActive('/admin/users') ? 'bg-teal text-white' : 'text-white hover:text-white hover:bg-navy-700'}`}
            >
              <Users className="mr-2 h-5 w-5" />
              Users
            </Button>
          </Link>
        </div>
      </nav>
      
      <div className="px-3 mt-auto pt-8">
        <Button 
          variant="outline" 
          className="w-full justify-start border-white/20 text-white hover:bg-white/10 hover:text-white"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default AdminNav;
