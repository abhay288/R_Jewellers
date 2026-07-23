'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Table as TableIcon,
  Link as LinkIcon,
  ImageIcon,
  Undo,
  Redo
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80',
        },
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 shadow-md',
        },
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-[160px] p-4 text-foreground text-sm font-sans',
      },
    },
  });

  if (!editor) {
    return <div className="h-40 border rounded-xl bg-muted/20 animate-pulse flex items-center justify-center text-xs text-muted-foreground">Loading Rich Text Editor...</div>;
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Image URL (Cloudinary or Web URL):');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/40 border-b border-border text-foreground">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg text-xs hover:bg-muted font-medium transition-colors ${editor.isActive('bold') ? 'bg-primary/20 text-primary' : ''}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg text-xs hover:bg-muted transition-colors ${editor.isActive('italic') ? 'bg-primary/20 text-primary' : ''}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg text-xs hover:bg-muted transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-primary/20 text-primary' : ''}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg text-xs hover:bg-muted transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-primary/20 text-primary' : ''}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-lg text-xs hover:bg-muted transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-primary/20 text-primary' : ''}`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg text-xs hover:bg-muted transition-colors ${editor.isActive('bulletList') ? 'bg-primary/20 text-primary' : ''}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg text-xs hover:bg-muted transition-colors ${editor.isActive('orderedList') ? 'bg-primary/20 text-primary' : ''}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        <button
          type="button"
          onClick={addTable}
          className="p-2 rounded-lg text-xs hover:bg-muted transition-colors text-foreground"
          title="Insert Specifications Table"
        >
          <TableIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={addLink}
          className={`p-2 rounded-lg text-xs hover:bg-muted transition-colors ${editor.isActive('link') ? 'bg-primary/20 text-primary' : ''}`}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded-lg text-xs hover:bg-muted transition-colors text-foreground"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-border mx-1 ml-auto" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded-lg text-xs hover:bg-muted transition-colors text-muted-foreground"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded-lg text-xs hover:bg-muted transition-colors text-muted-foreground"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
