
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
    return data;
  } catch (error) {
    console.error("Error fetching addon services:", error);
    throw error;
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
    throw error;
  }
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
