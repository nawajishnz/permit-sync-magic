import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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

// Define testimonials
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Business Traveler",
    content: "Permitsy made my visa application process so easy! I was able to get my business visa in half the time it normally takes.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 2,
    name: "David Chen",
    role: "Student",
    content: "As an international student, I was worried about my visa application. Permitsy guided me through every step and I got approved quickly!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 3,
    name: "Maria Garcia",
    role: "Tourist",
    content: "I've used Permitsy for three different countries now. The process is always smooth and the customer service is excellent.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
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

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };
  
  const nextTestimonial = () => {
    setActiveTestimonial((prev) => 
      (prev + 1) % testimonials.length
    );
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
                      <Button 
                        type="button"
                        onClick={() => setIsSignUp(false)}
                        variant="link" 
                        className="text-sm p-0 h-auto text-indigo-600 hover:text-indigo-800"
                      >
                        Sign In
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
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <Button 
                        type="button"
                        variant="link"
                        className="text-xs text-indigo-600 hover:text-indigo-800 h-auto p-0" 
                        onClick={() => {
                          toast({
                            title: "Password Reset",
                            description: "Please contact support to reset your password.",
                          });
                        }}
                      >
                        Forgot password?
                      </Button>
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
                        id="remember-me" 
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <label htmlFor="remember-me" className="text-sm text-gray-600">Remember me</label>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : 'Sign In'}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <p className="text-gray-600 text-sm">
                      Don't have an account?{' '}
                      <Button 
                        type="button"
                        onClick={() => setIsSignUp(true)}
                        variant="link" 
                        className="text-sm p-0 h-auto text-indigo-600 hover:text-indigo-800"
                      >
                        Sign Up
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
