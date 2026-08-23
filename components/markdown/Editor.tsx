'use client';

import { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { useTheme } from 'next-themes';
import rehypeSanitize from 'rehype-sanitize';
import { sanitizeSchema } from '@/lib/markdown/sanitize';
import { defaultMarkdownComponents } from './View';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string | undefined) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-48 bg-muted animate-pulse rounded-md" />;

  return (
    <div data-color-mode={resolvedTheme === 'dark' ? 'dark' : 'light'}>
      <MDEditor
        value={value}
        onChange={onChange}
        preview="edit"
        height={400}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize, sanitizeSchema]],
          components: defaultMarkdownComponents,
        }}
        textareaProps={{
          placeholder: 'Write your notes in Markdown...',
        }}
      />
    </div>
  );
}

