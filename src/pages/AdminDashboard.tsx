import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminNav from '@/components/AdminNav';
import { Button } from '@/components/ui/button';
import { Menu, AlertTriangle } from 'lucide-react';
import AdminHome from '@/components/admin/AdminHome';
import CountriesManager from '@/components/admin/CountriesManager';
import VisaTypesManager from '@/components/admin/VisaTypesManager';
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 2 * 60 * 1000, // 2 minute cache
    },
  },
});

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

const SafeComponent = ({ component: Component }) => {
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  
  useEffect(() => {
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

  useEffect(() => {
    const verifyAdminStatus = async () => {
      try {
        console.log('AdminDashboard: Verifying admin status...');
        
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

  const refreshAllData = () => {
    queryClient.invalidateQueries();
    toast({
      title: "Data refreshed",
      description: "All data has been refreshed from the server.",
    });
  };
  
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
        <div className="hidden md:block w-64 bg-navy-800 text-white">
          <AdminNav />
        </div>
        
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-40 w-64 bg-navy-800 text-white p-6">
              <AdminNav />
            </div>
          </div>
        )}
        
        <div className="flex-1">
          <div className="md:hidden bg-white p-4 border-b flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="font-bold">Admin Dashboard</div>
            <button 
              onClick={refreshAllData}
              className="p-2 rounded-md hover:bg-gray-100 text-blue-600"
            >
              Refresh
            </button>
          </div>
          
          <div className="p-6">
            <Routes>
              <Route path="/" element={<SafeComponent component={AdminHome} />} />
              <Route path="/countries" element={<SafeComponent component={CountriesManager} />} />
              <Route path="/packages" element={<Navigate to="/admin/countries" replace />} />
              <Route path="/visa-types" element={<SafeComponent component={VisaTypesManager} />} />
              <Route path="/applications" element={<SafeComponent component={ApplicationsManager} />} />
              <Route path="/users" element={<SafeComponent component={UsersManager} />} />
              <Route path="/faqs" element={<SafeComponent component={FAQsManager} />} />
              <Route path="/testimonials" element={<SafeComponent component={TestimonialsManager} />} />
              <Route path="/legal-pages/*" element={<SafeComponent component={AdminLegalPages} />} />
              <Route path="/analytics" element={<SafeComponent component={AnalyticsDashboard} />} />
              <Route path="/addons" element={<SafeComponent component={AddonServicesManager} />} />
              <Route path="/tester" element={<SafeComponent component={AdminComponentTester} />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default AdminDashboard;
