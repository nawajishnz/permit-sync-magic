
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

const Auth = () => {
  const { signIn, signUp, user, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Check if the user is accessing admin login from URL param
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('admin') === 'true') {
      setIsAdminMode(true);
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
        return;
      }
      
      await signUp(email, password, fullName);
    } finally {
      setIsLoading(false);
    }
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
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    
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
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-teal hover:bg-teal-600"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
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
    </div>
  );
};

export default Auth;
