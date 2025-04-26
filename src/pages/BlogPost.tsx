
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBlogBySlug } from '@/services/blogsService';
import { ArrowLeft } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const { data: blog, isLoading, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      if (!slug) return null;
      const result = await getBlogBySlug(slug);
      console.log("Blog fetched:", result); // Debug log
      return result;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-pulse space-y-6 max-w-3xl w-full p-6">
          <div className="h-8 bg-gray-200 rounded w-2/3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    console.error("Error loading blog post:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Blog Post Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find the blog post you're looking for.</p>
          <Button onClick={() => navigate('/blog')}>Back to Blog</Button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(blog.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <Link to="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to all blogs
        </Link>
        
        <article className="bg-white rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto">
          {blog.featured_image && (
            <AspectRatio ratio={16/9}>
              <img 
                src={blog.featured_image} 
                alt={blog.title} 
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          )}
          
          <div className="p-6 md:p-8">
            <div className="text-sm text-gray-500 mb-3">
              {formattedDate}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {blog.title}
            </h1>
            
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-6 text-lg font-medium">
                {blog.excerpt}
              </p>
              
              <div className="text-gray-700 whitespace-pre-wrap">
                {blog.content}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogPost;
