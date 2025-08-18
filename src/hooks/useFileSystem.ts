import { useState, useCallback } from 'react';
import { FileNode, FileSystemState } from '@/types/filesystem';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useFileSystem = () => {
  const [state, setState] = useState<FileSystemState>({
    nodes: {},
    rootIds: [],
    activeFileId: null,
  });

  const createNode = useCallback((parentId: string | null, name: string, type: 'file' | 'directory') => {
    const id = generateId();
    const parentPath = parentId ? state.nodes[parentId]?.path : '';
    const path = parentPath ? `${parentPath}/${name}` : name;
    
    const newNode: FileNode = {
      id,
      name,
      type,
      path,
      content: type === 'file' ? '# ' + name.replace('.md', '') + '\n\nStart writing your content here...' : undefined,
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
  }, [state.nodes]);

  const updateFileContent = useCallback((fileId: string, content: string) => {
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
  }, []);

  const setActiveFile = useCallback((fileId: string) => {
    setState(prev => ({ ...prev, activeFileId: fileId }));
  }, []);

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
    activeFileId: state.activeFileId,
  };
};