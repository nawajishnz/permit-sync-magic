
import React from 'react';
import { FAQItem } from '@/hooks/useCountryData';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FAQSectionProps {
  faq: FAQItem[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faq }) => {
  if (!faq || faq.length === 0) {
    return null;
  }

  return (
    <div className="my-6">
      <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
      <Accordion type="single" collapsible className="w-full">
        {faq.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left font-medium">
              {item.question}
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-gray-700">{item.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FAQSection;
