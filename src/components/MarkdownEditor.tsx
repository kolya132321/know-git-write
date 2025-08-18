import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Edit3, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  content: string;
  fileName: string;
  onChange: (content: string) => void;
  onSave: () => void;
}

export const MarkdownEditor = ({ content, fileName, onChange, onSave }: MarkdownEditorProps) => {
  const [isPreview, setIsPreview] = useState(false);

  const renderMarkdown = (markdown: string) => {
    // Basic markdown rendering - in a real app, you'd use a library like react-markdown
    return markdown
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mb-2">$1</h3>')
      .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-kb-code px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/```([^```]+)```/g, '<pre class="bg-kb-code p-4 rounded-lg overflow-auto"><code>$1</code></pre>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="h-full flex flex-col bg-kb-editor">
      <div className="border-b p-3 flex items-center justify-between">
        <h1 className="font-semibold">{fileName}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={isPreview ? "ghost" : "secondary"}
            size="sm"
            onClick={() => setIsPreview(false)}
            className="flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant={isPreview ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setIsPreview(true)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button 
            onClick={onSave}
            className="flex items-center gap-2"
            size="sm"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {isPreview ? (
          <div 
            className="h-full overflow-auto p-6 prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        ) : (
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "h-full resize-none border-0 rounded-none",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "font-mono text-sm leading-relaxed"
            )}
            placeholder="Start writing your markdown..."
          />
        )}
      </div>
    </div>
  );
};