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
    // Set up debugging
    const subscription = setupAuthDebugger();
    
    // Initial session check
    const initializeAuth = async () => {
      try {
        // Get the current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          setLoading(false);
          return;
        }
        
        if (currentSession) {
          console.log('Found existing session, setting up user state');
          setSession(currentSession);
          setUser(currentSession.user);
          
          // If we have a user, get their role from profiles
          if (currentSession.user) {
            await fetchUserRole(currentSession.user.id);
          }
        }
      } catch (error) {
        console.error('Unexpected error during initialization:', error);
      } finally {
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
      
      const profile = await getUserProfile(userId);
      
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
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.replace('/dashboard');
        }, 300);
        return;
      }
      
      // Set role based on profile
      const roleValue = profile.role as 'admin' | 'user' | null;
      console.log('AuthContext: User role after sign in:', roleValue);
      
      setUserRole(roleValue || 'user');
      
      // Redirect based on role
      if (roleValue === 'admin') {
        toast({
          title: "Welcome Admin",
          description: "You have successfully signed in as an administrator.",
        });
        setTimeout(() => {
          window.location.replace('/admin');
        }, 300);
      } else {
        toast({
          title: "Welcome",
          description: "You have successfully signed in.",
        });
        setTimeout(() => {
          window.location.replace('/dashboard');
        }, 300);
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
            { full_name: fullName, role: 'user' }
          );
            
          if (profileError) {
            console.error('Error creating profile:', profileError);
          } else {
            console.log('Profile created successfully');
          }
        } catch (profileErr) {
          console.error('Unexpected error creating profile:', profileErr);
        }
      }
      
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
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear state
      setSession(null);
      setUser(null);
      setUserRole(null);
      
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
