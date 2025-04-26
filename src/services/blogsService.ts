
import { Blog } from '@/types/blog';

// Mock blog data since we don't have a blogs table in Supabase
const mockBlogs: Blog[] = [
  {
    id: '1',
    title: 'Complete Guide to Tourist Visas',
    slug: 'complete-guide-tourist-visas',
    content: 'Tourist visas are entry permits issued to individuals who want to visit a country for leisure, sightseeing, and recreational activities. Most tourist visas are valid for a short period, typically ranging from 30 to 90 days, depending on the country\'s regulations.',
    excerpt: 'Everything you need to know about applying for a tourist visa',
    featured_image: 'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    author_id: 'auth0|123456789',
    published_at: '2023-08-15T09:00:00Z',
    created_at: '2023-08-10T14:30:00Z',
    updated_at: '2023-08-14T16:45:00Z'
  },
  {
    id: '2',
    title: 'Business Visa Requirements for European Countries',
    slug: 'business-visa-requirements-european-countries',
    content: 'When planning a business trip to Europe, it\'s essential to understand the visa requirements for each country. European business visas typically require an invitation letter from a company in the destination country, proof of sufficient funds, and a detailed travel itinerary.',
    excerpt: 'Learn about the essential requirements for obtaining a business visa to European countries',
    featured_image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    author_id: 'auth0|987654321',
    published_at: '2023-09-05T10:30:00Z',
    created_at: '2023-09-01T08:15:00Z',
    updated_at: '2023-09-04T17:20:00Z'
  },
  {
    id: '3',
    title: 'Changes to Student Visa Policies in 2023',
    slug: 'changes-student-visa-policies-2023',
    content: 'In 2023, several countries have updated their student visa policies to attract more international students. These changes include extended work permissions during studies, streamlined application processes, and post-graduation work opportunities.',
    excerpt: 'Important updates to student visa regulations coming into effect this year',
    featured_image: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    author_id: 'auth0|567891234',
    published_at: '2023-09-20T14:00:00Z',
    created_at: '2023-09-15T11:45:00Z',
    updated_at: '2023-09-19T09:30:00Z'
  },
  {
    id: '4',
    title: 'How to Prepare for Your Visa Interview',
    slug: 'how-prepare-visa-interview',
    content: 'A visa interview can be a nerve-wracking experience, but proper preparation can significantly increase your chances of approval. This guide covers common questions, required documents, and tips for making a positive impression on visa officers.',
    excerpt: 'Tips and strategies to help you ace your upcoming visa interview',
    featured_image: 'https://images.pexels.com/photos/5668859/pexels-photo-5668859.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    author_id: 'auth0|123456789',
    published_at: '2023-10-10T09:15:00Z',
    created_at: '2023-10-05T13:20:00Z',
    updated_at: '2023-10-09T16:00:00Z'
  },
  {
    id: '5',
    title: 'Digital Nomad Visas: A New Era of Remote Work',
    slug: 'digital-nomad-visas-new-era-remote-work',
    content: 'As remote work becomes increasingly common, many countries are introducing digital nomad visas to attract foreign professionals. These specialized visas allow individuals to live and work remotely in a foreign country for extended periods, typically from several months to a few years.',
    excerpt: 'Exploring the growing trend of visas designed for location-independent professionals',
    featured_image: 'https://images.pexels.com/photos/4065876/pexels-photo-4065876.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    author_id: 'auth0|987654321',
    published_at: '2023-11-01T11:45:00Z',
    created_at: '2023-10-25T09:30:00Z',
    updated_at: '2023-10-31T14:15:00Z'
  }
];

export const getAllBlogs = async (): Promise<Blog[]> => {
  // In a real application, this would fetch from Supabase
  // For now, we're using mock data
  return Promise.resolve([...mockBlogs]);
};

export const getRecentBlogs = async (limit: number = 3): Promise<Blog[]> => {
  // Sort by published_at and take only the specified number
  const sorted = [...mockBlogs].sort((a, b) => 
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
  return Promise.resolve(sorted.slice(0, limit));
};

export const getBlogBySlug = async (slug: string): Promise<Blog | undefined> => {
  return Promise.resolve(mockBlogs.find(blog => blog.slug === slug));
};

export const deleteBlog = async (id: string): Promise<void> => {
  // In a real application, this would delete from Supabase
  console.log(`Blog with id ${id} would be deleted`);
  return Promise.resolve();
};

export const updateBlog = async (id: string, blogData: Partial<Blog>): Promise<Blog> => {
  // In a real application, this would update the blog in Supabase
  // For now, we'll just log it
  console.log(`Blog with id ${id} would be updated with:`, blogData);
  
  // Find the blog index
  const blogIndex = mockBlogs.findIndex(blog => blog.id === id);
  
  if (blogIndex === -1) {
    throw new Error(`Blog with id ${id} not found`);
  }
  
  // Update the blog in our mock data (for demonstration purposes)
  const updatedBlog = {
    ...mockBlogs[blogIndex],
    ...blogData,
    updated_at: new Date().toISOString()
  };
  
  // In a real app with state management, we would update the mockBlogs array
  // mockBlogs[blogIndex] = updatedBlog;
  
  return Promise.resolve(updatedBlog);
};

// Additional methods for blog management would go here
