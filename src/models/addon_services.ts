
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
  const { data, error } = await supabase
    .from('addon_services')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data;
};

export const getAddonServiceById = async (id: string) => {
  const { data, error } = await supabase
    .from('addon_services')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};

export const createAddonService = async (service: Omit<AddonService, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('addon_services')
    .insert(service)
    .select('*')
    .single();
    
  if (error) throw error;
  return data;
};

export const updateAddonService = async (id: string, updates: Partial<AddonService>) => {
  const { data, error } = await supabase
    .from('addon_services')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteAddonService = async (id: string) => {
  const { error } = await supabase
    .from('addon_services')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
};
