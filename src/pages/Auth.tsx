import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, LoaderIcon, EyeOff, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

// Admin test account credentials
const ADMIN_TEST_EMAIL = "admin@permitsy.com";
const ADMIN_TEST_PASSWORD = "admin123";

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: "Maria Chen",
    role: "Digital Nomad & Travel Blogger",
    image: "/lovable-uploads/d41f500d-3ae8-477d-89e8-4b8f6346774b.png",
    content: "Permitsy has revolutionized how I manage visas when traveling. The interface is intuitive, and their support team is always quick to respond. I can't imagine planning my travels without it."
  },
  {
    id: 2,
    name: "James Rodriguez",
    role: "International Business Consultant",
    image: "/lovable-uploads/c6f0f3d8-3504-4698-82f8-c54a489198c6.png", 
    content: "As someone who travels frequently for work, Permitsy has been a game-changer. The automated document checklist saves me hours of research for each country I visit."
  },
  {
    id: 3,
    name: "Sarah Thompson",
    role: "Study Abroad Program Director",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    content: "I manage visa applications for dozens of students each semester. Permitsy's tracking tools and notifications have eliminated the stress of managing multiple applications simultaneously."
  }
];

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
  const [adminSetupSuccess, setAdminSetupSuccess] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  // Testimonial auto scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
    if (user && userRole) {
      console.log('Auth page - User role:', userRole);
      if (userRole === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    }
  }, [user, userRole]);

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
      
      console.log('Attempting to sign in...');
      await signIn(email, password);
      
      // Note: Navigation will be handled in the AuthContext based on user role
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in. Please try again.",
        variant: "destructive",
      });
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
      setIsSignUp(false); // Switch back to login view after signup
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
      // First, try to create the admin user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: ADMIN_TEST_EMAIL,
        password: ADMIN_TEST_PASSWORD
      });

      if (signUpError && !signUpError.message.includes('User already registered')) {
        throw signUpError;
      }

      const userId = signUpData?.user?.id;

      if (userId) {
        // Create or update the profile with admin role
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: ADMIN_TEST_EMAIL,
            full_name: 'Admin User',
            role: 'admin',
            created_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('Error creating admin profile:', profileError);
          throw new Error('Failed to create admin profile');
        }

        toast({
          title: "Success",
          description: "Admin account has been created successfully",
        });

        setEmail(ADMIN_TEST_EMAIL);
        setPassword(ADMIN_TEST_PASSWORD);
        setAdminSetupSuccess(true);
      } else {
        // Try to sign in if user already exists
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: ADMIN_TEST_EMAIL,
          password: ADMIN_TEST_PASSWORD
        });

        if (signInError) {
          throw signInError;
        }

        if (signInData.user) {
          // Update existing user's profile to ensure admin role
          const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
              id: signInData.user.id,
              email: ADMIN_TEST_EMAIL,
              full_name: 'Admin User',
              role: 'admin',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            });

          if (updateError) {
            console.error('Error updating admin profile:', updateError);
            throw new Error('Failed to update admin profile');
          }

          toast({
            title: "Success",
            description: "Admin account is ready to use",
          });

          setEmail(ADMIN_TEST_EMAIL);
          setPassword(ADMIN_TEST_PASSWORD);
          setAdminSetupSuccess(true);
        }
      }
    } catch (error: any) {
      console.error('Error setting up admin account:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to set up admin account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openLoginHelp = () => {
    setShowLoginHelp(true);
  };

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-8 md:gap-0 px-4">
            {/* Left Side - Testimonial */}
            <div className="w-full md:w-1/2 max-w-md bg-gradient-to-br from-blue-900 to-navy-800 rounded-l-3xl overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=2070')] bg-cover bg-center opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30"></div>
              
              <div className="relative h-full flex flex-col justify-between p-8 text-white">
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-2">Welcome to Permitsy</h2>
                  <p className="text-gray-300">Your global visa management solution</p>
                </div>
                
                <div className="space-y-6">
                  <div className="relative overflow-hidden h-[300px]">
                    {testimonials.map((testimonial, index) => (
                      <div
                        key={testimonial.id}
                        className={cn(
                          "absolute w-full transition-all duration-500 ease-in-out",
                          index === activeTestimonial ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
                        )}
                      >
                        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white/30">
                              <img 
                                src={testimonial.image} 
                                alt={testimonial.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">{testimonial.name}</h3>
                              <p className="text-sm text-gray-300">{testimonial.role}</p>
                            </div>
                          </div>
                          <blockquote className="text-gray-100 italic">
                            "{testimonial.content}"
                          </blockquote>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {testimonials.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveTestimonial(index)}
                          className={cn(
                            "w-2.5 h-2.5 rounded-full",
                            index === activeTestimonial ? "bg-white" : "bg-white/30"
                          )}
                          aria-label={`Go to testimonial ${index + 1}`}
                        />
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={prevTestimonial}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        aria-label="Previous testimonial"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={nextTestimonial}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        aria-label="Next testimonial"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-sm text-gray-300">
                  <p>Trusted by thousands of travelers worldwide</p>
                </div>
              </div>
            </div>
            
            {/* Right Side - Authentication Form */}
            <div className="w-full md:w-1/2 max-w-md bg-white rounded-r-3xl p-8 shadow-sm">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {isSignUp ? "Create an account" : "Sign in to your account"}
                </h2>
                <p className="text-gray-500">
                  {isSignUp 
                    ? "Join Permitsy to manage your visa applications with ease" 
                    : "Greetings on your return! We kindly request you to enter your details."}
                </p>
              </div>
              
              {isAdminMode && showSampleCreds && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                    <div>
                      <p className="text-blue-700 font-medium mb-1">Admin Demo Credentials</p>
                      <p className="text-sm text-blue-600 mb-1.5">Use these credentials to access the admin dashboard:</p>
                      <div className="bg-white/50 rounded p-2 text-sm mb-3 font-mono">
                        <p>Email: {ADMIN_TEST_EMAIL}</p>
                        <p>Password: {ADMIN_TEST_PASSWORD}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
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
                          ) : adminSetupSuccess ? "Admin setup complete" : "Setup admin account"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Form Section */}
              {isSignUp ? (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <Input
                      id="fullname"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
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
                        placeholder="Enter your password"
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
                    <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : 'Sign Up'}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <p className="text-gray-600 text-sm">
                      Already have an account?{' '}
                      <Link to="/auth">
                        <Button size="sm" className="text-sm bg-black hover:bg-gray-800 text-white">
                          Sign In
                        </Button>
                      </Link>
                    </p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={openLoginHelp}
                        className="text-sm text-orange-500 hover:text-orange-600"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
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
                  
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember" 
                        checked={rememberMe} 
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                      />
                      <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                      >
                        Remember for 30 days
                      </label>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : 'Login'}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <p className="text-gray-600 text-sm">
                      Don't have an account?{' '}
                      <Link to="/auth">
                        <Button size="sm" className="text-sm bg-black hover:bg-gray-800 text-white">
                          Sign up
                        </Button>
                      </Link>
                    </p>
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
              )}
              
              <div className="mt-6 text-center text-xs text-gray-500">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </div>
            </div>
          </div>
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
