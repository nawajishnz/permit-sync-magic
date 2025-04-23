
// Simple placeholder for contact API
import { supabase } from '@/integrations/supabase/client';

export async function handleContactForm(data: {
  name: string;
  email: string;
  message: string;
  subject?: string;
}) {
  try {
    // Instead of using a non-existent table, store messages in a more generic way
    // or create the table first if needed
    const { error } = await supabase
      .from('profiles')  // Using an existing table as fallback
      .insert({
        // Store contact form as metadata in an existing table
        full_name: data.name,
        email: data.email,
        contact_message: data.message,
        contact_subject: data.subject || 'Website Contact Form',
        contact_status: 'new'
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
