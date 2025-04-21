import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Info,
  Calendar,
  MapPin,
  FileCheck,
  XCircle,
  CircleDashed,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming' | 'warning' | 'error';
}

interface Document {
  name: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  message?: string;
  dueDate?: string;
}

interface ApplicationTrackerProps {
  applicationId: string;
  status: string;
  progress: number;
  country: string;
  visaType: string;
  submittedDate: string;
  timeline: TimelineEvent[];
  documents: Document[];
  nextAction?: {
    type: string;
    description: string;
    dueDate?: string;
  };
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    'In Progress': { bg: 'bg-blue-100', text: 'text-blue-800', icon: CircleDashed },
    'Document Review': { bg: 'bg-purple-100', text: 'text-purple-800', icon: FileText },
    'Additional Documents Required': { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertCircle },
    'Approved': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    'Rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    'Ready for Interview': { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: User }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Pending'];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('gap-1.5', config.bg, config.text)}>
      <Icon className="h-3 w-3" />
      <span>{status}</span>
    </Badge>
  );
};

const DocumentStatus = ({ status, message }: { status: Document['status']; message?: string }) => {
  const statusConfig = {
    pending: { icon: Clock, className: 'text-yellow-500' },
    uploaded: { icon: FileText, className: 'text-blue-500' },
    verified: { icon: FileCheck, className: 'text-green-500' },
    rejected: { icon: XCircle, className: 'text-red-500' }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <Icon className={cn('h-4 w-4', config.className)} />
      <span className="capitalize">{status}</span>
      {message && <Info className="h-4 w-4 text-gray-400" title={message} />}
    </div>
  );
};

const TimelineEvent = ({ event }: { event: TimelineEvent }) => {
  const statusStyles = {
    completed: 'bg-green-500',
    current: 'bg-blue-500',
    upcoming: 'bg-gray-300',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn('w-3 h-3 rounded-full', statusStyles[event.status])} />
        {event.status !== 'upcoming' && <div className="w-0.5 h-full bg-gray-200" />}
      </div>
      <div className="flex-1 pb-6">
        <p className="text-sm font-medium">{event.title}</p>
        <p className="text-sm text-gray-500">{event.description}</p>
        <p className="text-xs text-gray-400 mt-1">{event.date}</p>
      </div>
    </div>
  );
};

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applicationId,
  status,
  progress,
  country,
  visaType,
  submittedDate,
  timeline,
  documents,
  nextAction
}) => {
  return (
    <div className="space-y-6">
      {/* Application Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Application {applicationId}</CardTitle>
              <CardDescription className="mt-1.5">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    {country}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-gray-500" />
                    {visaType}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    Submitted {submittedDate}
                  </span>
                </div>
              </CardDescription>
            </div>
            <StatusBadge status={status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Application Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Next Action Alert */}
      {nextAction && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <span className="font-medium">{nextAction.type}: </span>
              {nextAction.description}
            </div>
            {nextAction.dueDate && (
              <Badge variant="outline" className="ml-2">
                Due by {nextAction.dueDate}
              </Badge>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Application Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <TimelineEvent key={index} event={event} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">{doc.name}</span>
                  <div className="flex items-center gap-4">
                    {doc.dueDate && (
                      <span className="text-sm text-gray-500">
                        Due: {doc.dueDate}
                      </span>
                    )}
                    <DocumentStatus status={doc.status} message={doc.message} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 