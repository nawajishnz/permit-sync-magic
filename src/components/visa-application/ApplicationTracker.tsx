
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  AlertCircle, 
  Download,
  UploadCloud,
  Calendar,
  Info
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import UploadDocumentDialog from './UploadDocumentDialog';

// Helper component for document status
const DocumentStatus = ({ status }: { status: string }) => {
  if (status === 'verified') {
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  } else if (status === 'rejected') {
    return <XCircle className="h-5 w-5 text-red-500" />;
  } else if (status === 'uploaded') {
    return <Clock className="h-5 w-5 text-amber-500" />;
  } else {
    return <FileText className="h-5 w-5 text-gray-400" />;
  }
};

// Component to display the status badge
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { bg: string, text: string, label: string }> = {
    'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    'in_progress': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
    'document_review': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Document Review' },
    'documents_required': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Documents Required' },
    'approved': { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
    'rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    'interview_scheduled': { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Interview Scheduled' }
  };

  const config = statusConfig[status] || statusConfig['pending'];

  return (
    <Badge variant="outline" className={`${config.bg} ${config.text} border-0`}>
      {config.label}
    </Badge>
  );
};

// Timeline component
interface TimelineEvent {
  id: string;
  event: string;
  date: string;
  description?: string;
}

const Timeline = ({ events }: { events?: TimelineEvent[] }) => {
  if (!events || events.length === 0) {
    return <div className="text-gray-500 text-sm italic">No timeline events yet</div>;
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={index} className="flex">
          <div className="mr-4 flex flex-col items-center">
            <div className={`rounded-full p-1 ${index === 0 ? 'bg-blue-500' : 'bg-gray-200'}`}>
              <div className="h-2 w-2 rounded-full bg-white"></div>
            </div>
            {index < events.length - 1 && <div className="h-full w-px bg-gray-200 flex-grow"></div>}
          </div>
          <div className={`pb-4 ${index === 0 ? 'text-blue-600' : 'text-gray-600'}`}>
            <p className="text-sm font-medium">{event.event}</p>
            <time className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</time>
            {event.description && (
              <p className="text-sm mt-1">{event.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Main application tracker component
const ApplicationTracker = () => {
  const { applicationId } = useParams();
  const { toast } = useToast();
  const [uploadingDocumentType, setUploadingDocumentType] = useState<string | null>(null);
  
  // Define the application progress steps
  const progressSteps = [
    { title: "Submitted", icon: <Info className="h-4 w-4" /> },
    { title: "Processing", icon: <Clock className="h-4 w-4" /> },
    { title: "Document Review", icon: <FileText className="h-4 w-4" /> },
    { title: "Decision", icon: <AlertCircle className="h-4 w-4" /> },
    { title: "Completed", icon: <CheckCircle className="h-4 w-4" /> }
  ];

  // Fetch application data
  const { data: application, isLoading, error, refetch } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: async () => {
      // Get application data
      const { data: appData, error: appError } = await supabase
        .from('visa_applications')
        .select(`
          *,
          visa_packages (*),
          countries (id, name, flag),
          application_documents (
            id, 
            document_type,
            file_url,
            status,
            feedback,
            uploaded_at
          ),
          application_timeline (
            id,
            event,
            date,
            description
          )
        `)
        .eq('id', applicationId)
        .single();

      if (appError) {
        throw appError;
      }

      // Ensure timeline data is properly processed
      if (appData && appData.application_timeline && Array.isArray(appData.application_timeline)) {
        // Sort timeline by date in descending order
        appData.application_timeline.sort((a: any, b: any) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
      }

      return appData;
    },
    enabled: !!applicationId,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading application",
        description: error instanceof Error ? error.message : "Could not load application details",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Handle document upload completion
  const handleUploadComplete = () => {
    setUploadingDocumentType(null);
    refetch();
    toast({
      title: "Document uploaded",
      description: "Your document has been successfully uploaded and is pending review.",
    });
  };

  // Calculate current step based on application status
  const getCurrentStep = (status: string) => {
    const stepMap: Record<string, number> = {
      'pending': 0,
      'in_progress': 1,
      'document_review': 2,
      'documents_required': 2,
      'interview_scheduled': 3,
      'approved': 4,
      'rejected': 4
    };

    return stepMap[status] || 0;
  };

  // Application progress as percentage
  const getProgressPercentage = (currentStep: number) => {
    return (currentStep / (progressSteps.length - 1)) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Application not found or you don't have permission to view it.
        </AlertDescription>
      </Alert>
    );
  }

  const currentStep = getCurrentStep(application.status);
  const progress = getProgressPercentage(currentStep);
  
  // Safely access country name
  const countryName = application.countries && typeof application.countries === 'object' && 'name' in application.countries 
    ? application.countries.name as string
    : "Unknown Country";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Visa Application: {applicationId}
            </h1>
            <p className="text-gray-600">
              {countryName} - {application.visa_packages?.name || "Visa Application"}
            </p>
          </div>
          <StatusBadge status={application.status} />
        </div>
      </div>

      {application.status === 'documents_required' && (
        <Alert className="mb-6 bg-orange-50 border-orange-200">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Please upload the required documents to continue processing your application.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress tracker */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Application Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
          </div>
          <div className="grid grid-cols-5 gap-1 text-xs text-center">
            {progressSteps.map((step, index) => (
              <div 
                key={index} 
                className={`flex flex-col items-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <div className={`rounded-full p-1 ${index <= currentStep ? 'bg-blue-100' : 'bg-gray-100'} mb-1`}>
                  {React.cloneElement(step.icon, { 
                    className: `h-4 w-4 ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`
                  })}
                </div>
                <span>{step.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Documents section */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {application.application_documents && Array.isArray(application.application_documents) && application.application_documents.length > 0 ? (
                <div className="space-y-4">
                  {application.application_documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <DocumentStatus status={doc.status} />
                        <div className="ml-3">
                          <p className="font-medium">{doc.document_type}</p>
                          {doc.status === 'rejected' && doc.feedback && (
                            <p className="text-sm text-red-600 mt-1">{doc.feedback}</p>
                          )}
                          {doc.status !== 'rejected' && doc.status !== 'none' && (
                            <p className="text-xs text-gray-500">
                              Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        {doc.status === 'none' || doc.status === 'rejected' ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setUploadingDocumentType(doc.document_type)}
                          >
                            <UploadCloud className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                        ) : doc.file_url ? (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            asChild
                          >
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              View
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No documents required at this time.</p>
              )}
            </CardContent>
          </Card>

          {/* Application details */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Personal Details</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p>
                        {application.form_data?.personalInfo ? 
                          `${application.form_data.personalInfo.firstName || ''} ${application.form_data.personalInfo.lastName || ''}` : 
                          "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p>{application.form_data?.personalInfo?.email || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p>{application.form_data?.personalInfo?.phoneNumber || "Not provided"}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Travel Details</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Purpose of Travel</p>
                      <p>{application.form_data?.travelInfo?.purposeOfTravel || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Planned Travel Dates</p>
                      <p>{application.form_data?.travelInfo?.departureDate ? (
                        <>
                          {new Date(application.form_data.travelInfo.departureDate).toLocaleDateString()} 
                          {application.form_data.travelInfo.returnDate && (
                            <> to {new Date(application.form_data.travelInfo.returnDate).toLocaleDateString()}</>
                          )}
                        </>
                      ) : "Not specified"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Visa Package</h3>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {application.countries && typeof application.countries === 'object' && 'flag' in application.countries && (
                      <img 
                        src={application.countries.flag as string} 
                        alt={`${countryName} flag`}
                        className="w-8 h-6 object-cover rounded-sm"
                      />
                    )}
                    <div>
                      <p className="font-medium">{application.visa_packages?.name || "Standard Visa"}</p>
                      <div className="flex text-sm text-gray-600 mt-1">
                        <div className="flex items-center mr-4">
                          <Clock className="h-3 w-3 mr-1" />
                          {application.visa_packages?.processing_days || "?"} days processing
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline events={application.application_timeline} />
            </CardContent>
          </Card>

          {/* Upcoming Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              {application.status === 'documents_required' ? (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-medium text-orange-800 flex items-center">
                    <UploadCloud className="h-4 w-4 mr-2" />
                    Upload Required Documents
                  </h3>
                  <p className="text-sm text-orange-700 mt-2">
                    Please upload all required documents to continue processing your application.
                  </p>
                </div>
              ) : application.status === 'interview_scheduled' ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Prepare for Your Interview
                  </h3>
                  <p className="text-sm text-blue-700 mt-2">
                    Your interview is scheduled for {application.form_data?.appointmentInfo?.interviewDate ? 
                      new Date(application.form_data.appointmentInfo.interviewDate).toLocaleDateString() : "the scheduled date"}.
                  </p>
                </div>
              ) : application.status === 'approved' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Visa Approved
                  </h3>
                  <p className="text-sm text-green-700 mt-2">
                    Your visa has been approved. You will receive further instructions shortly.
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Your application is being processed. Check back later for updates.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Document upload dialog */}
      {uploadingDocumentType && applicationId && (
        <UploadDocumentDialog
          open={!!uploadingDocumentType}
          onClose={() => setUploadingDocumentType(null)}
          onUploadComplete={handleUploadComplete}
          documentType={uploadingDocumentType}
          applicationId={applicationId}
        />
      )}
    </div>
  );
};

export default ApplicationTracker;
