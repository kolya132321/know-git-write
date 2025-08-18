import { FileTree } from '@/components/FileTree';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { GitLabConnection } from '@/components/GitLabConnection';
import { useFileSystem } from '@/hooks/useFileSystem';
import { GitBranch, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { createNode, updateFileContent, setActiveFile, getRootNodes, getActiveFile, loadFiles, activeFileId, isConnected } = useFileSystem();
  const { toast } = useToast();
  
  const activeFile = getActiveFile();
  const rootNodes = getRootNodes();

  const handleSave = async () => {
    if (activeFile) {
      await updateFileContent(activeFile.id, activeFile.content || '', true);
      toast({
        title: "File saved",
        description: isConnected ? "File committed to GitLab" : "Your changes have been saved locally.",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* GitLab Connection */}
      {!isConnected && (
        <div className="p-4 bg-kb-sidebar border-b border-kb-border">
          <GitLabConnection onConnected={loadFiles} />
        </div>
      )}
      
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r bg-kb-sidebar shadow-soft">
          <div className="h-16 border-b flex items-center px-4 bg-gradient-subtle">
            <GitBranch className="h-5 w-5 text-primary mr-3" />
            <h1 className="font-bold text-lg">KnowledgeBase</h1>
            {isConnected && (
              <div className="ml-auto">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            )}
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
                  {!isConnected 
                    ? 'Connect to GitLab to sync your markdown files with version control.' 
                    : 'Create your first file or directory to start building your knowledge base.'
                  }
                </p>
                {isConnected && (
                  <Button 
                    onClick={() => createNode(null, 'README', 'file')}
                    className="bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    Create First File
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
