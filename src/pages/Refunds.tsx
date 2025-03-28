
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Refunds = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-navy text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Refund Policy</h1>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            
            <h2>1. Overview</h2>
            <p>
              At Permitsy, we strive to ensure complete satisfaction with our services. We understand that circumstances may arise where a refund is warranted, and we have established this refund policy to address such situations fairly and transparently.
            </p>
            
            <h2>2. Service Fee Refunds</h2>
            <h3>Full Refund Eligibility:</h3>
            <ul>
              <li>Cancellation before application processing begins</li>
              <li>Service not yet rendered</li>
              <li>Duplicate payments</li>
              <li>Technical error resulting in multiple charges</li>
            </ul>
            
            <h3>Partial Refund Eligibility:</h3>
            <ul>
              <li>Visa application rejection (50% of service fee)</li>
              <li>Cancellation after initial processing but before submission (70% of service fee)</li>
              <li>Service interruption due to technical issues (prorated based on completion)</li>
            </ul>
            
            <h2>3. Non-Refundable Items</h2>
            <p>
              The following fees are non-refundable:
            </p>
            <ul>
              <li>Government/Embassy fees</li>
              <li>Third-party service charges</li>
              <li>Express processing fees</li>
              <li>Document translation fees</li>
            </ul>
            
            <h2>4. Refund Process</h2>
            <p>To request a refund:</p>
            <ol>
              <li>Contact our support team at support@permitsy.com</li>
              <li>Provide your application reference number</li>
              <li>Explain the reason for your refund request</li>
              <li>Include any relevant documentation</li>
            </ol>
            
            <h2>5. Processing Time</h2>
            <p>
              Refund processing typically takes:
            </p>
            <ul>
              <li>3-5 business days for review and approval</li>
              <li>5-10 business days for the funds to appear in your account</li>
            </ul>
            
            <h2>6. Special Circumstances</h2>
            <p>
              We evaluate special circumstances on a case-by-case basis. Please contact our support team to discuss your situation if it falls outside the standard refund criteria.
            </p>
            
            <h2>7. Contact Information</h2>
            <p>
              For any questions about our refund policy, please contact us:
            </p>
            <ul>
              <li>Email: refunds@permitsy.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Hours: Monday-Friday, 9am-6pm EST</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Refunds;
