
import { supabase } from '@/integrations/supabase/client';

export async function handleContactForm(data: {
  name: string;
  email: string;
  message: string;
  subject?: string;
}) {
  try {
    // Use the contact_messages table that exists in our schema
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: data.name,
        email: data.email,
        message: data.message,
        subject: data.subject || 'Website Contact Form',
        status: 'new'
      });

    if (error) throw error;
    
    console.log('Contact form submitted:', data);
    
    return { success: true };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}
