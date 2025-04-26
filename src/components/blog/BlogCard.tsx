
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Calendar } from 'lucide-react';

interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  featuredImage: string;
  publishedAt: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  title,
  excerpt,
  slug,
  featuredImage,
  publishedAt,
}) => {
  const date = new Date(publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <Link to={`/blog/${slug}`}>
        <AspectRatio ratio={16/9} className="bg-gray-100">
          <img
            src={featuredImage}
            alt={title}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        </AspectRatio>
        <CardContent className="p-6">
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <Calendar className="w-4 h-4 mr-2" />
            {date}
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 line-clamp-2">
            {title}
          </h3>
          <p className="text-gray-600 line-clamp-3">
            {excerpt}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
};
