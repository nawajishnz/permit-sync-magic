
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminNav from '@/components/AdminNav';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

// Admin Dashboard Pages (placeholders for now)
const AdminHome = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1><p>Welcome to the admin dashboard.</p></div>;
const Countries = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Countries Management</h1></div>;
const VisaTypes = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Visa Types Management</h1></div>;
const Packages = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Packages Management</h1></div>;
const Appointments = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Appointments Management</h1></div>;
const Users = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Users Management</h1></div>;

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminNav />
      
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-40 w-64 bg-navy text-white p-6">
            <AdminNav />
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1">
        {/* Top bar - Mobile */}
        <div className="md:hidden p-4 bg-white border-b border-gray-200 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="ml-4 text-lg font-medium">Admin Dashboard</h1>
        </div>
        
        {/* Page content */}
        <div className="p-6">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/countries" element={<Countries />} />
            <Route path="/visa-types" element={<VisaTypes />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
