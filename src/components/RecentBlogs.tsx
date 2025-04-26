
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BlogCard } from './blog/BlogCard';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { Database } from '@/types/supabase';

type Blog = Database['public']['Tables']['blogs']['Row'];

export const RecentBlogs = () => {
  const { data: blogs, isLoading } = useQuery({
    queryKey: ['recentBlogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data as Blog[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-t-lg"></div>
            <div className="p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Updates</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed with our latest visa news and travel insights
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
        
        <div className="text-center">
          <Link to="/blog">
            <Button variant="outline" size="lg" className="group">
              View All Posts
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
