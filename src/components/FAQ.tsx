
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

const FAQ = () => {
  const { data: faqs, isLoading, error } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      try {
        // Check if the faqs table exists using RPC call
        const { data: tableExists } = await supabase
          .rpc('get_table_info', { p_table_name: 'faqs' });
        
        // If table exists, use a custom RPC function to get FAQs
        if (tableExists && tableExists.length > 0) {
          // Using raw query via rpc to fetch faqs safely
          const { data, error } = await supabase.rpc('get_faqs');
          
          if (data && Array.isArray(data) && data.length > 0 && !error) {
            return data as FaqItem[];
          }
        }
        
        // Fallback - return null to trigger use of default FAQs
        return null;
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !faqs) {
    // Use default FAQs if there's an error or no data
    return <DefaultFAQs />;
  }
  
  if (faqs.length === 0) {
    return <DefaultFAQs />;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem value={`item-${index}`} key={faq.id}>
          <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
          <AccordionContent>
            <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

const DefaultFAQs = () => {
  const defaultFAQs = [
    {
      id: '1',
      question: 'What is Permitsy?',
      answer: 'Permitsy is a service that simplifies visa applications for travelers. We handle the complex paperwork and procedures so you can focus on planning your trip.',
    },
    {
      id: '2',
      question: 'How long does visa processing take?',
      answer: 'Processing times vary by country and visa type. Tourist visas typically take 5-15 business days, while work or study visas may take 2-8 weeks. We provide estimated processing times for each visa type on the country information pages.',
    },
    {
      id: '3',
      question: 'What documents do I need for a visa application?',
      answer: 'Common requirements include a valid passport, application forms, photos, proof of financial means, travel itinerary, and accommodation details. Specific requirements vary by country and visa type.',
    },
    {
      id: '4',
      question: 'Can I track my visa application status?',
      answer: 'Yes! Once you submit your application through Permitsy, you\'ll receive access to our tracking system where you can monitor your application progress in real-time.',
    },
    {
      id: '5',
      question: 'What if my visa application is rejected?',
      answer: 'In case of rejection, we provide guidance on the reasons and assist with reapplication if possible. Some countries offer appeal processes which we can help navigate. We also offer partial refunds according to our refund policy.',
    },
  ];

  return (
    <Accordion type="single" collapsible className="w-full">
      {defaultFAQs.map((faq, index) => (
        <AccordionItem value={`item-${index}`} key={faq.id}>
          <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
          <AccordionContent>
            <p>{faq.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FAQ;
