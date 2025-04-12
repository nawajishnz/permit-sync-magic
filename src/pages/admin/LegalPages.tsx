import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileEdit, Plus, Trash2, Eye, Save, Database } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { 
  getLegalPages, 
  getLegalPageBySlug, 
  updateLegalPage, 
  createLegalPage, 
  deleteLegalPage, 
  type LegalPage 
} from '@/models/legal_pages';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const AdminLegalPages: React.FC = () => {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Partial<LegalPage>>({
    title: '',
    slug: '',
    content: '',
  });
  const [editorContent, setEditorContent] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        console.log('Fetching legal pages...');
        
        // Debug: directly attempt to query the table using Supabase client
        try {
          const { data: directData, error: directError } = await supabase
            .from('legal_pages')
            .select('*');
          
          console.log('Direct query results:', { data: directData, error: directError });
        } catch (directErr) {
          console.error('Direct query error:', directErr);
        }
        
        const data = await getLegalPages();
        console.log('Legal pages data from service:', data);
        setPages(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching legal pages:', err);
        setError('Failed to fetch legal pages. The database table might not exist yet.');
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  const handleSavePage = async () => {
    try {
      if (!currentPage.title || !currentPage.slug || !editorContent) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      const pageData = {
        ...currentPage,
        content: editorContent,
        last_updated: new Date().toISOString(),
      } as LegalPage;

      let result;

      if (isEditMode && currentPage.id) {
        result = await updateLegalPage(currentPage.id, pageData);
        if (result) {
          setPages(prevPages => 
            prevPages.map(page => page.id === result?.id ? result : page)
          );
          toast({
            title: 'Page Updated',
            description: `${pageData.title} has been updated successfully.`,
          });
        }
      } else {
        result = await createLegalPage(pageData);
        if (result) {
          setPages(prevPages => [...prevPages, result as LegalPage]);
          toast({
            title: 'Page Created',
            description: `${pageData.title} has been created successfully.`,
          });
        }
      }

      if (result) {
        setIsEditorOpen(false);
        resetForm();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save page. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePage = async () => {
    try {
      if (currentPage.id) {
        const success = await deleteLegalPage(currentPage.id);
        if (success) {
          setPages(prevPages => 
            prevPages.filter(page => page.id !== currentPage.id)
          );
          toast({
            title: 'Page Deleted',
            description: `${currentPage.title} has been deleted successfully.`,
          });
          setIsDeleteDialogOpen(false);
          resetForm();
        } else {
          toast({
            title: 'Error',
            description: 'Failed to delete page. Please try again.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setCurrentPage({
      title: '',
      slug: '',
      content: '',
    });
    setEditorContent('');
    setIsEditMode(false);
  };

  const openEditorForNewPage = () => {
    resetForm();
    setIsEditMode(false);
    setIsEditorOpen(true);
  };

  const openEditorForEditPage = (page: LegalPage) => {
    setCurrentPage(page);
    setEditorContent(page.content);
    setIsEditMode(true);
    setIsEditorOpen(true);
  };

  const openPreviewDialog = (page: LegalPage) => {
    setCurrentPage(page);
    setIsPreviewOpen(true);
  };

  const openDeleteDialog = (page: LegalPage) => {
    setCurrentPage(page);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toLowerCase()
      .replace(/\s+/g, '-')  // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '');  // Remove special characters
    
    setCurrentPage({
      ...currentPage,
      slug: value,
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setCurrentPage({
      ...currentPage,
      title,
    });
    
    // Only auto-generate slug if this is a new page and slug hasn't been manually changed
    if (!isEditMode && !currentPage.slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      setCurrentPage(prev => ({
        ...prev,
        title,
        slug: generatedSlug,
      }));
    } else {
      setCurrentPage(prev => ({
        ...prev,
        title,
      }));
    }
  };

  // Function to create the legal_pages table
  const createTable = async () => {
    try {
      // Direct approach to create the table
      let hasCreatedTable = false;
      
      // First try to add the test page - if successful, it means the table exists
      // If we get a specific error, it indicates the table doesn't exist
      const { data, error } = await supabase.from('legal_pages').insert({
        title: 'Terms of Service',
        slug: 'terms-of-service',
        content: '<h1>Terms of Service</h1><p>This is a sample terms of service page that you can edit.</p>',
        last_updated: new Date().toISOString()
      }).select();
      
      if (!error) {
        // Success means the table already exists and we added a record
        toast({
          title: 'Success',
          description: 'Added a sample legal page successfully!',
        });
        
        // Refresh the data
        const newData = await getLegalPages();
        setPages(newData || []);
        setError(null);
        return;
      }
      
      if (error && error.code === '42P01') {
        // Table doesn't exist - need to tell user to create it in Supabase dashboard
        toast({
          title: 'Database Setup Required',
          description: 'The legal_pages table does not exist. You need to create it in the Supabase dashboard.',
          variant: 'destructive',
        });
        
        // Display instructions for the user
        setError(`
          Please go to your Supabase dashboard, open the SQL Editor, and run the following query:
          
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
          
          CREATE TABLE IF NOT EXISTS legal_pages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            content TEXT NOT NULL,
            last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Grant permissions
          GRANT ALL ON legal_pages TO authenticated;
          GRANT ALL ON legal_pages TO anon;
          
          -- Enable RLS
          ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Enable read access for all users" ON legal_pages
            FOR SELECT USING (true);
          
          CREATE POLICY "Enable insert for all users" ON legal_pages
            FOR INSERT WITH CHECK (true);
          
          CREATE POLICY "Enable update for all users" ON legal_pages
            FOR UPDATE USING (true);
          
          CREATE POLICY "Enable delete for all users" ON legal_pages
            FOR DELETE USING (true);
          
          -- Insert test record
          INSERT INTO legal_pages (title, slug, content, last_updated)
          VALUES ('Terms of Service', 'terms-of-service', '<h1>Terms of Service</h1><p>This is a sample terms of service page.</p>', NOW());
        `);
        
        return;
      }
      
      // Some other error occurred
      toast({
        title: 'Error',
        description: 'An unexpected error occurred: ' + error.message,
        variant: 'destructive',
      });
      
    } catch (err) {
      console.error('Error in createTable:', err);
      toast({
        title: 'Error',
        description: 'Failed to create the table.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manage Legal Pages</CardTitle>
            <CardDescription>
              Create and manage legal content such as Terms of Service, Privacy Policy, etc.
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={createTable}>
              <Database className="mr-2 h-4 w-4" />
              Fix Database
            </Button>
            <Button onClick={openEditorForNewPage}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Page
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-amber-600 mb-4">{error.includes('CREATE EXTENSION') ? 'Please run the following SQL in your Supabase dashboard:' : error}</p>
              
              {error.includes('CREATE EXTENSION') && (
                <div className="bg-gray-100 p-4 rounded-md text-left overflow-x-auto">
                  <pre className="text-xs whitespace-pre-wrap">
                    {error.trim()}
                  </pre>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      navigator.clipboard.writeText(error.trim());
                      toast({
                        title: 'Copied',
                        description: 'SQL code copied to clipboard',
                      });
                    }}
                  >
                    Copy SQL to Clipboard
                  </Button>
                </div>
              )}
              
              <p className="mt-4 text-sm">After running the SQL, refresh this page and try again.</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>No legal pages found. Create your first legal page using the 'Add New Page' button.</p>
            </div>
          ) : (
            <Table>
              <TableCaption>List of legal pages on your site</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>{page.slug}</TableCell>
                    <TableCell>{formatDate(page.last_updated)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openPreviewDialog(page)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditorForEditPage(page)}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive"
                          onClick={() => openDeleteDialog(page)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit Legal Page' : 'Create New Legal Page'}
            </DialogTitle>
            <DialogDescription>
              Make changes to the content of this legal page.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title *
              </Label>
              <Input
                id="title"
                value={currentPage.title}
                onChange={handleTitleChange}
                className="col-span-3"
                placeholder="e.g., Terms of Service"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">
                Slug *
              </Label>
              <Input
                id="slug"
                value={currentPage.slug}
                onChange={handleSlugChange}
                className="col-span-3"
                placeholder="e.g., terms-of-service"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right pt-2">
                Content *
              </Label>
              <div className="col-span-3">
                <RichTextEditor 
                  content={editorContent} 
                  onChange={setEditorContent} 
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePage}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentPage.title}</DialogTitle>
            <DialogDescription>
              Preview of how the page will appear to users
            </DialogDescription>
          </DialogHeader>
          
          <Separator />
          
          <div className="py-4 prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: currentPage.content || '' }} />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close Preview</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentPage.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePage}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLegalPages; 