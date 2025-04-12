import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, LoaderIcon, EyeOff, Eye } from 'lucide-react';
import { createAdminUser } from '@/utils/adminUtils';
import { supabase } from '@/integrations/supabase/client';

// Admin credentials
const ADMIN_TEST_EMAIL = "admin@permitsy.com";
const ADMIN_TEST_PASSWORD = "admin123";

const AdminAuth = () => {
  const { signIn, user, userRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(ADMIN_TEST_EMAIL);
  const [password, setPassword] = useState(ADMIN_TEST_PASSWORD);
  const [isLoading, setIsLoading] = useState(false);
  const [setupAdmin, setSetupAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adminExists, setAdminExists] = useState(false);

  // Check for admin account existence
  useEffect(() => {
    console.log('Checking if admin account exists...');
    const checkAdminExists = async () => {
      try {
        // Check if admin credentials work
        console.log('Attempting to sign in with admin credentials to check existence');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: ADMIN_TEST_EMAIL,
          password: ADMIN_TEST_PASSWORD
        });
        
        if (error) {
          console.log('Admin account check error:', error.message);
          setAdminExists(false);
          return;
        }
        
        // If we got a user back, sign out and note admin exists
        if (data?.user) {
          console.log('Admin account exists, signing out');
          await supabase.auth.signOut();
          setAdminExists(true);
        } else {
          console.log('Admin user not found');
          setAdminExists(false);
        }
      } catch (error) {
        console.error('Admin account check failed:', error);
        setAdminExists(false);
      }
    };
    
    checkAdminExists();
  }, []);

  // Redirect if already logged in as admin
  useEffect(() => {
    console.log('Admin login page - Current auth state:', { 
      user: user ? { id: user.id, email: user.email } : null, 
      userRole 
    });
    
    if (user && userRole === 'admin') {
      console.log('Admin user detected, redirecting to admin dashboard');
      // Use direct navigation instead of window.location for more reliability
      navigate('/admin');
    }
  }, [user, userRole, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Basic validation
      if (!email.trim() || !password.trim()) {
        toast({
          title: "Error",
          description: "Please enter both email and password",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Clear previous sessions
      await supabase.auth.signOut();
      
      // Attempt login with provided credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });
      
      if (error) {
        console.error('Authentication error:', error);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (!data.user) {
        toast({
          title: "Login Failed",
          description: "No user found with these credentials",
          variant: "destructive",
        });
        return;
      }
      
      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        toast({
          title: "Error",
          description: "Could not verify admin privileges",
          variant: "destructive",
        });
        return;
      }
      
      if (profile?.role !== 'admin') {
        console.error('User is not an admin:', profile);
        toast({
          title: "Access Denied",
          description: "This account does not have administrator privileges",
          variant: "destructive",
        });
        // Sign out non-admin user
        await supabase.auth.signOut();
        return;
      }
      
      // Success - directly redirect to admin page
      console.log('Admin login successful, redirecting...');
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard",
      });
      
      // Use window.location for a complete page refresh
      window.location.href = '/admin';
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAdminAccount = async () => {
    setIsLoading(true);
    setSetupAdmin(true);
    
    try {
      console.log('Starting admin account creation process...');
      
      // Create admin user with the utility function
      console.log('Calling createAdminUser utility...');
      const result = await createAdminUser(ADMIN_TEST_EMAIL, ADMIN_TEST_PASSWORD);
      console.log('createAdminUser result:', result);
      
      if (result.success) {
        console.log('Admin account created successfully');
        setAdminExists(true);
        toast({
          title: "Admin Account Created",
          description: "The admin account has been set up successfully",
        });
        
        // Login directly with the admin credentials
        console.log('Signing out before admin login');
        await supabase.auth.signOut(); // Clear any existing sessions
        
        console.log('Attempting to sign in with admin credentials');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: ADMIN_TEST_EMAIL,
          password: ADMIN_TEST_PASSWORD
        });
        
        if (error) {
          console.error('Error signing in after admin creation:', error);
          toast({
            title: "Login Error",
            description: "Admin account created but couldn't log in automatically. Please try logging in manually.",
            variant: "destructive",
          });
          return;
        }
        
        console.log('Admin login successful, user:', data.user?.id);
        
        // Verify the user role is set to admin
        console.log('Verifying admin role in profile');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
          
        if (profileError || profile?.role !== 'admin') {
          console.error('Role verification error:', profileError || 'Not admin role');
          toast({
            title: "Warning",
            description: "Account created but role may not be set correctly. Please try logging in manually.",
            variant: "destructive",
          });
          return;
        }
        
        console.log('Admin role confirmed:', profile.role);
        
        // Admin login successful, redirect to admin page
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard",
        });
        
        // Use window.location for a complete page refresh
        console.log('Redirecting to admin dashboard...');
        window.location.href = '/admin';
      } else {
        console.error('Admin account creation failed:', result.message);
        toast({
          title: "Error",
          description: result.message || "Failed to create admin account",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in admin setup:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during admin account setup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSetupAdmin(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-20 md:pt-24">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h2>
              <p className="text-gray-500">Access the admin dashboard</p>
            </div>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                <div>
                  <p className="text-blue-700 font-medium mb-1">Admin Credentials</p>
                  <div className="bg-white/50 rounded p-2 text-sm mb-3 font-mono">
                    <p>Email: {ADMIN_TEST_EMAIL}</p>
                    <p>Password: {ADMIN_TEST_PASSWORD}</p>
                  </div>
                  {!adminExists && (
                    <Button 
                      onClick={createAdminAccount} 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-sm bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                      disabled={isLoading || setupAdmin}
                    >
                      {setupAdmin ? (
                        <>
                          <LoaderIcon className="mr-2 h-3 w-3 animate-spin" />
                          Setting up admin account...
                        </>
                      ) : "Setup Admin Account"}
                    </Button>
                  )}
                  {adminExists && (
                    <p className="text-sm text-green-600 mb-2">
                      Admin account is ready. Login with the credentials above.
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-navy-800 hover:bg-navy-900 text-white rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : 'Login as Admin'}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminAuth; 