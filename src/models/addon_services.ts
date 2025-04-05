
import { supabase } from '@/integrations/supabase/client';

export type AddonService = {
  id: string;
  name: string;
  description: string;
  long_description?: string;
  price: string;
  delivery_days: number;
  discount_percentage?: number;
  image_url: string;
  requirements?: string[];
  process?: string[];
  faqs?: { question: string; answer: string }[];
  created_at?: string;
  updated_at?: string;
};

export const getAddonServices = async () => {
  try {
    const { data, error } = await supabase
      .from('addon_services')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    // Provide default sample data if no data is returned
    if (!data || data.length === 0) {
      return getSampleAddonServices();
    }
    
    return data as AddonService[];
  } catch (error) {
    console.error("Error fetching addon services:", error);
    // Return sample data as fallback
    return getSampleAddonServices();
  }
};

export const getAddonServiceById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('addon_services')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    return data as AddonService;
  } catch (error) {
    console.error(`Error fetching addon service with id ${id}:`, error);
    // Return a sample service that matches the ID as fallback
    const sampleServices = getSampleAddonServices();
    const matchingService = sampleServices.find(service => service.id === id);
    if (matchingService) return matchingService;
    
    // If no matching service is found, return the first sample service
    return sampleServices[0];
  }
};

// Sample addon services data as fallback
export const getSampleAddonServices = (): AddonService[] => {
  return [
    {
      id: '1',
      name: 'Rental Agreement',
      description: 'Legal documentation for property rental with verified attestation',
      price: '1200',
      delivery_days: 3,
      discount_percentage: 20,
      image_url: '/lovable-uploads/dbcd3c53-8e2f-44b0-bc5b-d246022d31f0.png',
      long_description: 'Our rental agreement service provides you with a legally binding document that protects both tenant and landlord interests. All agreements are verified by legal experts and meet the requirements for visa applications.',
      requirements: [
        'Proof of identity (passport or ID card)',
        'Property details',
        'Landlord contact information',
        'Lease terms (duration, amount, etc.)'
      ],
      process: [
        'Submit your details through our secure form',
        'Our legal team drafts the agreement according to local laws',
        'Both parties review and approve the document',
        'Final agreement is delivered with official attestation'
      ],
      faqs: [
        {
          question: 'How long does it take to get the rental agreement?',
          answer: 'Standard processing time is 3 business days. Express service is available for urgent needs.'
        },
        {
          question: 'Is the rental agreement legally binding?',
          answer: 'Yes, all agreements are drafted by legal professionals and are legally binding in the relevant jurisdiction.'
        },
        {
          question: 'Can I make changes after the agreement is created?',
          answer: 'Minor changes can be accommodated within 48 hours of delivery at no extra charge.'
        }
      ]
    },
    {
      id: '2',
      name: 'Hotel Booking',
      description: 'Premium hotel reservation service with guaranteed confirmation',
      price: '800',
      delivery_days: 2,
      discount_percentage: 15,
      image_url: '/lovable-uploads/8c33eeef-863c-461b-9170-b1c79770cab1.png',
      long_description: 'Our hotel booking service ensures you have guaranteed reservation documentation needed for visa applications. We provide bookings at competitive rates with free cancellation options to give you flexibility.',
      requirements: [
        'Travel dates',
        'Destination city',
        'Preferred hotel category (3-5 star)',
        'Number of travelers'
      ],
      process: [
        'Provide your trip details and preferences',
        'Receive multiple hotel options within your budget',
        'Select your preferred accommodation',
        'Receive booking confirmation and visa-ready documentation'
      ],
      faqs: [
        {
          question: 'Can I cancel the hotel booking after getting my visa?',
          answer: 'Yes, all our bookings come with free cancellation up to 48 hours before check-in.'
        },
        {
          question: 'Do you offer bookings for specific hotel chains?',
          answer: 'Yes, we can arrange bookings with most major international and local hotel chains based on your preference.'
        },
        {
          question: 'Are the hotel prices competitive compared to booking directly?',
          answer: 'We offer competitive rates and often have access to special discounts not available to the general public.'
        }
      ]
    },
    {
      id: '3',
      name: 'Flight Tickets',
      description: 'Discounted international flight booking with flexible changes',
      price: '800',
      delivery_days: 1,
      discount_percentage: 10,
      image_url: '/lovable-uploads/8c33eeef-863c-461b-9170-b1c79770cab1.png',
      long_description: 'Our flight booking service provides you with the necessary flight itinerary documentation for your visa application. We offer competitive rates and flexible booking options that allow for changes as needed.',
      requirements: [
        'Valid passport details',
        'Travel dates',
        'Destination',
        'Preferred airlines (optional)',
        'Seating preferences (optional)'
      ],
      process: [
        'Submit your travel requirements',
        'Receive multiple flight options',
        'Select your preferred flight',
        'Receive booking confirmation and documentation for visa'
      ],
      faqs: [
        {
          question: 'Can I change my flight dates after booking?',
          answer: 'Yes, all bookings come with one free date change (fare difference may apply).'
        },
        {
          question: 'Do I need to pay for the actual ticket for visa purposes?',
          answer: 'For visa applications, we can provide a verifiable itinerary without full payment, or a fully paid ticket based on your needs.'
        },
        {
          question: 'Can you book multi-city or complex international routes?',
          answer: 'Yes, we specialize in handling complex international itineraries and multi-city routes.'
        }
      ]
    },
    {
      id: '4',
      name: 'Police Clearance Certificate',
      description: 'Official criminal record verification from authorities',
      price: '2500',
      delivery_days: 7,
      discount_percentage: 5,
      image_url: '/lovable-uploads/8c33eeef-863c-461b-9170-b1c79770cab1.png',
      long_description: 'Our Police Clearance Certificate (PCC) service handles the complete process of obtaining your police clearance document required for many visa applications. We liaise with relevant authorities to ensure your certificate is issued without delays.',
      requirements: [
        'Passport copy',
        'Proof of address',
        'Passport-sized photographs',
        'Application form (we will help you complete this)'
      ],
      process: [
        'Submit your documents through our platform',
        'We prepare and file your application with authorities',
        'Follow up on processing status',
        'Deliver the certificate once issued'
      ],
      faqs: [
        {
          question: 'How long is the Police Clearance Certificate valid?',
          answer: 'Typically 6 months from the date of issue, but this varies by country and visa type.'
        },
        {
          question: 'Do I need to appear in person at any point?',
          answer: 'For some countries, biometric verification may be required. We will inform you if your physical presence is necessary.'
        },
        {
          question: 'Can you expedite the processing time?',
          answer: 'Yes, we offer express processing at an additional fee, subject to availability from the issuing authority.'
        }
      ]
    },
    {
      id: '5',
      name: 'Document Attestation',
      description: 'Professional attestation service for all document types',
      price: '1500',
      delivery_days: 5,
      discount_percentage: 10,
      image_url: '/lovable-uploads/8c33eeef-863c-461b-9170-b1c79770cab1.png',
      long_description: 'Our document attestation service ensures your important documents meet legal requirements for international recognition. We handle attestation from government departments, embassies, and consulates.',
      requirements: [
        'Original documents or notarized copies',
        'Document type details',
        'Country where documents will be used',
        'Purpose of attestation'
      ],
      process: [
        'Submit your documents',
        'Initial verification and preparation',
        'Submission to relevant authorities for attestation',
        'Quality check and delivery of attested documents'
      ],
      faqs: [
        {
          question: 'What types of documents can you attest?',
          answer: 'We can attest educational certificates, marriage certificates, birth certificates, commercial documents, and more.'
        },
        {
          question: 'Do I need to submit original documents?',
          answer: 'For most attestations, yes. However, some authorities accept notarized copies. We will advise based on your specific requirements.'
        },
        {
          question: 'Is apostille service also available?',
          answer: 'Yes, we offer apostille services for countries that are part of the Hague Convention.'
        }
      ]
    },
    {
      id: '6',
      name: 'Transcript',
      description: 'Official academic transcript processing service',
      price: '1800',
      delivery_days: 10,
      discount_percentage: 0,
      image_url: '/lovable-uploads/8c33eeef-863c-461b-9170-b1c79770cab1.png',
      long_description: 'Our transcript service helps you obtain official academic transcripts from your educational institutions. We handle the entire process including verification, authentication, and international formatting if required.',
      requirements: [
        'Educational institution details',
        'Years of study',
        'Student ID or roll number',
        'Proof of identity'
      ],
      process: [
        'Submit your request with educational details',
        'We contact the institution and initiate the request',
        'Follow up until the transcript is issued',
        'Secure delivery of official transcripts'
      ],
      faqs: [
        {
          question: 'Can you get transcripts from any university?',
          answer: 'We can process transcripts from most recognized universities and colleges worldwide. Some institutions may have specific requirements.'
        },
        {
          question: 'Do you provide sealed transcripts as required by some embassies?',
          answer: 'Yes, we ensure transcripts are delivered in sealed envelopes when required for official purposes.'
        },
        {
          question: 'Can you handle urgent transcript requests?',
          answer: 'Yes, we offer expedited services for urgent cases, though this depends on the institution\'s capabilities.'
        }
      ]
    },
    {
      id: '7',
      name: 'Travel Insurance',
      description: 'Comprehensive travel insurance with worldwide coverage',
      price: '600',
      delivery_days: 1,
      discount_percentage: 5,
      image_url: '/lovable-uploads/8c33eeef-863c-461b-9170-b1c79770cab1.png',
      long_description: 'Our travel insurance service provides comprehensive coverage that meets visa requirements. Get protection against medical emergencies, trip cancellations, lost luggage, and more with policies tailored to your specific journey.',
      requirements: [
        'Travel dates',
        'Destination countries',
        'Traveler information',
        'Coverage preferences'
      ],
      process: [
        'Select your coverage type and trip details',
        'Receive instant quote and policy options',
        'Complete the payment',
        'Receive your policy certificate immediately'
      ],
      faqs: [
        {
          question: 'Does the insurance cover COVID-19 related issues?',
          answer: 'Yes, our policies include COVID-19 coverage for medical expenses and trip interruptions where applicable.'
        },
        {
          question: 'Can I extend my insurance if I decide to stay longer?',
          answer: 'Yes, most policies can be extended while you're abroad, subject to approval and additional premium.'
        },
        {
          question: 'Is the policy certificate sufficient for visa application?',
          answer: 'Yes, our insurance certificates are designed to meet the requirements of embassies and consulates worldwide.'
        }
      ]
    },
    {
      id: '8',
      name: 'Passport Registration/Renew',
      description: 'Fast-track passport registration and renewal service',
      price: '3500',
      delivery_days: 14,
      discount_percentage: 0,
      image_url: '/lovable-uploads/8c33eeef-863c-461b-9170-b1c79770cab1.png',
      long_description: 'Our passport service simplifies the complex process of passport application or renewal. We provide end-to-end assistance from documentation preparation to follow-up with passport authorities to ensure timely processing.',
      requirements: [
        'Completed application form',
        'Passport-sized photographs',
        'Proof of identity and citizenship',
        'Supporting documents as per country requirements'
      ],
      process: [
        'Document preparation and verification',
        'Application submission to passport office',
        'Regular status updates throughout processing',
        'Secure delivery of new passport'
      ],
      faqs: [
        {
          question: 'Can you expedite the passport issuance process?',
          answer: 'Yes, we offer premium fast-track services where available, reducing waiting times significantly.'
        },
        {
          question: 'Do you handle passport services for all nationalities?',
          answer: 'We currently support passport services for select countries. Please contact us to confirm availability for your specific nationality.'
        },
        {
          question: 'What if additional documents are requested during processing?',
          answer: 'We will immediately notify you and provide guidance on obtaining and submitting any additional required documents.'
        }
      ]
    }
  ];
};

export const createAddonService = async (service: Omit<AddonService, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('addon_services')
      .insert(service)
      .select('*')
      .single();
      
    if (error) throw error;
    return data as AddonService;
  } catch (error) {
    console.error("Error creating addon service:", error);
    throw error;
  }
};

export const updateAddonService = async (id: string, updates: Partial<AddonService>) => {
  try {
    const { data, error } = await supabase
      .from('addon_services')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
      
    if (error) throw error;
    return data as AddonService;
  } catch (error) {
    console.error(`Error updating addon service with id ${id}:`, error);
    throw error;
  }
};

export const deleteAddonService = async (id: string) => {
  try {
    const { error } = await supabase
      .from('addon_services')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting addon service with id ${id}:`, error);
    throw error;
  }
};
