
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const FAQs = () => {
  // Sample FAQ data - organized by categories
  const faqCategories = [
    {
      id: 'application',
      name: 'Application Process',
      questions: [
        {
          id: 'apply-online',
          question: 'How do I apply for a visa online?',
          answer: 'To apply for a visa online through Permitsy, simply create an account, complete your profile, select your destination country, choose the appropriate visa type, fill out the application form, upload the required documents, pay the fees, and submit your application. Our system will guide you through each step.'
        },
        {
          id: 'processing-time',
          question: 'How long does visa processing take?',
          answer: 'Processing times vary depending on the destination country, visa type, and current application volumes. Tourist visas typically take 5-15 business days, while work or study visas may take 2-8 weeks. You can check estimated processing times for your specific visa on our website.'
        },
        {
          id: 'track-application',
          question: 'How can I track my visa application?',
          answer: 'You can track your visa application status anytime by logging into your Permitsy account dashboard. The dashboard displays your current application status, any pending requirements, and estimated completion dates.'
        },
        {
          id: 'required-documents',
          question: 'What documents do I need to submit?',
          answer: 'Required documents vary by country and visa type but typically include a valid passport, application form, passport-sized photos, proof of financial means, travel itinerary, accommodation details, and health insurance. Our system will provide you with a checklist specific to your visa application.'
        }
      ]
    },
    {
      id: 'fees',
      name: 'Fees & Payments',
      questions: [
        {
          id: 'visa-cost',
          question: 'How much does a visa cost?',
          answer: 'Visa fees vary by country and visa type. They typically include the government fee (set by the embassy/consulate) and our service fee. You can view the complete fee breakdown before submitting your application.'
        },
        {
          id: 'payment-methods',
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit and debit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our encrypted payment system.'
        },
        {
          id: 'refund-policy',
          question: 'What is your refund policy?',
          answer: 'If your visa application is rejected, we offer a partial refund of our service fee. Government fees are typically non-refundable. If you cancel your application before processing begins, you may be eligible for a full refund of our service fee minus a small administrative charge. Please refer to our Refund Policy page for detailed information.'
        },
        {
          id: 'service-fees',
          question: 'What are your service fees for different countries?',
          answer: "Our service fees vary by country based on processing complexity. Examples include: UAE ($14), Egypt ($6), Vietnam ($25), Indonesia ($35), Greece ($50), Australia ($50), Canada ($300), UK ($260), Malaysia ($1), Argentina ($400), Turkey ($6), and many more. The fee is only charged after visa approval, and if there's a delay, the fee is waived. Government fees are paid separately at the time of application."
        }
      ]
    },
    {
      id: 'service',
      name: 'Our Services',
      questions: [
        {
          id: 'processing-guarantee',
          question: 'Do you guarantee visa approval?',
          answer: 'While we cannot guarantee visa approval as the final decision rests with immigration authorities, we have a 98% success rate. Our expert review process ensures your application is complete, accurate, and presented in the best possible way to maximize approval chances.'
        },
        {
          id: 'expedited-service',
          question: 'Do you offer expedited processing?',
          answer: 'Yes, we offer expedited processing for most visa types. This premium service includes priority handling of your application, faster document review, and expedited submission to the relevant authorities. Additional fees apply for expedited services.'
        },
        {
          id: 'additional-services',
          question: 'What additional services do you provide?',
          answer: 'Beyond visa processing, we offer document translation, interview preparation for embassy appointments, travel insurance arrangements, appointment scheduling with embassies/consulates, and personalized guidance throughout the visa process.'
        },
        {
          id: 'processing-timeline',
          question: 'What is your processing timeline guarantee?',
          answer: 'We guarantee on-time visa processing with a money-back guarantee on our service fee if there are any delays. Our platform handles all paperwork, document uploads, and provides real-time visa status tracking. Specific processing times vary by country, but we maintain a 99.5% on-time delivery rate for over 150 destinations worldwide.'
        }
      ]
    },
    {
      id: 'support',
      name: 'Support & Assistance',
      questions: [
        {
          id: 'contact-support',
          question: 'How can I contact customer support?',
          answer: 'Our customer support team is available 24/7 via live chat on our website, email at support@permitsy.com, or phone at +1 (555) 123-4567. We typically respond to all inquiries within 1-2 hours during business hours.'
        },
        {
          id: 'visa-rejection',
          question: 'What happens if my visa is rejected?',
          answer: "If your visa application is rejected, we'll help you understand the reasons for rejection and advise you on the best course of action. This may include reapplying with additional documentation, applying for a different visa category, or appealing the decision if appropriate."
        }
      ]
    }
  ];

  const [searchTerm, setSearchTerm] = useState("");
  
  // Simple filter function
  const filteredCategories = searchTerm.trim() === "" 
    ? faqCategories 
    : faqCategories.map(category => ({
        ...category,
        questions: category.questions.filter(question => 
          question.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
          question.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero section */}
        <div className="bg-navy text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg opacity-90 max-w-2xl">
              Find answers to commonly asked questions about visas, application processes, and our services.
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input 
                placeholder="Search FAQs..." 
                className="pl-10 py-6 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* FAQs by category */}
          <div className="max-w-3xl mx-auto mb-16">
            {filteredCategories.map((category) => (
              <div key={category.id} className="mb-10">
                <h2 className="text-2xl font-bold mb-6">{category.name}</h2>
                <Accordion type="single" collapsible className="border rounded-lg overflow-hidden">
                  {category.questions.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="border-b last:border-b-0 px-4">
                      <AccordionTrigger className="text-left py-5 hover:no-underline">
                        <span className="text-lg font-medium">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="py-4 text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
            
            {filteredCategories.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No FAQs found matching your search. Please try different keywords.</p>
              </div>
            )}
          </div>

          {/* Still have questions section */}
          <div className="max-w-3xl mx-auto bg-gray-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-gray-600 mb-6">
              Our friendly support team is here to help you with any queries you may have.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white">
                Live Chat
              </Button>
              <Button className="bg-navy hover:bg-navy-600 text-white">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQs;
