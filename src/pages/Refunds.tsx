
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const Refunds = () => {
  const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-navy text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Refund Policy</h1>
            <p className="text-gray-200 mt-2">Last updated: {lastUpdated}</p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-md mb-8">
              <CardContent className="p-8">
                <div className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-semibold text-navy mb-4">1. Overview</h2>
                    <p className="text-gray-700 leading-relaxed">
                      At Permitsy, we strive to ensure complete satisfaction with our services. We understand that circumstances may arise where a refund is warranted, and we have established this refund policy to address such situations fairly and transparently.
                    </p>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-2xl font-semibold text-navy mb-4">2. Service Fee Refunds</h2>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-medium text-navy-600 mb-2">Full Refund Eligibility:</h3>
                      <ul className="list-disc pl-5 text-gray-700 space-y-2">
                        <li>Cancellation before application processing begins</li>
                        <li>Service not yet rendered</li>
                        <li>Duplicate payments</li>
                        <li>Technical error resulting in multiple charges</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-medium text-navy-600 mb-2">Partial Refund Eligibility:</h3>
                      <ul className="list-disc pl-5 text-gray-700 space-y-2">
                        <li>Visa application rejection (50% of service fee)</li>
                        <li>Cancellation after initial processing but before submission (70% of service fee)</li>
                        <li>Service interruption due to technical issues (prorated based on completion)</li>
                      </ul>
                    </div>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-2xl font-semibold text-navy mb-4">3. Non-Refundable Items</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      The following fees are non-refundable:
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 space-y-2">
                      <li>Government/Embassy fees</li>
                      <li>Third-party service charges</li>
                      <li>Express processing fees</li>
                      <li>Document translation fees</li>
                    </ul>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-2xl font-semibold text-navy mb-4">4. Refund Process</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">To request a refund:</p>
                    <ol className="list-decimal pl-5 text-gray-700 space-y-2">
                      <li>Contact our support team at <a href="mailto:support@permitsy.com" className="text-navy hover:underline">support@permitsy.com</a></li>
                      <li>Provide your application reference number</li>
                      <li>Explain the reason for your refund request</li>
                      <li>Include any relevant documentation</li>
                    </ol>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-2xl font-semibold text-navy mb-4">5. Processing Time</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Refund processing typically takes:
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 space-y-2">
                      <li>3-5 business days for review and approval</li>
                      <li>5-10 business days for the funds to appear in your account</li>
                    </ul>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-2xl font-semibold text-navy mb-4">6. Special Circumstances</h2>
                    <p className="text-gray-700 leading-relaxed">
                      We evaluate special circumstances on a case-by-case basis. Please contact our support team to discuss your situation if it falls outside the standard refund criteria.
                    </p>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-2xl font-semibold text-navy mb-4">7. Contact Information</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      For any questions about our refund policy, please contact us:
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 space-y-2">
                      <li>Email: <a href="mailto:refunds@permitsy.com" className="text-navy hover:underline">refunds@permitsy.com</a></li>
                      <li>Phone: +91 7975208649</li>
                      <li>Hours: Monday-Friday, 9am-6pm IST</li>
                    </ul>
                  </section>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Refunds;
