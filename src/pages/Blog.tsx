
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BlogCard } from '@/components/blog/BlogCard';
import { Blog as BlogType, transformToBlogs } from '@/types/blog';

const Blog = () => {
  const { data: blogs, isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return transformToBlogs(data || []) as BlogType[];
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Latest updates, guides, and insights about visa processes
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs?.map((blog) => (
            <BlogCard
              key={blog.id}
              id={blog.id}
              title={blog.title}
              excerpt={blog.excerpt}
              slug={blog.slug}
              featuredImage={blog.featured_image}
              publishedAt={blog.published_at}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
