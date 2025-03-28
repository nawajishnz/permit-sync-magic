
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-navy text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            
            <h2>1. Information We Collect</h2>
            <p>
              When you visit the website, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.
            </p>
            <p>
              Additionally, as you browse the site, we collect information about the individual web pages that you view, what websites or search terms referred you to the site, and information about how you interact with the site.
            </p>
            
            <h2>2. How Do We Use Your Personal Information?</h2>
            <p>
              We use the information that we collect to help us screen for potential risk and fraud (in particular, your IP address), and more generally to improve and optimize our site.
            </p>
            
            <h2>3. Sharing Your Personal Information</h2>
            <p>
              We share your Personal Information with service providers to help us provide our services and fulfill our contracts with you. For example:
            </p>
            <ul>
              <li>We use payment processors to help us process payments for visa applications</li>
              <li>We may share your information with government agencies as required for visa processing</li>
              <li>We use analytics providers to help us understand how customers use our site</li>
            </ul>
            
            <h2>4. Your Rights</h2>
            <p>
              If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us.
            </p>
            
            <h2>5. Data Retention</h2>
            <p>
              When you submit a visa application through the site, we will maintain your information for our records unless and until you ask us to delete this information.
            </p>
            
            <h2>6. Changes</h2>
            <p>
              We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.
            </p>
            
            <h2>7. Contact Us</h2>
            <p>
              For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e‑mail at privacy@permitsy.com.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
