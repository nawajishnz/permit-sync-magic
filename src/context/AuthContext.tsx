import React, { createContext, useState, useContext, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userRole: 'admin' | 'user' | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userRole: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Fetch user role if logged in
        if (currentSession?.user) {
          setTimeout(async () => {
            await fetchUserRole(currentSession.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession ? 'Session found' : 'No session');
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        await fetchUserRole(currentSession.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching user role for:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        toast({
          title: "Warning",
          description: "Unable to fetch user role. Some features may be limited.",
          variant: "destructive",
        });
        setUserRole('user'); // Default to user role on error
        return;
      }
      
      // Handle the role as a string value
      const roleValue = data?.role;
      console.log('User role fetched from DB:', roleValue);
      
      // Validate the role value
      if (roleValue === 'admin') {
        console.log('Setting user as admin');
        setUserRole('admin');
        // Ensure we're on the admin dashboard if we're an admin
        if (!window.location.pathname.startsWith('/admin')) {
          navigate('/admin');
        }
      } else {
        console.log('Setting user as regular user');
        setUserRole('user');
        // Redirect to user dashboard if trying to access admin routes
        if (window.location.pathname.startsWith('/admin')) {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole('user'); // Default to user role on error
      navigate('/dashboard');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext: signIn method called for:', { email });
      
      // Clear any previous sessions first to avoid conflicts
      await supabase.auth.signOut();
      console.log('AuthContext: Signed out previous session');
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password.trim() 
      });
      
      if (error) {
        console.error('AuthContext: Sign in error:', error);
        toast({
          title: "Error signing in",
          description: error.message || "An error occurred during sign in.",
          variant: "destructive",
        });
        return;
      }
      
      if (data.user) {
        console.log('AuthContext: User authenticated successfully:', data.user.id);
        // Set user immediately
        setUser(data.user);
        setSession(data.session);
        
        try {
          // Fetch user role immediately after sign in
          console.log('AuthContext: Fetching user role for:', data.user.id);
          const { data: userData, error: roleError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
          
          if (roleError) {
            console.error('AuthContext: Error fetching user role:', roleError);
            toast({
              title: "Warning",
              description: "Unable to determine user role. Some features may be limited.",
              variant: "destructive",
            });
            setUserRole('user');
            window.location.replace('/dashboard');
            return;
          }
          
          const roleValue = userData?.role;
          console.log('AuthContext: User role after sign in:', roleValue);
          
          // Set role and redirect
          if (roleValue === 'admin') {
            console.log('AuthContext: Admin user confirmed, preparing redirect');
            setUserRole('admin');
            toast({
              title: "Welcome Admin",
              description: "You have successfully signed in as an administrator.",
            });
            
            // Use setTimeout for more reliable state updates before redirect
            setTimeout(() => {
              console.log('AuthContext: Executing admin redirect');
              window.location.replace('/admin');
            }, 250);
          } else {
            console.log('AuthContext: Regular user confirmed, preparing redirect');
            setUserRole('user');
            toast({
              title: "Welcome",
              description: "You have successfully signed in.",
            });
            
            // Use setTimeout for more reliable state updates before redirect
            setTimeout(() => {
              console.log('AuthContext: Executing user redirect');
              window.location.replace('/dashboard');
            }, 250);
          }
        } catch (fetchError) {
          console.error('AuthContext: Error in role fetch:', fetchError);
          setUserRole('user'); // Default to user role
          
          // Use setTimeout for more reliable redirect
          setTimeout(() => {
            console.log('AuthContext: Executing default redirect after error');
            window.location.replace('/dashboard');
          }, 250);
        }
      }
    } catch (error: any) {
      console.error('AuthContext: Unexpected error during sign in:', error);
      toast({
        title: "Error signing in",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      throw error; // Re-throw for component-level handling
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Attempting to sign up with:', { email, fullName });
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: "Error signing up",
          description: error.message || "An error occurred during sign up.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Sign up response:', data);
      
      toast({
        title: "Account created!",
        description: "You have successfully created an account. Please sign in.",
      });
    } catch (error: any) {
      console.error('Unexpected error during sign up:', error);
      toast({
        title: "Error signing up",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate('/auth');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred during sign out.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, userRole, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
