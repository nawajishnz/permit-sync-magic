
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useSupabaseDelete, useSupabaseInsert, useSupabaseUpdate } from '@/hooks/useSupabaseMutation';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/types/supabase';

type Blog = Database['public']['Tables']['blogs']['Row'];

const BlogsManager = () => {
  const { toast } = useToast();
  
  const { data: blogs, isLoading } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data as Blog[];
    },
  });

  const deleteBlog = useSupabaseDelete({
    table: 'blogs',
    queryKey: ['admin-blogs'],
    successMessage: 'Blog post deleted successfully',
    errorMessage: 'Failed to delete blog post',
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      await deleteBlog.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Blog Posts</h2>
        <Button>Create New Post</Button>
      </div>
      
      <div className="grid gap-4">
        {blogs?.map((blog) => (
          <div key={blog.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="font-medium">{blog.title}</h3>
              <p className="text-sm text-gray-500">
                Published: {new Date(blog.published_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Edit</Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDelete(blog.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogsManager;
