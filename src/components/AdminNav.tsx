import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Package, Globe, FileText, Users, MessageSquare, BarChart, Puzzle, Briefcase } from 'lucide-react';

const AdminNav = () => {
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
      icon: <MessageSquare className="h-5 w-5" />,
      label: 'Testimonials',
    },
    {
      to: '/admin/analytics',
      icon: <BarChart className="h-5 w-5" />,
      label: 'Analytics',
    },
  ];

  return (
    <nav className="bg-navy text-white p-4 w-64 flex-shrink-0">
      <div className="font-bold text-lg mb-4">Admin Panel</div>
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
    </nav>
  );
};

export default AdminNav;
