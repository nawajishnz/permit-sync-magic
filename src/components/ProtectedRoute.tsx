
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // If no user is logged in, redirect to auth page
      if (!user) {
        console.log('No user found, redirecting to auth');
        navigate('/auth');
      } 
      // If a specific role is required and user doesn't have it
      else if (requiredRole && userRole !== requiredRole) {
        console.log(`Required role: ${requiredRole}, User role: ${userRole}`);
        if (requiredRole === 'admin') {
          console.log('Admin role required but user is not admin, redirecting to dashboard');
          navigate('/dashboard');
        } else {
          console.log('User role required but user is admin, redirecting to admin');
          navigate('/admin');
        }
      }
      
      // If everything is fine, the component will render the children
      console.log('Protected route check passed:', { user: !!user, userRole, requiredRole });
    }
  }, [user, userRole, loading, navigate, requiredRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-teal border-t-transparent rounded-full" />
      </div>
    );
  }

  // Don't render children if authentication or authorization failed
  if (!user || (requiredRole && userRole !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
