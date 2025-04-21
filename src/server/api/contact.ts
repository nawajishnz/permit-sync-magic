
// Simple placeholder for contact API without Next.js dependency
import { supabase } from '@/integrations/supabase/client';

export async function handleContactForm(data: {
  name: string;
  email: string;
  message: string;
  subject?: string;
}) {
  try {
    // Store contact message in Supabase
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
    
    return { success: true };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}
