import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, MessageCircle, Eye, CheckCircle, XCircle, Clock, AlertCircle, Upload, FileUp, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

// Component for uploading approved visa images
interface ApprovedVisaUploadProps {
  applicationId: string;
}

interface VisaImage {
  file: File;
  status: 'uploading' | 'success' | 'error';
}

const ApprovedVisaUpload: React.FC<ApprovedVisaUploadProps> = ({ applicationId }) => {
  const [visaImages, setVisaImages] = useState<VisaImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        status: 'uploading' as const
      }));
      
      setVisaImages([...visaImages, ...newFiles]);
      setIsUploading(true);
      setUploadSuccess(false);
      
      // Simulate upload - in a real app, you would upload to your backend
      setTimeout(() => {
        setVisaImages(prev => 
          prev.map(img => img.status === 'uploading' ? {...img, status: 'success' as const} : img)
        );
        setIsUploading(false);
        setUploadSuccess(true);
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setUploadSuccess(false);
        }, 3000);
        
        console.log(`Uploaded visa images for application ${applicationId}`);
      }, 1500);
    }
  };
  
  const removeImage = (index: number) => {
    const newImages = [...visaImages];
    newImages.splice(index, 1);
    setVisaImages(newImages);
  };

  return (
    <div className="mt-4">
      <div className="space-y-3">
        {visaImages.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {visaImages.map((img, index) => (
              <div key={index} className="relative group">
                <div className="bg-white rounded-md border border-gray-200 p-2 h-full">
                  <div className="flex items-center space-x-2">
                    <FileUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm truncate">{img.file.name}</span>
                    {img.status === 'uploading' && (
                      <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full ml-auto"></div>
                    )}
                    {img.status === 'success' && (
                      <CheckCircle className="h-3 w-3 text-green-500 ml-auto" />
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <input
          type="file"
          id="visa-images"
          className="hidden"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.pdf"
          multiple
        />
        <label 
          htmlFor="visa-images" 
          className={`border border-dashed rounded-md p-4 flex flex-col items-center justify-center w-full cursor-pointer transition-colors ${isUploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
        >
          {isUploading ? (
            <>
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mb-1"></div>
              <span className="text-sm text-blue-500">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6 text-gray-400 mb-1" />
              <span className="text-sm text-gray-500">Upload visa image</span>
            </>
          )}
        </label>
        
        {uploadSuccess && (
          <div className="bg-green-50 text-green-700 text-xs flex items-center p-2 rounded">
            <CheckCircle className="h-3 w-3 mr-1" />
            Upload successful
          </div>
        )}
      </div>
    </div>
  );
};

const ApplicationsManager = () => {
  // Mock data - in a real app, this would come from API/database
  const initialApplications = [
    {
      id: 'APP12345',
      user: {
        id: 'USER1001',
        name: 'John Smith',
        email: 'john.smith@example.com'
      },
      country: 'United States',
      visaType: 'Tourist Visa (B-2)',
      submittedDate: '2025-02-15',
      status: 'In Progress',
      nextStep: 'Document Review'
    },
    {
      id: 'APP12346',
      user: {
        id: 'USER1002',
        name: 'Emma Johnson',
        email: 'emma.johnson@example.com'
      },
      country: 'Canada',
      visaType: 'Student Visa',
      submittedDate: '2025-01-20',
      status: 'Additional Documents Required',
      nextStep: 'Upload Additional Documents'
    },
    {
      id: 'APP12347',
      user: {
        id: 'USER1003',
        name: 'Michael Brown',
        email: 'michael.brown@example.com'
      },
      country: 'United Kingdom',
      visaType: 'Work Visa',
      submittedDate: '2025-02-01',
      status: 'Pending Approval',
      nextStep: 'Embassy Review'
    },
    {
      id: 'APP12348',
      user: {
        id: 'USER1004',
        name: 'Sophia Garcia',
        email: 'sophia.garcia@example.com'
      },
      country: 'Australia',
      visaType: 'Tourist Visa',
      submittedDate: '2025-02-10',
      status: 'Approved',
      nextStep: 'Visa Issued'
    },
    {
      id: 'APP12349',
      user: {
        id: 'USER1005',
        name: 'David Wilson',
        email: 'david.wilson@example.com'
      },
      country: 'Japan',
      visaType: 'Business Visa',
      submittedDate: '2025-01-15',
      status: 'Rejected',
      nextStep: 'Contact Support'
    }
  ];

  const [applications, setApplications] = useState(initialApplications);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<null | typeof initialApplications[0]>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newNextStep, setNewNextStep] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  
  // Filter applications based on search term and status filter
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.visaType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewApplication = (app: typeof initialApplications[0]) => {
    setSelectedApplication(app);
    setNewStatus(app.status);
    setNewNextStep(app.nextStep);
  };

  const handleUpdateApplication = () => {
    if (!selectedApplication) return;
    
    setApplications(applications.map(app => {
      if (app.id === selectedApplication.id) {
        return {
          ...app,
          status: newStatus,
          nextStep: newNextStep
        };
      }
      return app;
    }));
    
    setSelectedApplication(null);
  };

  const handleSendMessage = () => {
    if (!selectedApplication || !messageText) return;
    
    // In a real app, this would send a message to the user via API
    console.log(`Message to ${selectedApplication.user.name} (${selectedApplication.user.email}):`, messageText);
    
    // Reset form
    setMessageText('');
    setIsMessageDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress':
        return (
          <div className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {status}
          </div>
        );
      case 'Additional Documents Required':
        return (
          <div className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            {status}
          </div>
        );
      case 'Pending Approval':
        return (
          <div className="flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {status}
          </div>
        );
      case 'Approved':
        return (
          <div className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            {status}
          </div>
        );
      case 'Rejected':
        return (
          <div className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
            <XCircle className="h-3 w-3 mr-1" />
            {status}
          </div>
        );
      default:
        return (
          <div className="flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
            {status}
          </div>
        );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Applications Manager</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input 
                placeholder="Search applications..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Additional Documents Required">Additional Documents Required</SelectItem>
                  <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visa Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Country</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Visa Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Submitted</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{app.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{app.user.name}</div>
                        <div className="text-sm text-gray-500">{app.user.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{app.country}</td>
                    <td className="py-3 px-4">{app.visaType}</td>
                    <td className="py-3 px-4">{app.submittedDate}</td>
                    <td className="py-3 px-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center"
                          onClick={() => handleViewApplication(app)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        
                        <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center"
                              onClick={() => {
                                setSelectedApplication(app);
                              }}
                            >
                              <MessageCircle className="h-4 w-4 mr-1" /> Message
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Send Message to {selectedApplication?.user.name}</DialogTitle>
                              <DialogDescription>
                                This message will be sent to the user's email ({selectedApplication?.user.email}).
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Label htmlFor="message">Message</Label>
                              <Textarea
                                id="message"
                                placeholder="Enter your message here..."
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                rows={5}
                                className="mt-2"
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>Cancel</Button>
                              <Button onClick={handleSendMessage} disabled={!messageText}>Send Message</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredApplications.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No applications found matching your search criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Application Details - {selectedApplication.id}</DialogTitle>
              <DialogDescription>
                View and update the application details below.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label className="text-sm text-gray-500">User</Label>
                  <p className="font-medium">{selectedApplication.user.name}</p>
                  <p className="text-sm text-gray-500">{selectedApplication.user.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Submission Date</Label>
                  <p className="font-medium">{selectedApplication.submittedDate}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Country</Label>
                  <p className="font-medium">{selectedApplication.country}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Visa Type</Label>
                  <p className="font-medium">{selectedApplication.visaType}</p>
                </div>
              </div>
              
              <div className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger id="status" className="mt-2">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Additional Documents Required">Additional Documents Required</SelectItem>
                      <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="nextStep">Next Step</Label>
                  <Input
                    id="nextStep"
                    value={newNextStep}
                    onChange={(e) => setNewNextStep(e.target.value)}
                    className="mt-2"
                  />
                </div>
                
                {/* Show visa image upload section only when status is Approved */}
                {newStatus === 'Approved' && (
                  <>
                    <div className="my-4 border-t border-gray-200"></div>
                    <ApprovedVisaUpload applicationId={selectedApplication.id} />
                  </>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedApplication(null)}>Cancel</Button>
              <Button onClick={handleUpdateApplication}>Update Application</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ApplicationsManager;
