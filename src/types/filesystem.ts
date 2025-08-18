export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  content?: string;
  children?: FileNode[];
  parentId?: string;
}

export interface FileSystemState {
  nodes: Record<string, FileNode>;
  rootIds: string[];
  activeFileId: string | null;
}