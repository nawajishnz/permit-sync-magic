import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Package, Globe, FileText, Users, MessageSquare, BarChart, Puzzle, Briefcase, Award, LogOut, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const AdminNav = () => {
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      console.log('Admin sign out initiated');
      await supabase.auth.signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully logged out",
      });
      window.location.href = '/admin-login';
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    {
      to: '/admin',
      icon: <Home className="h-5 w-5" />,
      label: 'Dashboard',
    },
    {
      to: '/admin/countries',
      icon: <Globe className="h-5 w-5" />,
      label: 'Countries',
    },
    {
      to: '/admin/visa-types',
      icon: <FileText className="h-5 w-5" />,
      label: 'Visa Types',
    },
    {
      to: '/admin/packages',
      icon: <Package className="h-5 w-5" />,
      label: 'Packages',
    },
    {
      to: '/admin/addon-services',
      icon: <Puzzle className="h-5 w-5" />,
      label: 'Addon Services',
    },
    {
      to: '/admin/applications',
      icon: <Briefcase className="h-5 w-5" />,
      label: 'Applications',
    },
    {
      to: '/admin/users',
      icon: <Users className="h-5 w-5" />,
      label: 'Users',
    },
    {
      to: '/admin/faqs',
      icon: <MessageSquare className="h-5 w-5" />,
      label: 'FAQs',
    },
    {
      to: '/admin/testimonials',
      icon: <Award className="h-5 w-5" />,
      label: 'Testimonials',
    },
    {
      to: '/admin/analytics',
      icon: <BarChart className="h-5 w-5" />,
      label: 'Analytics',
    },
    {
      to: '/admin/component-tester',
      icon: <TestTube className="h-5 w-5" />,
      label: 'Component Tester',
    },
  ];

  return (
    <nav className="flex flex-col h-full justify-between bg-navy text-white p-4 w-64 flex-shrink-0">
      <div>
        <div className="font-bold text-xl mb-6 pb-2 border-b border-navy-700">Admin Panel</div>
        <ul>
          {navItems.map((item) => (
            <li key={item.label} className="mb-2">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md hover:bg-navy-700 transition-colors ${
                    isActive ? 'bg-navy-700 font-semibold' : ''
                  }`
                }
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-auto pt-4 border-t border-navy-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-navy-700 px-2 py-2 h-auto font-normal"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </Button>
      </div>
    </nav>
  );
};

export default AdminNav;
