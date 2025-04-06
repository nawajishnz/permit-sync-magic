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
      image_url: 'https://images.pexels.com/photos/955395/pexels-photo-955395.jpeg'
    },
    {
      id: '2',
      name: 'Dummy Hotel Booking',
      description: 'Sample hotel reservation document for visa application purposes only (not a real booking)',
      price: '800',
      delivery_days: 2,
      discount_percentage: 15,
      image_url: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
      long_description: 'Our dummy hotel booking service provides a professionally formatted hotel reservation document for visa application purposes. This is NOT a real hotel booking - it is only for visa documentation purposes.',
      requirements: [
        'Travel dates',
        'Preferred hotel category (3-star, 4-star, etc.)',
        'City and area preferences',
        'Number of guests'
      ],
      process: [
        'Submit your requirements',
        'We prepare a professional hotel reservation document',
        'Document review and formatting',
        'Delivery within 2 business days'
      ],
      faqs: [
        {
          question: 'Is this a real hotel booking?',
          answer: 'No, this is NOT a real hotel booking. This service provides a dummy hotel reservation document for visa application purposes only.'
        },
        {
          question: 'Will I be able to stay at the hotel?',
          answer: 'No, this is a documentation service only. You will need to make actual hotel bookings separately for your stay.'
        },
        {
          question: 'Is this accepted for visa applications?',
          answer: 'Yes, our dummy booking documents are formatted to meet visa application requirements. However, some embassies may require actual hotel bookings.'
        }
      ]
    },
    {
      id: '3',
      name: 'Dummy Flight Tickets',
      description: 'Sample flight reservation document for visa application purposes only (not a real ticket)',
      price: '800',
      delivery_days: 1,
      discount_percentage: 10,
      image_url: 'https://images.pexels.com/photos/62623/wing-plane-flying-airplane-62623.jpeg',
      long_description: 'Our dummy flight ticket service provides a professionally formatted flight reservation document for visa application purposes. This is NOT a real flight ticket - it is only for visa documentation purposes.',
      requirements: [
        'Preferred travel dates',
        'Departure and arrival cities',
        'Preferred airlines (optional)',
        'Number of passengers'
      ],
      process: [
        'Submit your travel requirements',
        'We prepare a professional flight reservation document',
        'Document review and formatting',
        'Delivery within 24 hours'
      ],
      faqs: [
        {
          question: 'Is this a real flight ticket?',
          answer: 'No, this is NOT a real flight ticket. This service provides a dummy flight reservation document for visa application purposes only.'
        },
        {
          question: 'Can I board a flight with this document?',
          answer: 'No, this is a documentation service only. You will need to purchase actual flight tickets separately for your travel.'
        },
        {
          question: 'Is this accepted for visa applications?',
          answer: 'Yes, our dummy ticket documents are formatted to meet visa application requirements. However, some embassies may require actual flight bookings.'
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
      image_url: 'https://images.pexels.com/photos/4021256/pexels-photo-4021256.jpeg'
    },
    {
      id: '5',
      name: 'Document Attestation',
      description: 'Professional attestation service for all document types',
      price: '1500',
      delivery_days: 5,
      discount_percentage: 10,
      image_url: 'https://images.pexels.com/photos/95916/pexels-photo-95916.jpeg',
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
      image_url: 'https://images.pexels.com/photos/4778611/pexels-photo-4778611.jpeg',
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
      image_url: 'https://images.pexels.com/photos/3943882/pexels-photo-3943882.jpeg',
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
          answer: "Yes, most policies can be extended while you're abroad, subject to approval and additional premium."
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
      image_url: 'https://images.pexels.com/photos/4386442/pexels-photo-4386442.jpeg',
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
