import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getLegalPageBySlug, type LegalPage } from '@/models/legal_pages';

const Privacy = () => {
  const [pageData, setPageData] = useState<LegalPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>(
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  );
  
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const data = await getLegalPageBySlug('privacy-policy');
        if (data) {
          setPageData(data);
          setLastUpdated(new Date(data.last_updated).toLocaleDateString('en-US', { 
            month: 'long', day: 'numeric', year: 'numeric' 
          }));
        }
      } catch (error) {
        console.error('Error fetching Privacy Policy:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-20 md:pt-24">
        <div className="bg-navy text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-gray-200 mt-2">Last updated: {lastUpdated}</p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-md mb-8">
              <CardContent className="p-8">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                  </div>
                ) : pageData ? (
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: pageData.content }} />
                ) : (
                <div className="space-y-8">
                    {/* Fallback content */}
                  <section>
                      <h2 className="text-2xl font-semibold text-navy mb-4">1. Introduction</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        At Permitsy, we respect your privacy and are committed to protecting it through our compliance with this policy.
                    </p>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        This Privacy Policy describes the types of information we may collect from you or that you may provide when you visit the website permitsy.com and our practices for collecting, using, maintaining, protecting, and disclosing that information.
                    </p>
                  </section>
                  
                  <Separator />
                  
                  <section>
                      <h2 className="text-2xl font-semibold text-navy mb-4">2. Information We Collect</h2>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        When you visit our website, we may collect several types of information from and about users of our Website, including:
                      </p>
                      <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-4">
                        <li>Personal information such as name, email address, and phone number that you provide by filling in forms on our Website.</li>
                        <li>Information that is about you but individually does not identify you, such as IP address, time zone, and some of the cookies that are installed on your device.</li>
                        <li>Records and copies of your correspondence if you contact us.</li>
                        <li>Details of transactions you carry out through our Website and of the fulfillment of your orders.</li>
                        <li>Information about your internet connection, the equipment you use to access our Website, and usage details.</li>
                      </ul>
                    <p className="text-gray-700 leading-relaxed">
                        As is true of most websites, we gather certain information automatically. This information may include Internet protocol (IP) addresses, browser type, Internet service provider (ISP), referring/exit pages, operating system, date/time stamp, and/or clickstream data, and we may combine this automatically collected data with other information we collect about you.
                    </p>
                  </section>
                  
                  <Separator />
                  
                  <section>
                      <h2 className="text-2xl font-semibold text-navy mb-4">3. How We Use Your Information</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        We use information that we collect about you or that you provide to us, including any personal information:
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 space-y-2">
                        <li>To present our Website and its contents to you.</li>
                        <li>To provide you with information, products, or services that you request from us.</li>
                        <li>To fulfill any other purpose for which you provide it.</li>
                        <li>To provide you with notices about your account.</li>
                        <li>To carry out our obligations and enforce our rights arising from any contracts entered into between you and us.</li>
                        <li>To notify you about changes to our Website or any products or services we offer or provide though it.</li>
                        <li>In any other way we may describe when you provide the information.</li>
                        <li>For any other purpose with your consent.</li>
                    </ul>
                  </section>
                  
                  <Separator />
                  
                  <section>
                      <h2 className="text-2xl font-semibold text-navy mb-4">4. Changes to Our Privacy Policy</h2>
                      <p className="text-gray-700 leading-relaxed mb-4">
                      We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.
                    </p>
                  </section>
                  
                  <Separator />
                  
                  <section>
                      <h2 className="text-2xl font-semibold text-navy mb-4">5. Contact Information</h2>
                      <p className="text-gray-700 leading-relaxed mb-4">
                      For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e‑mail at <a href="mailto:privacy@permitsy.com" className="text-navy hover:underline">privacy@permitsy.com</a>.
                    </p>
                  </section>
                </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
