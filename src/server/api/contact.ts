
import { supabase } from '@/integrations/supabase/client';

export async function handleContactForm(data: {
  name: string;
  email: string;
  message: string;
  subject?: string;
}) {
  try {
    // Use RPC function to submit contact message
    const { data: result, error } = await supabase.rpc('submit_contact_message', {
      p_name: data.name,
      p_email: data.email, 
      p_message: data.message,
      p_subject: data.subject || 'Website Contact Form'
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
