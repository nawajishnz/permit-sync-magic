import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [initialized, setInitialized] = useState(false);
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);

  // Set a maximum loading time to prevent infinite loading state
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading || !initialized) {
        console.log('ProtectedRoute loading timeout reached, performing direct check');
        setTimeoutOccurred(true);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeoutId);
  }, [loading, initialized]);

  // Perform a direct auth check if we hit the timeout
  useEffect(() => {
    if (timeoutOccurred) {
      const directCheck = async () => {
        try {
          console.log('Performing direct Supabase session check');
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (!sessionData.session?.user) {
            console.log('No active session found in direct check');
            toast({
              title: "Authentication required",
              description: "Please sign in to continue",
            });
            navigate(requiredRole === 'admin' ? '/admin-login' : '/auth');
            return;
          }
          
          // If we need admin role, check it directly
          if (requiredRole === 'admin') {
            console.log('Checking admin role directly for user:', sessionData.session.user.id);
            const { data: profileData } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', sessionData.session.user.id)
              .single();
              
            if (profileData?.role !== 'admin') {
              console.log('User is not an admin in direct check:', profileData);
              toast({
                title: "Access restricted",
                description: "You need administrator privileges for this page",
                variant: "destructive",
              });
              navigate('/dashboard');
              return;
            }
            
            console.log('Admin role confirmed in direct check, allowing access');
          }
        } catch (error) {
          console.error('Error in direct auth check:', error);
          navigate('/auth');
        }
      };
      
      directCheck();
    }
  }, [timeoutOccurred, navigate, requiredRole]);

  // Set initialized after a brief delay to ensure auth state is settled
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialized(true);
    }, 1000); // Slightly longer delay for more reliable initialization
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && initialized) {
      console.log('Protected route check - User:', !!user, 'Role:', userRole, 'Required:', requiredRole);
      
      // If no user is logged in, redirect to appropriate auth page
      if (!user) {
        console.log('No user found, redirecting to auth');
        toast({
          title: "Authentication required",
          description: "Please sign in to access this page",
        });
        
        // Redirect to admin login for admin routes, regular auth for user routes
        if (requiredRole === 'admin') {
          navigate('/admin-login');
        } else {
          navigate('/auth');
        }
        return;
      }
      
      // If a specific role is required and user doesn't have it
      if (requiredRole && userRole !== requiredRole) {
        console.log(`Required role: ${requiredRole}, User role: ${userRole}`);
        
        if (requiredRole === 'admin' && userRole !== 'admin') {
          console.log('Admin role required but user is not admin');
          toast({
            title: "Access restricted",
            description: "You need administrator privileges to access this page",
            variant: "destructive",
          });
          navigate('/dashboard');
        } else if (requiredRole === 'user' && userRole === 'admin') {
          console.log('User role required but user is admin');
          navigate('/admin');
        }
      }
    }
  }, [user, userRole, loading, navigate, requiredRole, initialized]);

  // If we hit the timeout and we're still loading, show a timeout message with retry option
  if (timeoutOccurred && (loading || !initialized)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center max-w-md mx-auto text-center">
          <div className="mb-6 text-amber-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-medium mt-2">Loading is taking longer than expected</h3>
          </div>
          <p className="text-gray-600 mb-6">
            We're having trouble verifying your access. You can try refreshing the page or going back to the login page.
          </p>
          <div className="flex space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => navigate(requiredRole === 'admin' ? '/admin-login' : '/auth')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state until authorization is determined
  if (loading || !initialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-700">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect non-admin users away from admin pages
  if (requiredRole === 'admin' && userRole !== 'admin') {
    return <Navigate to="/admin-login" replace />;
  }

  // Only render children if authentication and authorization are successful
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
