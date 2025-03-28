
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, LoaderIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

// Admin test account credentials
const ADMIN_TEST_EMAIL = "admin@permitsy.com";
const ADMIN_TEST_PASSWORD = "admin123";

const Auth = () => {
  const { signIn, signUp, user, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showSampleCreds, setShowSampleCreds] = useState(false);
  const [showLoginHelp, setShowLoginHelp] = useState(false);
  const [setupAdmin, setSetupAdmin] = useState(false);
  
  // Check if the user is accessing admin login from URL param
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('admin') === 'true') {
      setIsAdminMode(true);
      // Show sample credentials for admin demo
      setShowSampleCreds(true);
    }
  }, [location]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log('Auth page - User role:', userRole);
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, userRole, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!email.trim() || !password.trim()) {
        toast({
          title: "Error",
          description: "Please enter both email and password",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      await signIn(email, password);
      
      // Note: Navigation will be handled in the AuthContext based on user role
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!email.trim() || !password.trim() || !fullName.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      await signUp(email, password, fullName);
    } finally {
      setIsLoading(false);
    }
  };

  const setAdminCredentials = () => {
    setEmail(ADMIN_TEST_EMAIL);
    setPassword(ADMIN_TEST_PASSWORD);
  };

  const createAdminAccount = async () => {
    setIsLoading(true);
    setSetupAdmin(true);
    
    try {
      // Check if admin account already exists
      const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email: ADMIN_TEST_EMAIL,
        password: ADMIN_TEST_PASSWORD
      });
      
      if (existingUser.user) {
        // Admin already exists, update role if needed
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', existingUser.user.id)
          .single();
          
        if (profileError || profileData.role !== 'admin') {
          // Update the role to admin
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', existingUser.user.id);
            
          if (updateError) {
            console.error('Error updating admin role:', updateError);
            throw new Error('Failed to set admin role');
          }
        }
        
        toast({
          title: "Success",
          description: "Admin account already exists and is ready to use",
        });
        
        setEmail(ADMIN_TEST_EMAIL);
        setPassword(ADMIN_TEST_PASSWORD);
        return;
      }
      
      if (checkError && !checkError.message.includes('Invalid login credentials')) {
        throw new Error(checkError.message);
      }
      
      // Create new admin account
      const { data: newUser, error: signUpError } = await supabase.auth.signUp({
        email: ADMIN_TEST_EMAIL,
        password: ADMIN_TEST_PASSWORD,
        options: {
          data: {
            full_name: "Admin User",
          }
        }
      });
      
      if (signUpError) {
        throw new Error(signUpError.message);
      }
      
      if (newUser.user) {
        // Set the user role to admin
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', newUser.user.id);
          
        if (updateError) {
          console.error('Error setting admin role:', updateError);
          throw new Error('Failed to set admin role');
        }
        
        toast({
          title: "Success",
          description: "Admin account created successfully",
        });
        
        setEmail(ADMIN_TEST_EMAIL);
        setPassword(ADMIN_TEST_PASSWORD);
      }
    } catch (error: any) {
      console.error('Error creating admin account:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create admin account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSetupAdmin(false);
    }
  };

  const openLoginHelp = () => {
    setShowLoginHelp(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              {isAdminMode ? (
                <>
                  <div className="flex items-center justify-center mb-2">
                    <Badge variant="outline" className="bg-navy text-white">Admin Access</Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold text-center text-navy">Administrator Login</CardTitle>
                  <CardDescription className="text-center">
                    Sign in to access the admin dashboard
                  </CardDescription>
                </>
              ) : (
                <>
                  <CardTitle className="text-2xl font-bold text-center text-navy">Welcome to Permitsy</CardTitle>
                  <CardDescription className="text-center">
                    Sign in or create an account to manage your visa applications
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              {showSampleCreds && (
                <Alert className="mb-4 bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    <p className="mb-2">Demo admin credentials:</p>
                    <p className="font-mono text-xs bg-blue-100 p-1 rounded mb-1">Email: {ADMIN_TEST_EMAIL}</p>
                    <p className="font-mono text-xs bg-blue-100 p-1 rounded mb-2">Password: {ADMIN_TEST_PASSWORD}</p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <Button 
                        onClick={setAdminCredentials} 
                        variant="outline" 
                        size="sm" 
                        className="text-xs bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
                      >
                        Use admin credentials
                      </Button>
                      <Button 
                        onClick={createAdminAccount} 
                        variant="outline" 
                        size="sm" 
                        className="text-xs bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                        disabled={isLoading || setupAdmin}
                      >
                        {setupAdmin ? (
                          <>
                            <LoaderIcon className="mr-2 h-3 w-3 animate-spin" />
                            Setting up...
                          </>
                        ) : "Setup admin account"}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              <Tabs defaultValue={isAdminMode ? "signin" : "signin"}>
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  {!isAdminMode && <TabsTrigger value="signup">Sign Up</TabsTrigger>}
                  {isAdminMode && <TabsTrigger value="signup" disabled>Sign Up</TabsTrigger>}
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className={`w-full ${isAdminMode ? 'bg-navy hover:bg-navy-600' : 'bg-teal hover:bg-teal-600'}`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : 'Sign In'}
                    </Button>
                    
                    <div className="text-center">
                      <Button 
                        type="button" 
                        variant="link" 
                        className="text-sm text-gray-500" 
                        onClick={openLoginHelp}
                      >
                        Having trouble signing in?
                      </Button>
                    </div>
                    
                    {isAdminMode && (
                      <div className="text-center mt-4">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => setIsAdminMode(false)}
                          className="text-sm"
                        >
                          Switch to User Login
                        </Button>
                      </div>
                    )}
                    
                    {!isAdminMode && (
                      <div className="text-center mt-4">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => setIsAdminMode(true)}
                          className="text-sm"
                        >
                          Admin Login
                        </Button>
                      </div>
                    )}
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-teal hover:bg-teal-600"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-gray-500">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />

      <Dialog open={showLoginHelp} onOpenChange={setShowLoginHelp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Help</DialogTitle>
            <DialogDescription>
              If you're having trouble logging in:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <p className="text-sm">• Check that you're using the correct email and password</p>
            <p className="text-sm">• Make sure caps lock is off</p>
            <p className="text-sm">• For admin access, ensure your account has admin privileges</p>
            <p className="text-sm">• If you've forgotten your password, contact support</p>
            
            <div className="bg-blue-50 p-3 rounded-md mt-3 border border-blue-100">
              <p className="text-sm font-medium text-blue-800">Admin Demo Account:</p>
              <p className="text-xs mt-1">Email: {ADMIN_TEST_EMAIL}</p>
              <p className="text-xs">Password: {ADMIN_TEST_PASSWORD}</p>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Button 
                  onClick={() => {
                    setAdminCredentials();
                    setShowLoginHelp(false);
                  }}
                  size="sm"
                  variant="outline"
                  className="text-xs bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
                >
                  Use Admin Credentials
                </Button>
                <Button 
                  onClick={() => {
                    createAdminAccount();
                    setShowLoginHelp(false);
                  }}
                  size="sm"
                  variant="outline"
                  className="text-xs bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                  disabled={isLoading || setupAdmin}
                >
                  {setupAdmin ? "Setting up..." : "Setup Admin Account"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
