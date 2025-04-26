
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BlogCard } from '@/components/blog/BlogCard';
import { getAllBlogs } from '@/services/blogsService';
import { Blog as BlogType } from '@/types/blog';

const Blog = () => {
  const { data: blogs, isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      return await getAllBlogs();
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
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
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
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Blog;
