import { Database } from '@/types/supabase';
import { Json } from '@/types/supabase';

// Define a Blog type based on what the components are expecting
export type Blog = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  author_id: string;
  published_at: string;
  created_at: string;
  updated_at: string;
};

// These functions aren't needed with our new approach but we'll keep them
// for compatibility with any other code that might use them
export const transformToBlog = (data: any): Blog => {
  return {
    id: data.id,
    title: data.title || '',
    slug: data.slug || '',
    content: data.content || '',
    excerpt: data.excerpt || '',
    featured_image: data.featured_image || '',
    author_id: data.author_id || '',
    published_at: data.published_at || data.created_at,
    created_at: data.created_at,
    updated_at: data.updated_at || data.created_at
  };
};

export const transformToBlogs = (data: any[]): Blog[] => {
  return data.map(item => transformToBlog(item));
};
