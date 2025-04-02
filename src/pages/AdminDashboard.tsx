
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
import AddonServicesManager from '@/components/admin/AddonServicesManager';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import { useToast } from '@/hooks/use-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a queryClient instance that will be passed to child components
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always refetch to ensure fresh data
      refetchOnWindowFocus: true, // Refetch when window gets focus
      refetchOnMount: true, // Always refetch on component mount
      retry: 1, // Only retry once to avoid excessive requests on failure
    },
  },
});

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  // Global refresh function to invalidate all queries
  const refreshAllData = () => {
    queryClient.invalidateQueries();
    toast({
      title: "Data refreshed",
      description: "All data has been refreshed from the server.",
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
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
          
          {/* Admin control bar */}
          <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm">
            <h1 className="text-xl font-semibold text-navy-800">Admin Control Panel</h1>
            <Button onClick={refreshAllData} variant="outline" className="text-sm">
              Refresh All Data
            </Button>
          </div>
          
          {/* Page content */}
          <div className="p-6">
            <Routes>
              <Route path="/" element={<AdminHome />} />
              <Route path="/countries" element={<CountriesManager />} />
              <Route path="/visa-types" element={<VisaTypesManager />} />
              <Route path="/packages" element={<PackagesManager />} />
              <Route path="/addon-services" element={<AddonServicesManager />} />
              <Route path="/applications" element={<ApplicationsManager />} />
              <Route path="/users" element={<UsersManager />} />
              <Route path="/faqs" element={<FAQsManager />} />
              <Route path="/testimonials" element={<TestimonialsManager />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Routes>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default AdminDashboard;
