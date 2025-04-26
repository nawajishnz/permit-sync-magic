import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import Countries from '@/pages/Countries';
import Auth from '@/pages/Auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import AddonServiceDetail from '@/pages/AddonServiceDetail';
import AddonServices from '@/pages/AddonServices';
import Testimonials from '@/pages/Testimonials';
import CountryDetails from '@/pages/CountryDetails';
import VisaApplication from '@/pages/VisaApplication';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Cookies from '@/pages/Cookies';
import Refunds from '@/pages/Refunds';
import FAQs from '@/pages/FAQs';
import Contact from '@/pages/Contact';
import NotFound from '@/pages/NotFound';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import AdminAuth from '@/pages/AdminAuth';
import ScrollToTop from '@/components/ScrollToTop';
import NavigationScrollToTop from '@/components/NavigationScrollToTop';
import Dashboard from '@/pages/Dashboard';
import { AuthProvider } from '@/context/AuthContext';
import Blog from '@/pages/Blog';

// Lazy load the admin dashboard to improve initial page load
const AdminDashboard = lazy(() => {
  console.log('Lazy loading AdminDashboard component');
  return import('@/pages/AdminDashboard')
    .then(module => {
      console.log('AdminDashboard loaded successfully');
      return module;
    })
    .catch(error => {
      console.error('Error loading AdminDashboard:', error);
      throw error;
    });
});

// Lazy load the AdminLegalPages component
const AdminLegalPages = lazy(() => import('@/pages/admin/LegalPages'));

// Create a QueryClient instance with reliable settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minute cache
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      retry: 1, // Minimal retry to prevent hanging on errors
      refetchOnReconnect: 'always',
    },
  },
});

// Loading component for Suspense with better UX
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
      <p className="text-gray-700 mb-2">Loading admin dashboard...</p>
      <p className="text-gray-500 text-sm">This may take a moment</p>
    </div>
  </div>
);

// Add debug component
const DebugPanel = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});

  useEffect(() => {
    // Log environment variables
    const envInfo = {
      nodeEnv: import.meta.env.MODE,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'Not set',
      supabaseKeyAvailable: Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY),
      buildTime: new Date().toISOString()
    };
    
    setDebugInfo(envInfo);
    
    // Check if we can access Supabase
    import('@/integrations/supabase/client')
      .then(({ supabase }) => {
        supabase.auth.getSession()
          .then(({ data, error }) => {
            setDebugInfo(prev => ({
              ...prev,
              supabaseConnected: !error,
              supabaseError: error ? String(error) : null
            }));
          });
      })
      .catch(err => {
        setDebugInfo(prev => ({
          ...prev,
          supabaseImportError: String(err)
        }));
      });
  }, []);

  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          zIndex: 9999,
          padding: '5px 10px',
          background: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          opacity: 0.7
        }}
      >
        Debug
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        zIndex: 9999,
        padding: '15px',
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        maxWidth: '400px',
        maxHeight: '400px',
        overflow: 'auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>Debug Info</h3>
        <button onClick={() => setShowDebug(false)}>Close</button>
      </div>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ScrollToTop />
          <NavigationScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/countries" element={<Countries />} />
            <Route path="/country/:id" element={<CountryDetails />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/addon-services" element={<AddonServices />} />
            <Route path="/addon-services/:id" element={<AddonServiceDetail />} />
            <Route path="/visa-application/:countryId" element={<VisaApplication />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin-login" element={<AdminAuth />} />
            <Route path="/blog" element={<Blog />} />
            
            {/* User Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="user">
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/*" element={
              <Suspense fallback={<PageLoader />}>
                <AdminDashboard />
              </Suspense>
            } />
            
            {/* Policy Pages */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/refunds" element={<Refunds />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* 404 Not Found Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          {/* Comment out or remove the DebugPanel */}
          {/* <DebugPanel /> */}
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
