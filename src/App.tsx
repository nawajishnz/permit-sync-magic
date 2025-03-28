
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CountryDetails from "./pages/CountryDetails";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Countries from "./pages/Countries";
import VisaFinder from "./pages/VisaFinder";
import FAQs from "./pages/FAQs";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Refunds from "./pages/Refunds";
import AccountSettings from "./pages/AccountSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/countries" element={<Countries />} />
            <Route path="/country/:id" element={<CountryDetails />} />
            <Route path="/visa-finder" element={<VisaFinder />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/refunds" element={<Refunds />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/account-settings" 
              element={
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
