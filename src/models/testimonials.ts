
import { supabase } from '@/integrations/supabase/client';

export type Testimonial = {
  id: string;
  client_name: string;
  country: string;
  visa_type: string;
  rating: number;
  comment: string;
  avatar_url?: string;
  approved: boolean;
  created_at: string;
  updated_at?: string;
};

export type ApprovedVisa = {
  id: string;
  country: string;
  destination: string;
  visa_type: string;
  visa_category: string;
  duration: string;
  image_url: string;
  approval_date: string;
  client_id?: string; // Optional reference to a client
  created_at: string;
  updated_at?: string;
};

export const getTestimonials = async (onlyApproved: boolean = true) => {
  try {
    let query = supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (onlyApproved) {
      query = query.eq('approved', true);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as Testimonial[];
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
};

export const getApprovedVisas = async () => {
  try {
    const { data, error } = await supabase
      .from('approved_visas')
      .select('*')
      .order('approval_date', { ascending: false });
    
    if (error) throw error;
    return data as ApprovedVisa[];
  } catch (error) {
    console.error("Error fetching approved visas:", error);
    return [];
  }
};

export const addTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .insert(testimonial)
      .select('*')
      .single();
      
    if (error) throw error;
    return data as Testimonial;
  } catch (error) {
    console.error("Error adding testimonial:", error);
    throw error;
  }
};

export const updateTestimonialStatus = async (id: string, approved: boolean) => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .update({ approved })
      .eq('id', id)
      .select('*')
      .single();
      
    if (error) throw error;
    return data as Testimonial;
  } catch (error) {
    console.error(`Error updating testimonial status (ID: ${id}):`, error);
    throw error;
  }
};

export const addApprovedVisa = async (visa: Omit<ApprovedVisa, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('approved_visas')
      .insert(visa)
      .select('*')
      .single();
      
    if (error) throw error;
    return data as ApprovedVisa;
  } catch (error) {
    console.error("Error adding approved visa:", error);
    throw error;
  }
};

export const deleteApprovedVisa = async (id: string) => {
  try {
    const { error } = await supabase
      .from('approved_visas')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting approved visa (ID: ${id}):`, error);
    throw error;
  }
};
