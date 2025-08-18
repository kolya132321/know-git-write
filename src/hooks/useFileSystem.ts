import { useState, useCallback } from 'react';
import { FileNode, FileSystemState } from '@/types/filesystem';
import { useGitLabIntegration } from './useGitLabIntegration';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useFileSystem = () => {
  const { isConnected, listFiles, readFile, writeFile, deleteFile } = useGitLabIntegration();
  
  const [state, setState] = useState<FileSystemState>({
    nodes: {},
    rootIds: [],
    activeFileId: null,
  });

  const createNode = useCallback(async (parentId: string | null, name: string, type: 'file' | 'directory') => {
    if (isConnected && type === 'file') {
      // For GitLab integration, create files directly in the repository
      const parentPath = parentId ? state.nodes[parentId]?.path : '';
      const filePath = parentPath ? `${parentPath}/${name}.md` : `${name}.md`;
      const content = `# ${name}\n\nStart writing your content here...`;
      
      try {
        await writeFile(filePath, content, `Create ${name}.md`);
        await loadFiles(); // Refresh the file tree
        return;
      } catch (error) {
        console.error('Failed to create file in GitLab:', error);
        return;
      }
    }

    // Local mode
    const id = generateId();
    const parentPath = parentId ? state.nodes[parentId]?.path : '';
    const path = parentPath ? `${parentPath}/${name}` : name;
    
    const newNode: FileNode = {
      id,
      name: type === 'file' ? `${name}.md` : name,
      type,
      path,
      content: type === 'file' ? `# ${name}\n\nStart writing your content here...` : undefined,
      children: type === 'directory' ? [] : undefined,
      parentId: parentId || undefined,
    };

    setState(prev => {
      const newNodes = { ...prev.nodes, [id]: newNode };
      
      if (parentId) {
        const parent = newNodes[parentId];
        if (parent && parent.children) {
          parent.children = [...parent.children, newNode];
        }
      } else {
        return {
          ...prev,
          nodes: newNodes,
          rootIds: [...prev.rootIds, id],
        };
      }

      return {
        ...prev,
        nodes: newNodes,
      };
    });

    if (type === 'file') {
      setState(prev => ({ ...prev, activeFileId: id }));
    }
  }, [state.nodes, isConnected, writeFile]);

  const updateFileContent = useCallback(async (fileId: string, content: string, shouldSave = false) => {
    if (isConnected && shouldSave) {
      const file = state.nodes[fileId];
      if (file && file.type === 'file') {
        try {
          await writeFile(file.path, content, `Update ${file.name}`);
        } catch (error) {
          console.error('Failed to save file to GitLab:', error);
        }
      }
    }
    
    setState(prev => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [fileId]: {
          ...prev.nodes[fileId],
          content,
        },
      },
    }));
  }, [isConnected, writeFile, state.nodes]);

  const setActiveFile = useCallback(async (fileId: string) => {
    setState(prev => ({ ...prev, activeFileId: fileId }));
    
    // Load file content from GitLab if connected
    if (isConnected) {
      const file = state.nodes[fileId];
      if (file && file.type === 'file' && !file.content) {
        try {
          const content = await readFile(file.path);
          setState(prev => ({
            ...prev,
            nodes: {
              ...prev.nodes,
              [fileId]: {
                ...prev.nodes[fileId],
                content,
              },
            },
          }));
        } catch (error) {
          console.error('Failed to load file content:', error);
        }
      }
    }
  }, [isConnected, readFile, state.nodes]);

  const loadFiles = useCallback(async (path = '') => {
    if (!isConnected) return;
    
    try {
      const files = await listFiles(path);
      const nodes: Record<string, FileNode> = {};
      const rootIds: string[] = [];
      
      files.forEach(file => {
        if (file.type === 'tree' || file.name.endsWith('.md')) {
          const node: FileNode = {
            id: file.id,
            name: file.name,
            type: file.type === 'tree' ? 'directory' : 'file',
            path: file.path,
            content: file.type === 'file' ? '' : undefined,
            children: file.type === 'tree' ? [] : undefined,
          };
          
          nodes[file.id] = node;
          rootIds.push(file.id);
        }
      });
      
      setState({
        nodes,
        rootIds,
        activeFileId: null,
      });
    } catch (error) {
      console.error('Failed to load files from GitLab:', error);
    }
  }, [isConnected, listFiles]);

  const getRootNodes = useCallback((): FileNode[] => {
    return state.rootIds.map(id => state.nodes[id]).filter(Boolean);
  }, [state.nodes, state.rootIds]);

  const getActiveFile = useCallback((): FileNode | null => {
    return state.activeFileId ? state.nodes[state.activeFileId] || null : null;
  }, [state.nodes, state.activeFileId]);

  return {
    createNode,
    updateFileContent,
    setActiveFile,
    getRootNodes,
    getActiveFile,
    loadFiles,
    activeFileId: state.activeFileId,
    isConnected,
  };
};