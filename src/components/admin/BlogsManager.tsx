
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useApiMutation } from '@/hooks/useApiMutations';
import { useToast } from '@/hooks/use-toast';
import { Blog } from '@/types/blog';
import { getAllBlogs, deleteBlog } from '@/services/blogsService';

const BlogsManager = () => {
  const { toast } = useToast();
  
  const { data: blogs, isLoading } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: async () => {
      return await getAllBlogs();
    },
  });

  const deleteBlogMutation = useApiMutation<void, string, Error>({
    mutationFn: async (id: string) => {
      await deleteBlog(id);
      return;
    },
    queryKeysToInvalidate: ['admin-blogs', 'blogs', 'recentBlogs'],
    onSuccessMessage: 'Blog post deleted successfully',
    onErrorMessage: 'Failed to delete blog post',
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      await deleteBlogMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Manage Blog Posts</h2>
          <Button disabled>Create New Post</Button>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
