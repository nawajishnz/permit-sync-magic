
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useApiMutation } from '@/hooks/useApiMutations';
import { Blog } from '@/types/blog';
import { getAllBlogs, deleteBlog, updateBlog, createBlog } from '@/services/blogsService';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';

const blogFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  featured_image: z.string().url('Must be a valid URL'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

const BlogsManager = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  
  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      featured_image: '',
      slug: '',
    },
  });
  
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

  const updateBlogMutation = useApiMutation<Blog, { id: string, data: Partial<Blog> }, Error>({
    mutationFn: async ({ id, data }) => {
      return await updateBlog(id, data);
    },
    queryKeysToInvalidate: ['admin-blogs', 'blogs', 'recentBlogs'],
    onSuccessMessage: 'Blog post updated successfully',
    onErrorMessage: 'Failed to update blog post',
  });
  
  const createBlogMutation = useApiMutation<
    Blog, 
    Omit<Blog, 'id' | 'created_at' | 'updated_at'>, 
    Error
  >({
    mutationFn: async (data) => {
      return await createBlog(data);
    },
    queryKeysToInvalidate: ['admin-blogs', 'blogs', 'recentBlogs'],
    onSuccessMessage: 'Blog post created successfully',
    onErrorMessage: 'Failed to create blog post',
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      await deleteBlogMutation.mutateAsync(id);
    }
  };

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    form.reset({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      featured_image: blog.featured_image,
      slug: blog.slug,
    });
    setIsEditing(true);
  };
  
  const handleCreateNew = () => {
    setSelectedBlog(null);
    form.reset({
      title: '',
      excerpt: '',
      content: '',
      featured_image: '',
      slug: '',
    });
    setIsCreating(true);
  };

  const onSubmitEdit = async (values: BlogFormValues) => {
    if (!selectedBlog) return;
    
    try {
      await updateBlogMutation.mutateAsync({
        id: selectedBlog.id,
        data: values,
      });
      
      setIsEditing(false);
      setSelectedBlog(null);
    } catch (error) {
      console.error('Error updating blog:', error);
    }
  };
  
  const onSubmitCreate = async (values: BlogFormValues) => {
    try {
      await createBlogMutation.mutateAsync({
        ...values,
        author_id: 'auth0|123456789', // In a real app, this would come from the logged-in user
        published_at: new Date().toISOString(),
      });
      
      setIsCreating(false);
      form.reset();
    } catch (error) {
      console.error('Error creating blog:', error);
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
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus size={16} />
          Create New Post
        </Button>
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEdit(blog)}
              >
                Edit
              </Button>
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

      {/* Edit Blog Dialog */}
      <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Blog title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="blog-post-slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Short excerpt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[150px]" placeholder="Blog content" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="featured_image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={updateBlogMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateBlogMutation.isPending}
                >
                  {updateBlogMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Create Blog Dialog */}
      <Dialog open={isCreating} onOpenChange={(open) => !open && setIsCreating(false)}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Create New Blog Post</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitCreate)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Blog title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="blog-post-slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Short excerpt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[150px]" placeholder="Blog content" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="featured_image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreating(false)}
                  disabled={createBlogMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createBlogMutation.isPending}
                >
                  {createBlogMutation.isPending ? 'Creating...' : 'Create Post'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogsManager;
