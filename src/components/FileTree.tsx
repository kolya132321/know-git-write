
import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileNode } from '@/types/filesystem';
import { cn } from '@/lib/utils';

interface FileTreeProps {
  nodes: FileNode[];
  activeFileId: string | null;
  onFileSelect: (fileId: string) => void;
  onCreateFile: (parentId: string | null, name: string, type: 'file' | 'directory') => void;
}

interface TreeNodeProps {
  node: FileNode;
  level: number;
  activeFileId: string | null;
  onSelect: (fileId: string) => void;
  onCreateFile: (parentId: string | null, name: string, type: 'file' | 'directory') => void;
}

const TreeNode = ({ node, level, activeFileId, onSelect, onCreateFile }: TreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCreating, setIsCreating] = useState<'file' | 'directory' | null>(null);
  const [newName, setNewName] = useState('');

  const handleCreate = (type: 'file' | 'directory') => {
    setIsCreating(type);
    setNewName('');
  };

  const handleSubmit = () => {
    if (newName.trim()) {
      let finalName = newName.trim();
      // Only add .md extension if it's a file and doesn't already have it
      if (isCreating === 'file' && !finalName.endsWith('.md')) {
        finalName = `${finalName}.md`;
      }
      onCreateFile(node.id, finalName, isCreating!);
      setIsCreating(null);
      setNewName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsCreating(null);
      setNewName('');
    }
  };

  return (
    <div>
        <div
        className={cn(
          "flex items-center py-1 px-2 mx-1 rounded-md cursor-pointer transition-colors group",
          "hover:bg-kb-sidebar-hover",
          activeFileId === node.id && "bg-primary/10 text-primary"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {node.type === 'directory' && (
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-4 w-4 mr-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        )}
        <div 
          className="flex items-center flex-1 min-w-0"
          onClick={() => node.type === 'file' && onSelect(node.id)}
        >
          {node.type === 'directory' ? (
            isExpanded ? <FolderOpen className="h-4 w-4 mr-2 text-primary" /> : <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
          ) : (
            <File className="h-4 w-4 mr-2 text-muted-foreground" />
          )}
          <span className="text-sm truncate">{node.name}</span>
        </div>
        {node.type === 'directory' && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6"
              onClick={() => handleCreate('file')}
            >
              <File className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm" 
              className="p-1 h-6 w-6"
              onClick={() => handleCreate('directory')}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {isCreating && (
        <div style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }} className="px-2 py-1 mx-1">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSubmit}
            placeholder={`New ${isCreating}...`}
            className="h-6 text-xs"
            autoFocus
          />
        </div>
      )}

      {node.type === 'directory' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              activeFileId={activeFileId}
              onSelect={onSelect}
              onCreateFile={onCreateFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileTree = ({ nodes, activeFileId, onFileSelect, onCreateFile }: FileTreeProps) => {
  const [isCreating, setIsCreating] = useState<'file' | 'directory' | null>(null);
  const [newName, setNewName] = useState('');

  const handleRootCreate = (type: 'file' | 'directory') => {
    setIsCreating(type);
    setNewName('');
  };

  const handleSubmit = () => {
    if (newName.trim()) {
      let finalName = newName.trim();
      // Only add .md extension if it's a file and doesn't already have it
      if (isCreating === 'file' && !finalName.endsWith('.md')) {
        finalName = `${finalName}.md`;
      }
      onCreateFile(null, finalName, isCreating!);
      setIsCreating(null);
      setNewName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsCreating(null);
      setNewName('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b flex items-center justify-between">
        <h2 className="font-semibold text-sm">Knowledge Base</h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={() => handleRootCreate('file')}
          >
            <File className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={() => handleRootCreate('directory')}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {isCreating && (
          <div className="px-2 py-1 mx-1">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSubmit}
              placeholder={`New ${isCreating}...`}
              className="h-6 text-xs"
              autoFocus
            />
          </div>
        )}

        {nodes.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            level={0}
            activeFileId={activeFileId}
            onSelect={onFileSelect}
            onCreateFile={onCreateFile}
          />
        ))}
      </div>
    </div>
  );
};
