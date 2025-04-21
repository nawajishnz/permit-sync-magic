import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, Clock, CheckCircle, AlertCircle, User, FileCheck, 
  Search, Filter, Download, Bell, Calendar, ChevronRight,
  Edit, Upload, ArrowUpRight, TrendingUp, RefreshCw, XCircle,
  BarChart, CircleDashed, CheckSquare, BellRing, Menu, MapPin,
  Settings, LogOut, Info
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ApplicationTrackerProps {
  applicationId: string;
}

const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({ applicationId }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('overview');

  const { data: application, isLoading, isError } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visa_applications')
        .select(`
          *,
          countries (name, flag),
          visa_packages (name, government_fee, service_fee, processing_days)
        `)
        .eq('id', applicationId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  React.useEffect(() => {
    if (isError) {
      toast({
        title: "Error loading application",
        description: "Could not load application details. Please try again later.",
        variant: "destructive",
      });
    }
  }, [isError, toast]);

  // Mock data for demonstration
  const mockTimeline = [
    { date: '2023-05-10', event: 'Application Submitted', description: 'Your application has been received.' },
    { date: '2023-05-12', event: 'Processing Started', description: 'Your application is now being processed.' },
    { date: '2023-05-15', event: 'Document Review', description: 'Your documents are being reviewed.' },
    { date: '2023-05-20', event: 'Additional Documents Requested', description: 'Please upload the required financial documents.' },
  ];

  const mockDocuments = [
    { name: 'Passport', uploaded: true, verified: true, date: '2023-05-10' },
    { name: 'Photo', uploaded: true, verified: true, date: '2023-05-10' },
    { name: 'Bank Statement', uploaded: true, verified: false, date: '2023-05-15' },
    { name: 'Accommodation Proof', uploaded: false, verified: false, required: true },
    { name: 'Travel Insurance', uploaded: false, verified: false, required: true },
  ];

  const mockAppointments = [
    {
      id: 'APT5678',
      type: 'Visa Interview',
      date: '2023-06-10',
      time: '10:30 AM',
      location: 'US Embassy, London',
      confirmationCode: 'INT-USEM-78965',
      instructions: 'Bring original documents and arrive 30 minutes early',
    },
  ];

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<string, { bg: string, text: string, icon: React.ReactNode }> = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="h-3 w-3 mr-1" aria-label="Pending" /> },
      'In Progress': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <CircleDashed className="h-3 w-3 mr-1" aria-label="In Progress" /> },
      'Document Review': { bg: 'bg-purple-100', text: 'text-purple-800', icon: <FileText className="h-3 w-3 mr-1" aria-label="Document Review" /> },
      'Additional Documents Required': { bg: 'bg-orange-100', text: 'text-orange-800', icon: <AlertCircle className="h-3 w-3 mr-1" aria-label="Additional Documents Required" /> },
      'Approved': { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="h-3 w-3 mr-1" aria-label="Approved" /> },
      'Rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="h-3 w-3 mr-1" aria-label="Rejected" /> },
      'Ready for Interview': { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: <User className="h-3 w-3 mr-1" aria-label="Ready for Interview" /> }
    };
    
    const config = statusConfig[status] || statusConfig['Pending'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Application Status</CardTitle>
            <StatusBadge status={application?.status || 'Pending'} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Application ID</p>
                <p className="text-sm text-gray-500">{applicationId}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Submitted Date</p>
                <p className="text-sm text-gray-500">{application?.submitted_date || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Next Step</p>
                <p className="text-sm text-gray-500">{application?.next_step || 'Processing'}</p>
              </div>
            </div>
            
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Application Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Country</p>
                    <p className="text-sm text-gray-500">{application?.countries?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Visa Type</p>
                    <p className="text-sm text-gray-500">{application?.visa_packages?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Processing Time</p>
                    <p className="text-sm text-gray-500">
                      {application?.visa_packages?.processing_days 
                        ? `${application.visa_packages.processing_days} days` 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Fee</p>
                    <p className="text-sm text-gray-500">
                      {application?.visa_packages?.government_fee !== undefined && 
                       application?.visa_packages?.service_fee !== undefined
                        ? `$${(application.visa_packages.government_fee + application.visa_packages.service_fee).toFixed(2)}`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium mb-2">Recent Updates</p>
                  <div className="space-y-2">
                    {mockTimeline.slice(0, 2).map((item, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">{item.event}</p>
                          <p className="text-xs text-gray-500">{item.date}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium mb-2">Required Actions</p>
                  {application?.status === 'Additional Documents Required' ? (
                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-md">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" aria-label="Alert" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">Additional Documents Required</p>
                          <p className="text-xs text-orange-700 mt-1">
                            Please upload the requested documents to proceed with your application.
                          </p>
                          <Button size="sm" className="mt-2 bg-orange-500 hover:bg-orange-600">
                            Upload Documents
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No actions required at this time.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDocuments.map((doc, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" aria-label="Document" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        {doc.uploaded && (
                          <p className="text-xs text-gray-500">Uploaded on {doc.date}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {doc.uploaded ? (
                        doc.verified ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="h-3 w-3 mr-1" aria-label="Verified" /> Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            <Clock className="h-3 w-3 mr-1" aria-label="Pending Verification" /> Pending Verification
                          </Badge>
                        )
                      ) : (
                        <Button size="sm" variant="outline" className="text-blue-600">
                          <Upload className="h-3 w-3 mr-1" aria-label="Upload" /> Upload
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 border-l border-gray-200">
                {mockTimeline.map((item, index) => (
                  <div key={index} className="mb-6 relative">
                    <div className="absolute -left-[25px] mt-1.5 h-4 w-4 rounded-full border border-white bg-gray-200">
                      {index === 0 && <div className="absolute inset-0 rounded-full bg-blue-500"></div>}
                    </div>
                    <div className="mb-1">
                      <span className="text-xs text-gray-500">{item.date}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium">{item.event}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {mockAppointments.length > 0 ? (
                <div className="space-y-4">
                  {mockAppointments.map((appointment, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium">{appointment.type}</h4>
                          <div className="mt-1 space-y-1">
                            <p className="text-xs flex items-center text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" aria-label="Date" /> {appointment.date} at {appointment.time}
                            </p>
                            <p className="text-xs flex items-center text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" aria-label="Location" /> {appointment.location}
                            </p>
                            <p className="text-xs flex items-center text-gray-500">
                              <Info className="h-3 w-3 mr-1" aria-label="Confirmation Code" /> Confirmation: {appointment.confirmationCode}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Add to Calendar
                        </Button>
                      </div>
                      
                      <div className="mt-3 bg-blue-50 p-3 rounded-md">
                        <p className="text-xs text-blue-700">
                          <Info className="h-3 w-3 mr-1 inline" aria-label="Instructions" />
                          {appointment.instructions}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" aria-label="No Appointments" />
                  <p>No appointments scheduled yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApplicationTracker;
