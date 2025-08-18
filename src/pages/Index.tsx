import { FileTree } from '@/components/FileTree';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { useFileSystem } from '@/hooks/useFileSystem';
import { GitBranch, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { createNode, updateFileContent, setActiveFile, getRootNodes, getActiveFile, activeFileId } = useFileSystem();
  const { toast } = useToast();
  
  const activeFile = getActiveFile();
  const rootNodes = getRootNodes();

  const handleSave = () => {
    toast({
      title: "File saved",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-kb-sidebar shadow-soft">
        <div className="h-16 border-b flex items-center px-4 bg-gradient-subtle">
          <GitBranch className="h-5 w-5 text-primary mr-3" />
          <h1 className="font-bold text-lg">KnowledgeBase</h1>
        </div>
        
        <FileTree
          nodes={rootNodes}
          activeFileId={activeFileId}
          onFileSelect={setActiveFile}
          onCreateFile={createNode}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {activeFile ? (
          <MarkdownEditor
            content={activeFile.content || ''}
            fileName={activeFile.name}
            onChange={(content) => updateFileContent(activeFile.id, content)}
            onSave={handleSave}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-kb-editor">
            <div className="text-center max-w-md">
              <GitBranch className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-semibold mb-3 text-muted-foreground">Welcome to KnowledgeBase</h2>
              <p className="text-muted-foreground mb-6">
                Create your first file or directory to start building your knowledge base. 
                All files are stored in markdown format for easy version control.
              </p>
              <Button 
                onClick={() => createNode(null, 'README', 'file')}
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                Create First File
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
