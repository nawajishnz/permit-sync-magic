import React, { lazy, Suspense } from 'react';
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

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/countries" element={<Countries />} />
          <Route path="/country/:id" element={<CountryDetails />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/addon-services" element={<AddonServices />} />
          <Route path="/addon-services/:id" element={<AddonServiceDetail />} />
          <Route path="/visa-application/:countryId/:packageId" element={<VisaApplication />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin-login" element={<AdminAuth />} />
          
          {/* Admin routes with lazy loading */}
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
      </Router>
    </QueryClientProvider>
  );
};

export default App;
