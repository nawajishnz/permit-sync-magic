
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import Countries from '@/pages/Countries';
import VisaFinder from '@/pages/VisaFinder';
import Auth from '@/pages/Auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from '@/pages/AdminDashboard';
import AddonServiceDetail from '@/pages/AddonServiceDetail';
import Testimonials from '@/pages/Testimonials';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minute cache
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/countries" element={<Countries />} />
          <Route path="/visa-finder" element={<VisaFinder />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin/*" element={<ProtectedRoute requiredRole="admin">{<AdminDashboard />}</ProtectedRoute>} />
          <Route path="/addon-services/:id" element={<AddonServiceDetail />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
