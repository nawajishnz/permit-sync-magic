
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Key, LogOut, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AccountSettings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      setEmail(user.email || '');
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFullName(data?.full_name || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error fetching profile",
        description: "There was a problem loading your profile data.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "There was a problem updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      if (newPassword !== confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "New password and confirmation don't match.",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message || "There was a problem updating your password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "There was a problem signing out.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4">You need to be logged in to access this page.</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center mb-8">
            <Avatar className="h-16 w-16 mr-4">
              <AvatarImage src={profile?.avatar_url} alt={fullName} />
              <AvatarFallback>{fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-navy">{fullName || 'Account Settings'}</h1>
              <p className="text-gray-500">{email}</p>
            </div>
          </div>
          
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center">
                <Key className="mr-2 h-4 w-4" /> Security
              </TabsTrigger>
              <TabsTrigger value="session" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" /> Session
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account information and how others see you on the site
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdateProfile}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full-name">Full Name</Label>
                      <Input
                        id="full-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-sm text-gray-500">
                        Your email cannot be changed
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="bg-teal hover:bg-teal-600"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Update your password to ensure your account remains secure
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleChangePassword}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="bg-teal hover:bg-teal-600"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="session">
              <Card>
                <CardHeader>
                  <CardTitle>Session Management</CardTitle>
                  <CardDescription>
                    Manage your current session and sign out from all devices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-md bg-gray-50">
                    <h3 className="font-medium mb-2">Current Session</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      You are currently signed in on this device.
                    </p>
                    <Button 
                      variant="destructive" 
                      className="flex items-center"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountSettings;
