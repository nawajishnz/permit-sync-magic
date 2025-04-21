import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, Clock, CheckCircle, AlertCircle, User, FileCheck, 
  Search, Filter, Download, Bell, Calendar, ChevronRight,
  Edit, Upload, ArrowUpRight, TrendingUp, RefreshCw, XCircle,
  BarChart, CircleDashed, CheckSquare, BellRing, Menu, MapPin,
  Settings, LogOut, Info
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ApplicationForm from '@/components/visa-application/ApplicationForm';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="h-3 w-3 mr-1" /> },
    'In Progress': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <CircleDashed className="h-3 w-3 mr-1" /> },
    'Document Review': { bg: 'bg-purple-100', text: 'text-purple-800', icon: <FileText className="h-3 w-3 mr-1" /> },
    'Additional Documents Required': { bg: 'bg-orange-100', text: 'text-orange-800', icon: <AlertCircle className="h-3 w-3 mr-1" /> },
    'Approved': { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
    'Rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="h-3 w-3 mr-1" /> },
    'Ready for Interview': { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: <User className="h-3 w-3 mr-1" /> }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Pending'];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      {status}
    </span>
  );
};

// Application progress component
const ApplicationProgress = ({ steps, currentStep }: { steps: string[], currentStep: number }) => {
  const percentage = Math.round((currentStep / (steps.length - 1)) * 100);
  
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Progress</span>
        <span>{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="mt-2 flex justify-between">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`flex flex-col items-center w-20 ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div className={`w-4 h-4 rounded-full mb-1 ${index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <span className="text-xs text-center line-clamp-2">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form fields state
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.user_metadata?.phone || '');
  const [country, setCountry] = useState(user?.user_metadata?.country || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(
    user?.user_metadata?.preferences?.emailNotifications !== false
  );
  const [smsNotifications, setSmsNotifications] = useState(
    !!user?.user_metadata?.preferences?.smsNotifications
  );
  const [reminderNotifications, setReminderNotifications] = useState(
    user?.user_metadata?.preferences?.reminderNotifications !== false
  );
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [preferencesSuccess, setPreferencesSuccess] = useState(false);
  
  // Account actions state
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // New state for showing the post-order confirmation message
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState<any>(null);

  // State to control which application form to show (if any)
  const [editingApplicationId, setEditingApplicationId] = useState<string | null>(null);
  const [editingApplicationData, setEditingApplicationData] = useState<any>(null);
  
  // Update mock data to include dummy IDs 
  const applications = [
    {
      id: 'APP12345',
      country: 'United States',
      country_id: 'us_dummy_id', // Added dummy ID
      package_id: 'pkg_us_b2', // Added dummy ID
      visaType: 'Tourist Visa (B-2)',
      submittedDate: '2025-02-15',
      status: 'In Progress',
      nextStep: 'Document Review',
      progress: 2,
      progressSteps: ['Submitted', 'Processing', 'Doc Review', 'Decision', 'Visa Issued'],
      documents: [
        { name: 'Passport', uploaded: true, verified: true, date: '2025-01-15' },
        { name: 'Photo', uploaded: true, verified: true, date: '2025-01-15' },
        { name: 'Bank Statement', uploaded: true, verified: false, date: '2025-01-20' },
        { name: 'Accommodation Proof', uploaded: false, verified: false, required: true },
        { name: 'Travel Insurance', uploaded: false, verified: false, required: true }
      ],
      timeline: [
        { date: '2025-02-15', event: 'Application Submitted', description: 'Your application has been received.' },
        { date: '2025-02-17', event: 'Processing Started', description: 'Your application is now being processed.' },
        { date: '2025-02-20', event: 'Document Review', description: 'Your documents are being reviewed.' }
      ]
    },
    {
      id: 'APP12346',
      country: 'Canada',
      country_id: 'ca_dummy_id', // Added dummy ID
      package_id: 'pkg_ca_study', // Added dummy ID
      visaType: 'Student Visa',
      submittedDate: '2025-01-20',
      status: 'Additional Documents Required',
      nextStep: 'Upload Additional Documents',
      progress: 1,
      progressSteps: ['Submitted', 'Processing', 'Doc Review', 'Interview', 'Decision', 'Visa Issued'],
      documents: [
        { name: 'Passport', uploaded: true, verified: true, date: '2025-01-10' },
        { name: 'Photo', uploaded: true, verified: true, date: '2025-01-10' },
        { name: 'Acceptance Letter', uploaded: true, verified: true, date: '2025-01-12' },
        { name: 'Financial Proof', uploaded: false, verified: false, required: true },
        { name: 'Academic Transcripts', uploaded: false, verified: false, required: true }
      ],
      timeline: [
        { date: '2025-01-20', event: 'Application Submitted', description: 'Your application has been received.' },
        { date: '2025-01-25', event: 'Processing Started', description: 'Your application is now being processed.' },
        { date: '2025-02-05', event: 'Additional Documents Requested', description: 'Please upload the required financial documents.' }
      ]
    },
    {
      id: 'APP12347',
      country: 'United Kingdom',
      country_id: 'uk_dummy_id', // Added dummy ID
      package_id: 'pkg_uk_work', // Added dummy ID
      visaType: 'Work Visa (Skilled Worker)',
      submittedDate: '2024-12-10',
      status: 'Ready for Interview',
      nextStep: 'Attend Interview',
      progress: 3,
      progressSteps: ['Submitted', 'Processing', 'Doc Review', 'Interview', 'Decision', 'Visa Issued'],
      documents: [
        { name: 'Passport', uploaded: true, verified: true, date: '2024-12-01' },
        { name: 'Photo', uploaded: true, verified: true, date: '2024-12-01' },
        { name: 'Job Offer Letter', uploaded: true, verified: true, date: '2024-12-05' },
        { name: 'Qualifications', uploaded: true, verified: true, date: '2024-12-05' },
        { name: 'Language Test', uploaded: true, verified: true, date: '2024-12-07' }
      ],
      timeline: [
        { date: '2024-12-10', event: 'Application Submitted', description: 'Your application has been received.' },
        { date: '2024-12-15', event: 'Processing Started', description: 'Your application is now being processed.' },
        { date: '2024-12-25', event: 'Documents Approved', description: 'All your documents have been verified.' },
        { date: '2025-01-05', event: 'Interview Scheduled', description: 'Your interview has been scheduled for February 10, 2025.' }
      ]
    }
  ];
  
  const upcomingAppointments = [
    {
      id: 'APT5678',
      type: 'Visa Interview',
      date: '2025-04-10',
      time: '10:30 AM',
      location: 'US Embassy, London',
      application: 'APP12345',
      instructions: 'Bring original documents and arrive 30 minutes early',
      confirmationCode: 'INT-USEM-78965'
    },
    {
      id: 'APT5679',
      type: 'Biometrics Collection',
      date: '2025-03-15',
      time: '2:00 PM',
      location: 'VFS Global Center, New York',
      application: 'APP12346',
      instructions: 'No jewelry or glasses allowed during biometric capture',
      confirmationCode: 'BIO-VFS-45621'
    }
  ];
  
  // Mock notifications
  const mockNotifications = [
    { id: 1, title: 'Document Verification', message: 'Your passport has been verified successfully', date: '2025-02-18', read: false, type: 'success' },
    { id: 2, title: 'Action Required', message: 'Please upload the requested additional documents for your Canada visa application', date: '2025-02-15', read: false, type: 'warning' },
    { id: 3, title: 'Interview Scheduled', message: 'Your visa interview has been scheduled for April 10, 2025', date: '2025-02-10', read: true, type: 'info' },
    { id: 4, title: 'Application Update', message: 'Your application status has changed to In Progress', date: '2025-02-05', read: true, type: 'info' }
  ];
  
  // Use state for applications, initializing with mock data
  const [userApplications, setUserApplications] = useState(applications);
  
  useEffect(() => {
    // Existing effect for notifications
    setNotifications(mockNotifications);
  }, []);

  // Handle URL parameters and location state
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'applications', 'documents', 'appointments', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    if (location.state?.orderPlaced) {
      setShowOrderConfirmation(true);
      setConfirmationDetails({
        applicationId: location.state.applicationId,
        countryName: location.state.countryName,
        visaType: location.state.visaType
      });
      
      if (!userApplications.some(app => app.id === location.state.applicationId)) {
         const newAppPlaceholder = {
             id: location.state.applicationId,
             country_id: location.state.countryId, 
             package_id: location.state.packageId,
             country: location.state.countryName, 
             visaType: location.state.visaType, 
             submittedDate: new Date().toISOString().slice(0, 10),
             status: 'Pending Details', 
             nextStep: 'Complete Personal Information',
             progress: 0, 
             progressSteps: ['Initiated', 'Personal', 'Travel', 'Passport', 'Docs', 'Review', 'Payment'], 
             documents: [],
             timeline: [
               { date: new Date().toISOString().slice(0, 10), event: 'Application Initiated', description: 'Initial details submitted.' }
             ],
             initialData: {
                firstName: location.state.firstName,
                lastName: location.state.lastName,
                email: location.state.email,
                purposeOfTravel: location.state.purposeOfTravel,
                departureDate: location.state.departureDate,
                returnDate: location.state.returnDate
             }
         };
         setUserApplications(prev => [newAppPlaceholder, ...prev]); 
      }
      
      setActiveTab('applications');
      navigate(location.pathname, { replace: true, state: {} });
    }
    
  }, [location, navigate, userApplications]);

  // Filter applications based on state
  const filteredApplications = userApplications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.visaType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Calculate overall progress based on state
  const getOverallProgress = () => {
    const total = userApplications.length;
    if (total === 0) return 0;
    
    const completedSteps = userApplications.reduce((sum, app) => sum + app.progress, 0);
    const totalSteps = userApplications.reduce((sum, app) => sum + app.progressSteps.length - 1, 0);
    
    return Math.round((completedSteps / totalSteps) * 100);
  };
  
  // Function to mark a notification as read
  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Function for handling sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation happens in the Auth context
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Function to get user initials for the avatar
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U';
  };

  // Add save profile function
  const saveProfileChanges = async () => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      
      console.log('Saving profile changes:', { fullName, phoneNumber, country });
      
      // Update the user metadata in Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone: phoneNumber,
          country: country,
        }
      });
      
      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      
      // Show success message
      setSaveSuccess(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error saving profile changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Add password update function
  const updatePassword = async () => {
    try {
      // Reset states
      setPasswordError('');
      setPasswordSuccess(false);
      
      // Validation
      if (!currentPassword) {
        setPasswordError('Current password is required');
        return;
      }
      
      if (!newPassword) {
        setPasswordError('New password is required');
        return;
      }
      
      if (newPassword.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
      
      setIsChangingPassword(true);
      
      // Update password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('Error updating password:', error);
        setPasswordError(error.message || 'Failed to update password');
        return;
      }
      
      // Success
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      console.error('Error changing password:', error);
      setPasswordError(error.message || 'An unexpected error occurred');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Add save notification preferences function
  const saveNotificationPreferences = async () => {
    try {
      setIsSavingPreferences(true);
      setPreferencesSuccess(false);
      
      console.log('Saving notification preferences:', {
        emailNotifications,
        smsNotifications,
        reminderNotifications
      });
      
      // Get current user metadata to avoid overwriting other values
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const currentMetadata = currentUser?.user_metadata || {};
      
      // Update the user metadata in Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          preferences: {
            ...currentMetadata.preferences,
            emailNotifications,
            smsNotifications,
            reminderNotifications
          }
        }
      });
      
      if (error) {
        console.error('Error updating notification preferences:', error);
        throw error;
      }
      
      // Show success message
      setPreferencesSuccess(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setPreferencesSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    } finally {
      setIsSavingPreferences(false);
    }
  };

  // Add delete account function
  const deleteAccount = async () => {
    try {
      setIsDeleting(true);
      
      console.log('Deleting account...');
      
      // Delete user in Supabase
      const { error } = await supabase.auth.admin.deleteUser(user?.id || '');
      
      if (error) {
        console.error('Error deleting account:', error);
        // If admin API fails, try regular signOut 
        await signOut();
        throw error;
      }
      
      // Sign out and redirect to home page
      await signOut();
      navigate('/');
      
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };
  
  // Add download user data function
  const downloadUserData = async () => {
    try {
      setIsGeneratingData(true);
      
      console.log('Generating user data download...');
      
      // Get current user data in a simpler format
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Get basic profile data without complex types
      const userData = {
        profile: {
          id: currentUser?.id,
          email: currentUser?.email,
          created_at: currentUser?.created_at,
          last_sign_in: currentUser?.last_sign_in_at,
          metadata: currentUser?.user_metadata,
        }
      };
      
      // Create downloadable file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `permitsy-user-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error downloading user data:', error);
    } finally {
      setIsGeneratingData(false);
    }
  };

  const handleStartCompletingApplication = (app: any) => {
    setEditingApplicationId(app.id);
    const initialDataForForm = app.initialData || {};
    setEditingApplicationData(initialDataForForm);
    setActiveTab('applications');
  };
  
  const handleCloseEditingForm = () => {
      setEditingApplicationId(null);
      setEditingApplicationData(null);
  };

  // Calculate stats for overview
  const totalApplications = userApplications.length;
  const activeApplications = userApplications.filter(app => !['Approved', 'Rejected'].includes(app.status)).length;
  const pendingActions = userApplications.filter(app => app.status === 'Additional Documents Required').length + upcomingAppointments.length;

  // Add back the handleTabChange function
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL query parameter for bookmarking/linking
    navigate(`/dashboard?tab=${value}`, { replace: true, state: {} }); // Clear state on tab change too
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-grow pt-16 md:pt-20 py-8">
        <div className="container max-w-7xl mx-auto px-4">
          {/* Show confirmation message if order was just placed */} 
          {showOrderConfirmation && confirmationDetails && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <Info className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Application Initiated Successfully!</AlertTitle>
              <AlertDescription className="text-green-700">
                Your application ({confirmationDetails.applicationId}) for the {confirmationDetails.visaType} to {confirmationDetails.countryName} has been started. 
                Please complete the remaining details below.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar / Tabs Navigation */}
            <aside className="w-full md:w-64">
               {/* ... User Avatar and Dropdown ... */}
              <nav className="mt-6">
                {/* Pass handleTabChange to Tabs component */}
                <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} orientation="vertical" className="w-full">
                  <TabsList className="flex flex-col items-start w-full h-auto p-0 bg-transparent">
                     {/* ... TabsTriggers for Overview, Applications, etc. ... */}
            </TabsList>
                </Tabs>
              </nav>
            </aside>

            {/* Main Content Area */}
            <section className="flex-1">
              <Tabs value={activeTab} className="w-full">
                
                 {/* Overview Tab Content */}
                <TabsContent value="overview">
                  <Card className="mb-6">
                <CardHeader>
                      <CardTitle>Dashboard Overview</CardTitle>
                      <CardDescription>Welcome back, {user?.user_metadata?.full_name || user?.email}!</CardDescription>
                </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* ... Stat Cards (Total Applications, Active, Pending Actions) ... */}
                </CardContent>
              </Card>
                </TabsContent>

                {/* Applications Tab Content */}
                <TabsContent value="applications">
                   {editingApplicationId ? (
                       <Card className="mb-6 border-blue-300 bg-blue-50">
                         <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                              <CardTitle className="text-blue-800">Complete Your Application ({editingApplicationId})</CardTitle>
                              <CardDescription className="text-blue-700">
                                 Fill in the remaining details for your {editingApplicationData?.countryName || 'visa'}.
                              </CardDescription>
                            </div>
                           <Button variant="ghost" size="sm" onClick={handleCloseEditingForm} className="text-blue-600 hover:bg-blue-100">
                              <XCircle className="h-5 w-5"/>
                    </Button>
                  </CardHeader>
                  <CardContent>
                           {(() => {
                              const appData = userApplications.find(a => a.id === editingApplicationId);
                              if (!appData) return <p>Error: Could not find application data.</p>; 
                              
                              return (
                                 <ApplicationForm
                                    countryId={appData.country_id}
                                    packageId={appData.package_id}
                                    countryName={appData.country} 
                                    visaType={appData.visaType} 
                                    processingTime="N/A" 
                                    isServiceOrder={false} 
                                    initialData={editingApplicationData} 
                                 />
                               );
                           })()}
                  </CardContent>
                </Card>
                   ) : (
              <Card>
                <CardHeader>
                           {/* ... Search and Filter ... */}
                </CardHeader>
                <CardContent>
                  {filteredApplications.length > 0 ? (
                    <div className="overflow-x-auto">
                        <tbody>
                          {filteredApplications.map((app) => (
                            <tr key={app.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <StatusBadge status={app.status} />
                              </td>
                              <td className="py-3 px-4">
                                          {app.status === 'Pending Details' ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                                onClick={() => handleStartCompletingApplication(app)}
                                  >
                                                Complete Details
                                  </Button>
                                          ) : (
                                              <Button variant="outline" size="sm">View Details</Button>
                                          )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                                 <p>No applications found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
                   )}
                </TabsContent>
                
                {/* Documents Tab Content */}
                <TabsContent value="documents">
                  {/* ... Document Management Section ... */}
            </TabsContent>
            
                {/* Appointments Tab Content */}
                <TabsContent value="appointments">
                  {/* ... Appointments List/Calendar ... */}
            </TabsContent>
            
                {/* Settings Tab Content */}
                <TabsContent value="settings">
                    <div className="space-y-6">
                    {/* Profile Settings Card */}
                     {/* ... Profile form ... */}
                    {/* Password Change Card */}
                     {/* ... Password change form ... */}
                    {/* Notification Preferences Card */}
                     {/* ... Notification preferences form ... */}
                     {/* Account Actions Card */}
                     {/* ... Delete account, Download data buttons ... */}                  
                          </div>
            </TabsContent>
              </Tabs>
            </section>
                      </div>
                      </div>
      </main>
      <Footer />
      
      {/* ... Alert Dialog for Delete Account ... */}
      
    </div>
  );
};

export default Dashboard;
