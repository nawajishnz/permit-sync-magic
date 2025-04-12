import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminNav from '@/components/AdminNav';
import { Button } from '@/components/ui/button';
import { Menu, AlertTriangle } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import AdminComponentTester from '@/components/admin/AdminComponentTester';
import AdminLegalPages from '@/pages/admin/LegalPages';

// Create a simple queryClient instance for admin pages
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 2 * 60 * 1000, // 2 minute cache
    },
  },
});

// Fallback component for errors in admin components
const ErrorFallback = () => (
  <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
    <div className="flex items-start mb-4">
      <AlertTriangle className="h-6 w-6 text-amber-500 mr-3 mt-0.5" />
      <div>
        <h3 className="font-medium text-amber-800 mb-1">Component Error</h3>
        <p className="text-amber-700 text-sm">
          There was a problem loading this component. Please try refreshing the page.
        </p>
      </div>
    </div>
    <Button 
      onClick={() => window.location.reload()}
      variant="outline"
      size="sm"
      className="border-amber-300 text-amber-700 hover:bg-amber-100"
    >
      Refresh Page
    </Button>
  </div>
);

// Wrap routes with error handling
const SafeComponent = ({ component: Component }) => {
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  
  useEffect(() => {
    // Reset error state when component changes
    setHasError(false);
    setErrorDetails(null);
    console.log('SafeComponent: Loading component:', Component.name || 'Unknown');
  }, [Component]);
  
  if (hasError) {
    console.log('SafeComponent: Showing error fallback for:', Component.name || 'Unknown');
    return (
      <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
        <div className="flex items-start mb-4">
          <AlertTriangle className="h-6 w-6 text-amber-500 mr-3 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800 mb-1">Component Error</h3>
            <p className="text-amber-700 text-sm mb-2">
              There was a problem loading this component.
            </p>
            {errorDetails && (
              <div className="bg-white/60 p-2 rounded text-xs font-mono text-amber-800 mb-3 overflow-auto max-h-32">
                {errorDetails}
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            Refresh Page
          </Button>
          <Button 
            onClick={() => {
              setHasError(false);
              setErrorDetails(null);
            }}
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  try {
    return <Component />;
  } catch (error) {
    console.error('Error rendering admin component:', Component.name || 'Unknown', error);
    setHasError(true);
    setErrorDetails(error instanceof Error ? error.message : String(error));
    return <ErrorFallback />;
  }
};

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [verifyingAdmin, setVerifyingAdmin] = useState(true);

  // Verify admin status on component mount
  useEffect(() => {
    const verifyAdminStatus = async () => {
      try {
        console.log('AdminDashboard: Verifying admin status...');
        
        // Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          toast({
            title: "Authentication Error",
            description: "There was a problem verifying your session",
            variant: "destructive",
          });
          window.location.href = '/admin-login';
          return;
        }
        
        if (!sessionData.session?.user) {
          console.error('No active session found in admin dashboard');
          toast({
            title: "Authentication Required",
            description: "Please sign in to access the admin dashboard",
            variant: "destructive",
          });
          window.location.href = '/admin-login';
          return;
        }
        
        console.log('User session found:', sessionData.session.user.id);
        
        // Check if user has admin role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', sessionData.session.user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching admin role:', profileError);
          toast({
            title: "Profile Error",
            description: "Could not verify your administrator privileges",
            variant: "destructive",
          });
          window.location.href = '/admin-login';
          return;
        }
        
        console.log('User profile found:', profileData);
        
        if (profileData?.role !== 'admin') {
          console.error('User is not an admin:', profileData?.role);
          toast({
            title: "Access Denied",
            description: "Administrator privileges required",
            variant: "destructive",
          });
          
          // Sign out the non-admin user
          await supabase.auth.signOut();
          window.location.href = '/admin-login';
          return;
        }
        
        console.log('Admin access verified for user:', profileData?.full_name);
        setVerifyingAdmin(false);
      } catch (error) {
        console.error('Error in admin verification:', error);
        toast({
          title: "Verification Error",
          description: "An unexpected error occurred while verifying your access",
          variant: "destructive",
        });
        window.location.href = '/admin-login';
      }
    };
    
    verifyAdminStatus();
  }, []);

  // Global refresh function
  const refreshAllData = () => {
    queryClient.invalidateQueries();
    toast({
      title: "Data refreshed",
      description: "All data has been refreshed from the server.",
    });
  };
  
  // Show loading state while verifying admin access
  if (verifyingAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-700">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar for desktop */}
        <div className="hidden md:block w-64 bg-navy-800 text-white">
          <AdminNav />
        </div>
        
        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-40 w-64 bg-navy-800 text-white p-6">
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
          
          {/* Page content with error boundaries for each route */}
          <div className="p-6">
            <Routes>
              <Route path="/" element={<SafeComponent component={AdminHome} />} />
              <Route path="/countries" element={<SafeComponent component={CountriesManager} />} />
              <Route path="/visa-types" element={<SafeComponent component={VisaTypesManager} />} />
              <Route path="/packages" element={<SafeComponent component={PackagesManager} />} />
              <Route path="/addon-services" element={<SafeComponent component={AddonServicesManager} />} />
              <Route path="/applications" element={<SafeComponent component={ApplicationsManager} />} />
              <Route path="/users" element={<SafeComponent component={UsersManager} />} />
              <Route path="/faqs" element={<SafeComponent component={FAQsManager} />} />
              <Route path="/testimonials" element={<SafeComponent component={TestimonialsManager} />} />
              <Route path="/analytics" element={<SafeComponent component={AnalyticsDashboard} />} />
              <Route path="/component-tester" element={<AdminComponentTester />} />
              <Route path="/legal-pages" element={<AdminLegalPages />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default AdminDashboard;
