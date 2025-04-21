import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getLegalPageBySlug, type LegalPage } from '@/models/legal_pages';

const Terms = () => {
  const [pageData, setPageData] = useState<LegalPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>(
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  );
  
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const data = await getLegalPageBySlug('terms-of-service');
        if (data) {
          setPageData(data);
          setLastUpdated(new Date(data.last_updated).toLocaleDateString('en-US', { 
            month: 'long', day: 'numeric', year: 'numeric' 
          }));
        }
      } catch (error) {
        console.error('Error fetching Terms of Service:', error);
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
            <h1 className="text-3xl font-bold">Terms of Service</h1>
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
                    {/* Fallback content in case database fetch fails */}
                  <section>
                    <h2 className="text-2xl font-semibold text-navy mb-4">1. Introduction</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Welcome to Permitsy ("Company", "we", "our", "us")! These Terms of Service ("Terms") govern your use of our web pages located at permitsy.com operated by Permitsy.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Our Privacy Policy also governs your use of our Service and explains how we collect, safeguard and disclose information that results from your use of our web pages.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Your agreement with us includes these Terms and our Privacy Policy ("Agreements"). You acknowledge that you have read and understood Agreements, and agree to be bound of them.
                    </p>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-2xl font-semibold text-navy mb-4">2. Communications</h2>
                    <p className="text-gray-700 leading-relaxed">
                      By using our Service, you agree to subscribe to newsletters, marketing or promotional materials and other information we may send. However, you may opt out of receiving any, or all, of these communications from us by following the unsubscribe link or by emailing at support@permitsy.com.
                    </p>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-2xl font-semibold text-navy mb-4">3. Purchases</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      If you wish to purchase any product or service made available through Service ("Purchase"), you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, your billing address, and your shipping information.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      You represent and warrant that: (i) you have the legal right to use any credit card(s) or other payment method(s) in connection with any Purchase; and that (ii) the information you supply to us is true, correct and complete.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      We reserve the right to refuse or cancel your order at any time for reasons including but not limited to: product or service availability, errors in the description or price of the product or service, error in your order or other reasons.
                    </p>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-2xl font-semibold text-navy mb-4">4. Refunds</h2>
                    <p className="text-gray-700 leading-relaxed">
                      Please refer to our <a href="/refunds" className="text-navy hover:underline font-medium">Refund Policy</a> for information about refunds.
                    </p>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-2xl font-semibold text-navy mb-4">5. Content</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for Content that you post on or through Service, including its legality, reliability, and appropriateness.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      By posting Content on or through Service, You represent and warrant that: (i) Content is yours (you own it) and/or you have the right to use it and the right to grant us the rights and license as provided in these Terms, and (ii) that the posting of your Content on or through Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person or entity.
                    </p>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-2xl font-semibold text-navy mb-4">6. Contact Us</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      If you have any questions about these Terms, please contact us:
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 space-y-2">
                      <li>By email: <a href="mailto:support@permitsy.com" className="text-navy hover:underline">support@permitsy.com</a></li>
                    </ul>
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

export default Terms;
