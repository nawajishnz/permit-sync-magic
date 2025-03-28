
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertCircle, User, FileCheck } from 'lucide-react';

const Dashboard = () => {
  // Mock data for dashboard - in a real app, this would come from an API
  const applications = [
    {
      id: 'APP12345',
      country: 'United States',
      visaType: 'Tourist Visa (B-2)',
      submittedDate: '2025-02-15',
      status: 'In Progress',
      nextStep: 'Document Review'
    },
    {
      id: 'APP12346',
      country: 'Canada',
      visaType: 'Student Visa',
      submittedDate: '2025-01-20',
      status: 'Additional Documents Required',
      nextStep: 'Upload Additional Documents'
    }
  ];
  
  const upcomingAppointments = [
    {
      id: 'APT5678',
      type: 'Visa Interview',
      date: '2025-04-10',
      time: '10:30 AM',
      location: 'US Embassy, London'
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-navy mb-6">My Dashboard</h1>
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-teal/10 p-3 rounded-full mr-4">
                    <FileText className="h-6 w-6 text-teal" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Applications</p>
                    <p className="text-2xl font-bold">{applications.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Appointments</p>
                    <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Approved Visas</p>
                    <p className="text-2xl font-bold">1</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Applications */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-navy">My Applications</CardTitle>
                <Link to="/apply-now">
                  <Button size="sm" className="bg-teal hover:bg-teal-600">
                    New Application
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Country</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Visa Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Submitted</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{app.id}</td>
                          <td className="py-3 px-4">{app.country}</td>
                          <td className="py-3 px-4">{app.visaType}</td>
                          <td className="py-3 px-4">{app.submittedDate}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              app.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                              app.status === 'Additional Documents Required' ? 'bg-yellow-100 text-yellow-800' :
                              app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {app.status === 'In Progress' && <Clock className="h-3 w-3 mr-1" />}
                              {app.status === 'Additional Documents Required' && <AlertCircle className="h-3 w-3 mr-1" />}
                              {app.status === 'Approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {app.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm" className="text-navy hover:text-teal">
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't submitted any visa applications yet.</p>
                  <Link to="/apply-now">
                    <Button className="bg-teal hover:bg-teal-600">
                      Start Your First Application
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Upcoming Appointments */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between border p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                          <User className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">{appointment.type}</h3>
                          <p className="text-sm text-gray-500">{appointment.date} at {appointment.time}</p>
                          <p className="text-sm text-gray-500">{appointment.location}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                        <Button variant="outline" size="sm" className="border-navy text-navy hover:bg-navy hover:text-white">
                          Prepare
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No upcoming appointments scheduled.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Required Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy">Required Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-4">
                      <FileCheck className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Valid Passport</h3>
                      <p className="text-sm text-gray-500">Uploaded on 2025-01-15</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                    Verified
                  </span>
                </div>
                
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-2 rounded-full mr-4">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Proof of Accommodation</h3>
                      <p className="text-sm text-gray-500">Required for US Tourist Visa</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-teal hover:bg-teal-600">
                    Upload
                  </Button>
                </div>
                
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-2 rounded-full mr-4">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Bank Statements</h3>
                      <p className="text-sm text-gray-500">Last 3 months required</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-teal hover:bg-teal-600">
                    Upload
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
