import React, { createContext, useState, useContext, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { 
  checkSession, 
  refreshSession, 
  getUserProfile, 
  createUserProfile,
  setupAuthDebugger 
} from '@/utils/supabaseHelpers';

// Define the type for our context
type AuthContextType = {
  session: Session | null;
  user: User | null;
  userRole: 'admin' | 'user' | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

// Create and export the context
export const AuthContext = createContext<AuthContextType | null>(null);

// Main hook export
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up debugging
    const subscription = setupAuthDebugger();
    
    // Initial session check
    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Starting initialization process');
        
        // Standard session check with a timeout
        const checkAuthSession = async () => {
          try {
            console.log('Checking auth session...');
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('Error getting session:', error);
              return null;
            }
            
            return data.session;
          } catch (err) {
            console.error('Unexpected error during session check:', err);
            return null;
          }
        };
        
        // Set a timeout to prevent hanging
        const sessionTimeout = setTimeout(() => {
          console.warn('Session check timed out after 10 seconds');
          setLoading(false);
        }, 10000);
        
        // Get the current session
        const currentSession = await checkAuthSession();
        clearTimeout(sessionTimeout);
        
        if (currentSession) {
          console.log('Found existing session:', currentSession.user?.id);
          console.log('Session expires at:', new Date(currentSession.expires_at! * 1000).toLocaleString());
          
          setSession(currentSession);
          setUser(currentSession.user);
          
          // If we have a user, get their role from profiles
          if (currentSession.user) {
            console.log('Fetching role for authenticated user');
            await fetchUserRole(currentSession.user.id);
          }
        } else {
          console.log('No session found during initialization');
        }
      } catch (error) {
        console.error('Unexpected error during initialization:', error);
      } finally {
        console.log('Auth initialization complete, loading state set to false');
        setLoading(false);
      }
    };
    
    initializeAuth();

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching user role for ID:', userId);
      
      // Set a timeout for role fetch
      const roleTimeout = setTimeout(() => {
        console.warn('Role fetch timed out, defaulting to user role');
        setUserRole('user');
      }, 8000);
      
      // Try to get the user profile
      const profile = await getUserProfile(userId);
      clearTimeout(roleTimeout);
      
      if (!profile) {
        console.log('No profile found, creating default profile');
        const { profile: newProfile, error } = await createUserProfile(userId, {
          full_name: user?.user_metadata?.full_name || user?.email || 'User',
        });
        
        if (error) {
          console.error('Error creating profile:', error);
          setUserRole('user'); // Default to user role on error
          return;
        }
        
        console.log('New profile created with role:', newProfile?.role);
        setUserRole(newProfile?.role || 'user');
        return;
      }
      
      console.log('User role from database:', profile.role);
      setUserRole(profile.role);
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole('user'); // Default to user role on error
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext: signIn method called for:', { email });
      
      // Sign out first to clear any stale sessions
      await supabase.auth.signOut();
      
      // Attempt sign in with provided credentials
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
        throw error; // Throw error to be handled by the component
      }
      
      if (!data.user || !data.session) {
        console.error('AuthContext: No user or session data returned');
        toast({
          title: "Error signing in",
          description: "No user data returned from authentication service.",
          variant: "destructive",
        });
        throw new Error("No user data returned");
      }
      
      console.log('AuthContext: User authenticated successfully:', data.user.id);
      
      // Set user and session
      setUser(data.user);
      setSession(data.session);
      
      // Get the user's profile and role
      const profile = await getUserProfile(data.user.id);
      
      if (!profile) {
        // Create profile if it doesn't exist
        console.log('AuthContext: Profile not found, creating new profile');
        const { profile: newProfile, error } = await createUserProfile(
          data.user.id, 
          { 
            full_name: data.user.user_metadata?.full_name || email,
            role: 'user'
          }
        );
        
        if (error) {
          console.error('AuthContext: Failed to create profile:', error);
          toast({
            title: "Profile Error",
            description: "Failed to create user profile.",
            variant: "destructive",
          });
          setUserRole('user');
        } else {
          setUserRole(newProfile?.role || 'user');
        }
        
        console.log('AuthContext: Redirecting new user to dashboard');
        // Force the navigation to happen after state is settled
        setTimeout(() => navigate('/dashboard'), 100);
        return;
      }
      
      // Set role based on profile
      const roleValue = profile.role as 'admin' | 'user' | null;
      console.log('AuthContext: User role after sign in:', roleValue);
      
      setUserRole(roleValue || 'user');
      
      // Redirect based on role using navigate with a slight delay
      if (roleValue === 'admin') {
        toast({
          title: "Welcome Admin",
          description: "You have successfully signed in as an administrator.",
        });
        console.log('AuthContext: Redirecting admin to admin dashboard');
        setTimeout(() => navigate('/admin'), 100);
      } else {
        toast({
          title: "Welcome",
          description: "You have successfully signed in.",
        });
        console.log('AuthContext: Redirecting user to dashboard');
        setTimeout(() => navigate('/dashboard'), 100);
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
      
      // Sign out first to ensure no session conflicts
      await supabase.auth.signOut();
      
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
      
      // Create profile for new user
      if (data.user) {
        try {
          console.log('Creating profile for new user:', data.user.id);
          const { error: profileError } = await createUserProfile(
            data.user.id,
            {
              full_name: fullName,
              role: 'user'
            }
          );
          
          if (profileError) {
            console.error('Error creating user profile:', profileError);
          }
        } catch (error) {
          console.error('Error in profile creation:', error);
        }
      }
      
      toast({
        title: "Account Created",
        description: "Your account has been created successfully!",
      });
    } catch (error: any) {
      console.error('Unexpected error during sign up:', error);
      toast({
        title: "Error signing up",
        description: error.message || "An unexpected error occurred during sign up.",
        variant: "destructive",
      });
    }
  };
  
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRole(null);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const value = {
    session,
    user,
    userRole,
    signIn,
    signUp,
    signOut,
    loading,
  };
  
  console.log('AuthContext state update:', { 
    hasUser: !!user, 
    userRole, 
    loading 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
