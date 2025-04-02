
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, Check, AlertCircle, FileText, Users, 
  CreditCard, HelpCircle, ArrowLeft, Calendar, Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AddonServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch addon service details
  const { data: service, isLoading, error } = useQuery({
    queryKey: ['addon-service', id],
    queryFn: async () => {
      // This would be replaced with a real API call
      const { data, error } = await supabase
        .from('addon_services')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    },
  });

  // For demo purposes, let's create a mock service if the real one is not available yet
  const mockService = {
    id: id || '1',
    name: 'Police Clearance Certificate',
    description: 'Official certification from police authorities confirming you have no criminal record.',
    longDescription: 'A Police Clearance Certificate (PCC) is an official document issued by law enforcement authorities that verifies whether an individual has any criminal record. Many countries require this document as part of visa applications to ensure that visitors do not have a history of criminal activity. Our service handles the entire application process on your behalf, saving you time and ensuring all requirements are properly met.',
    price: '2500',
    deliveryDays: 7,
    discountPercentage: 20,
    imageUrl: 'public/lovable-uploads/bedbfdd9-1801-4000-886a-71097d9c5a26.png',
    requirements: [
      'Valid passport with at least 6 months validity',
      'Proof of address (utility bill, bank statement)',
      'Completed application form',
      'Recent passport-sized photographs',
      'Letter stating the purpose of the certificate'
    ],
    faqs: [
      {
        question: 'How long is the certificate valid?',
        answer: 'Police Clearance Certificates are typically valid for 6 months from the date of issue.'
      },
      {
        question: 'Can you expedite the process?',
        answer: 'Yes, we offer expedited processing for an additional fee, which can reduce the processing time to 3-4 days.'
      },
      {
        question: 'Will I need to visit the police station?',
        answer: 'In most cases, our service eliminates the need for you to visit the police station. We handle the documentation and submission process.'
      }
    ],
    process: [
      'Submit required documents and application form',
      'Documentation review by our expert team',
      'Application submission to authorities',
      'Regular status updates during processing',
      'Certificate delivery upon approval'
    ]
  };

  const serviceData = service || mockService;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-64 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-16 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
            <p className="mb-6">We couldn't find the add-on service you're looking for.</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToApplication = () => {
    toast({
      title: "Service added to your application",
      description: `${serviceData.name} has been added to your visa application.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-indigo-900 to-blue-800 text-white pt-16 pb-20">
          <div className="container mx-auto px-4">
            <Button 
              variant="ghost" 
              className="text-white mb-6 hover:bg-white/10"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 backdrop-blur-sm rounded-full mb-6 border border-green-500/30">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium">Official Service</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{serviceData.name}</h1>
                <p className="text-lg text-blue-100 mb-8">{serviceData.description}</p>
                
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                    <div className="text-2xl font-bold">₹{serviceData.price}</div>
                    <div className="text-sm text-blue-200">Per person</div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                    <div className="flex items-center text-2xl font-bold">
                      <Clock className="mr-2 h-5 w-5 text-blue-300" />
                      {serviceData.deliveryDays} Days
                    </div>
                    <div className="text-sm text-blue-200">Processing time</div>
                  </div>
                  
                  {serviceData.discountPercentage && (
                    <div className="bg-green-500/20 backdrop-blur-sm rounded-lg px-4 py-3">
                      <div className="text-2xl font-bold">{serviceData.discountPercentage}% Off</div>
                      <div className="text-sm text-blue-200">Limited time</div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    className="bg-teal hover:bg-teal/90"
                    onClick={handleAddToApplication}
                  >
                    Add to My Application
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Have Questions?
                  </Button>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="hidden lg:block"
              >
                <img 
                  src={serviceData.imageUrl} 
                  alt={serviceData.name}
                  className="w-full h-80 object-cover rounded-lg shadow-xl"
                />
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Content tabs */}
        <div className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-gray-200 mb-8">
                <TabsList className="bg-transparent h-auto p-0 w-full flex justify-start overflow-x-auto">
                  {[
                    { id: "overview", label: "Overview", icon: <FileText className="h-4 w-4 mr-2" /> },
                    { id: "requirements", label: "Requirements", icon: <FileText className="h-4 w-4 mr-2" /> },
                    { id: "process", label: "Process", icon: <Clock className="h-4 w-4 mr-2" /> },
                    { id: "faqs", label: "FAQs", icon: <HelpCircle className="h-4 w-4 mr-2" /> }
                  ].map((tab) => (
                    <TabsTrigger 
                      key={tab.id}
                      value={tab.id}
                      className={`px-6 py-3 border-b-2 rounded-none transition-colors ${
                        activeTab === tab.id 
                          ? "border-indigo-600 text-indigo-600" 
                          : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center">
                        {tab.icon}
                        {tab.label}
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              <TabsContent value="overview" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">Service Overview</h2>
                    <p className="text-gray-600 mb-6">
                      {serviceData.longDescription}
                    </p>
                    
                    <h3 className="text-xl font-semibold mb-3">Key Benefits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {[
                        { icon: <Clock />, title: "Time-Saving", description: "Skip long queues and paperwork" },
                        { icon: <Check />, title: "Accuracy", description: "Expert review ensures correct application" },
                        { icon: <Shield />, title: "Official", description: "Genuine certificate from authorities" },
                        { icon: <Users />, title: "Support", description: "Assistance throughout the process" }
                      ].map((benefit, index) => (
                        <Card key={index} className="border border-gray-200">
                          <CardContent className="p-4 flex items-start">
                            <div className="bg-indigo-100 p-2 rounded-full mr-3 text-indigo-600">
                              {benefit.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold">{benefit.title}</h4>
                              <p className="text-sm text-gray-500">{benefit.description}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Card className="bg-gray-50 border-gray-200">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Service Summary</h3>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between pb-2 border-b border-gray-200">
                            <span className="text-gray-600">Price</span>
                            <span className="font-semibold">₹{serviceData.price}</span>
                          </div>
                          
                          <div className="flex justify-between pb-2 border-b border-gray-200">
                            <span className="text-gray-600">Processing Time</span>
                            <span className="font-semibold">{serviceData.deliveryDays} Days</span>
                          </div>
                          
                          <div className="flex justify-between pb-2 border-b border-gray-200">
                            <span className="text-gray-600">Document Validity</span>
                            <span className="font-semibold">6 Months</span>
                          </div>
                          
                          <div className="flex justify-between pb-2 border-b border-gray-200">
                            <span className="text-gray-600">Required for</span>
                            <span className="font-semibold">Visa Application</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full mt-6 bg-teal hover:bg-teal/90"
                          onClick={handleAddToApplication}
                        >
                          Add to My Application
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="requirements" className="mt-0">
                <h2 className="text-2xl font-bold mb-6">Document Requirements</h2>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
                  <ul className="space-y-3">
                    {serviceData.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Important Notes</h3>
                  <ul className="space-y-2 text-blue-700">
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>All documents must be current and valid at the time of application.</span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Documents in languages other than English must be accompanied by certified translations.</span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Applications with incomplete documentation may cause delays in processing.</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="process" className="mt-0">
                <h2 className="text-2xl font-bold mb-6">Application Process</h2>
                <div className="space-y-6">
                  {serviceData.process.map((step, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-4 flex-grow shadow-sm">
                        <p className="text-gray-800">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-10 bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">What to Expect</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-indigo-100 p-3 rounded-full mb-3 text-indigo-600">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <h4 className="font-semibold mb-1">Application</h4>
                      <p className="text-sm text-gray-600">Submit documents and complete application</p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-indigo-100 p-3 rounded-full mb-3 text-indigo-600">
                        <Clock className="h-6 w-6" />
                      </div>
                      <h4 className="font-semibold mb-1">Processing</h4>
                      <p className="text-sm text-gray-600">Wait for verification and approval</p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-indigo-100 p-3 rounded-full mb-3 text-indigo-600">
                        <FileText className="h-6 w-6" />
                      </div>
                      <h4 className="font-semibold mb-1">Certificate</h4>
                      <p className="text-sm text-gray-600">Receive your official document</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="faqs" className="mt-0">
                <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {serviceData.faqs.map((faq, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                      <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                  <div className="flex items-start">
                    <HelpCircle className="h-6 w-6 text-indigo-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-900 mb-2">Still have questions?</h3>
                      <p className="text-indigo-700 mb-4">Our visa experts are ready to assist you with any questions about this service.</p>
                      <Button variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-100">
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddonServiceDetail;
