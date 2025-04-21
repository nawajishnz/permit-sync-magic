import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';
import { LoaderIcon, EyeOff, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

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
  const { signIn, signUp, user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  // Redirect if already logged in - only once authLoading is complete
  useEffect(() => {
    if (!authLoading && user && userRole) {
      console.log('Auth page - User already logged in as:', userRole);
      
      // Use a small delay to ensure state is fully updated before navigation
      const redirectTimer = setTimeout(() => {
        if (userRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [user, userRole, authLoading, navigate]);

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
      
      console.log('Auth component: Attempting to sign in with:', email);
      
      // Call the signIn method from AuthContext
      // The navigation is handled in AuthContext
      await signIn(email, password);
      
      console.log('Auth component: Sign-in handled by AuthContext');
    } catch (error: any) {
      console.error('Auth component: Sign in error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('Invalid login credentials')) {
        toast({
          title: "Authentication Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign-in Error",
          description: error.message || "An error occurred while signing in. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Form validation
      if (!email.trim() || !password.trim() || !fullName.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Password validation
      if (password.length < 6) {
        toast({
          title: "Password Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast({
          title: "Email Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      console.log('Auth component: Attempting to sign up with:', email);
      await signUp(email, password, fullName);
      
      // Show success message
      toast({
        title: "Account Created",
        description: "Your account has been created successfully. Please sign in.",
      });
      
      // Switch to login view
      setIsSignUp(false);
      
      // Clear form fields
      setPassword('');
    } catch (error: any) {
      console.error('Auth component: Sign up error:', error);
      toast({
        title: "Sign-up Error",
        description: error.message || "An error occurred while creating your account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If auth is still loading, show a minimal loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <LoaderIcon className="w-10 h-10 text-orange-500 animate-spin" />
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

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
                        onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        aria-label="Previous testimonial"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
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
                    ) : 'Create Account'}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <p className="text-gray-600 text-sm">
                      Already have an account?{' '}
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setIsSignUp(false)}
                        className="text-sm"
                      >
                        Sign in
                      </Button>
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
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setIsSignUp(true)}
                        className="text-sm"
                      >
                        Sign up
                      </Button>
                    </p>
                  </div>
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
    </div>
  );
};

export default Auth;
