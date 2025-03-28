
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminNav from '@/components/AdminNav';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import AdminHome from '@/components/admin/AdminHome';
import CountriesManager from '@/components/admin/CountriesManager';
import VisaTypesManager from '@/components/admin/VisaTypesManager';
import PackagesManager from '@/components/admin/PackagesManager';
import ApplicationsManager from '@/components/admin/ApplicationsManager';
import UsersManager from '@/components/admin/UsersManager';
import FAQsManager from '@/components/admin/FAQsManager';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            <Route path="/countries" element={<CountriesManager />} />
            <Route path="/visa-types" element={<VisaTypesManager />} />
            <Route path="/packages" element={<PackagesManager />} />
            <Route path="/applications" element={<ApplicationsManager />} />
            <Route path="/users" element={<UsersManager />} />
            <Route path="/faqs" element={<FAQsManager />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
