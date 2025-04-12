import { supabase } from '@/integrations/supabase/client';

export type LegalPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  last_updated: string;
  created_at?: string;
};

// Function to create the legal_pages table if it doesn't exist
export const createLegalPagesTable = async () => {
  try {
    const { error } = await supabase.rpc('create_legal_pages_table');
    if (error) {
      console.error('Error creating legal_pages table:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Unexpected error creating legal_pages table:', error);
    return false;
  }
};

export const getLegalPages = async (): Promise<LegalPage[]> => {
  try {
    const { data, error } = await supabase
      .from('legal_pages')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      console.error('Error fetching legal pages:', error);
      return [];
    }

    return data as LegalPage[] || [];
  } catch (error) {
    console.error('Unexpected error fetching legal pages:', error);
    return [];
  }
};

export const getLegalPageBySlug = async (slug: string): Promise<LegalPage | null> => {
  try {
    const { data, error } = await supabase
      .from('legal_pages')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      throw error;
    }

    return data as LegalPage;
  } catch (error) {
    console.error(`Error fetching legal page with slug ${slug}:`, error);
    return null;
  }
};

export const updateLegalPage = async (
  id: string,
  updates: Partial<LegalPage>
): Promise<LegalPage | null> => {
  try {
    const updatedData = {
      ...updates,
      last_updated: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('legal_pages')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as LegalPage;
  } catch (error) {
    console.error(`Error updating legal page with id ${id}:`, error);
    return null;
  }
};

export const createLegalPage = async (
  page: Omit<LegalPage, 'id' | 'created_at'>
): Promise<LegalPage | null> => {
  try {
    const { data, error } = await supabase
      .from('legal_pages')
      .insert({
        ...page,
        last_updated: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as LegalPage;
  } catch (error) {
    console.error('Error creating legal page:', error);
    return null;
  }
};

export const deleteLegalPage = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('legal_pages')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting legal page with id ${id}:`, error);
    return false;
  }
}; 