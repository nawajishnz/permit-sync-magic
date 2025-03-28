
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
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
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
      } else {
        console.log('Setting user as regular user');
        setUserRole('user'); // Default to user for any other value
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole('user'); // Default to user role on error
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', { email });
      
      // First, validate inputs
      if (!email.trim() || !password.trim()) {
        toast({
          title: "Error signing in",
          description: "Email and password are required",
          variant: "destructive",
        });
        return;
      }
      
      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password.trim() 
      });
      
      if (error) {
        console.error('Sign in error:', error);
        
        // Show specific error message
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Error signing in",
            description: "The email or password you entered is incorrect. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error signing in",
            description: error.message || "An error occurred during sign in.",
            variant: "destructive",
          });
        }
        
        return;
      }
      
      console.log('Sign in successful:', data.user?.id);
      
      if (data.user) {
        // Fetch user role to determine redirect
        try {
          const { data: userData, error: roleError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
          
          if (roleError) {
            console.error('Error fetching user role after sign in:', roleError);
            toast({
              title: "Warning",
              description: "Unable to determine user role. Redirecting to default dashboard.",
            });
            navigate('/dashboard');
            return;
          }
          
          toast({
            title: "Success!",
            description: "You have successfully signed in.",
          });
          
          // Handle the role as a string value
          const roleValue = userData?.role;
          console.log('User role from database after sign in:', roleValue);
          
          // Validate the role value and redirect accordingly
          if (roleValue === 'admin') {
            console.log('User is admin, redirecting to admin dashboard');
            navigate('/admin');
          } else {
            console.log('User is regular user, redirecting to user dashboard');
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Unexpected error fetching user role:', error);
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Unexpected error during sign in:', error);
      toast({
        title: "Error signing in",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
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
