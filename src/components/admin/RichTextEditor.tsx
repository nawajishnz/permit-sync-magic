import React from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import { 
  Bold, 
  Italic, 
  List, 
  Heading1, 
  Heading2, 
  Heading3, 
  Link as LinkIcon, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Undo, 
  Redo,
  Quote,
  MinusSquare,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Separator as UISeparator } from '../ui/separator';
import { Input } from '../ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from '../ui/dialog';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState('');
  const [linkText, setLinkText] = React.useState('');

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      // Update the link text if it's provided and no text is selected
      if (linkText && editor.state.selection.empty) {
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${linkUrl}">${linkText}</a>`)
          .run();
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: linkUrl })
          .run();
      }
    }

    // Reset states
    setLinkUrl('');
    setLinkText('');
    setIsLinkDialogOpen(false);
  };

  const openLinkDialog = () => {
    // Pre-fill with selected text if any
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    setLinkText(selectedText);
    
    // Get existing link URL if editing a link
    if (editor.isActive('link')) {
      const attrs = editor.getAttributes('link');
      if (attrs.href) {
        setLinkUrl(attrs.href);
      }
    }
    
    setIsLinkDialogOpen(true);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 mb-4 p-2 border rounded-md bg-gray-50">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <UISeparator orientation="vertical" className="h-6 mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <UISeparator orientation="vertical" className="h-6 mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <UISeparator orientation="vertical" className="h-6 mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={openLinkDialog}
        className={editor.isActive('link') ? 'bg-gray-200' : ''}
        title="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Separator"
      >
        <MinusSquare className="h-4 w-4" />
      </Button>

      <UISeparator orientation="vertical" className="h-6 mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>

      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="link-text" className="text-right text-sm">
                Text
              </label>
              <Input
                id="link-text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="link-url" className="text-right text-sm">
                URL
              </label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="col-span-3"
                placeholder="https://example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={addLink} type="button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  content, 
  onChange, 
  className = '' 
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-navy hover:underline',
        },
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList,
      OrderedList,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className={`border rounded-md ${className}`}>
      <MenuBar editor={editor} />
      <div className="px-4 py-3 min-h-[300px] prose max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor; 