import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface GitLabProject {
  id: number
  name: string
  path: string
  default_branch: string
  web_url: string
}

interface FileNode {
  id: string
  name: string
  path: string
  type: 'file' | 'tree'
  mode?: string
}

export const useGitLabIntegration = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [project, setProject] = useState<GitLabProject | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const connectProject = useCallback(async (projectId: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('gitlab-auth', {
        body: { projectId },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data?.success) {
        setProject(data.project)
        setIsConnected(true)
        toast({
          title: 'Connected to GitLab',
          description: `Successfully connected to ${data.project.name}`,
        })
        return true
      } else {
        throw new Error(data?.error || 'Failed to connect')
      }
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Failed to connect to GitLab',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const listFiles = useCallback(async (path = '', ref = 'main'): Promise<FileNode[]> => {
    if (!project) throw new Error('No project connected')

    const { data, error } = await supabase.functions.invoke('gitlab-files', {
      body: {
        projectId: project.id,
        action: 'list',
        path,
        ref,
      },
    })

    if (error) throw new Error(error.message)
    if (!data?.success) throw new Error(data?.error || 'Failed to list files')
    return data.files
  }, [project])

  const readFile = useCallback(async (filePath: string, ref = 'main'): Promise<string> => {
    if (!project) throw new Error('No project connected')

    const { data, error } = await supabase.functions.invoke('gitlab-files', {
      body: {
        projectId: project.id,
        action: 'read',
        filePath,
        ref,
      },
    })

    if (error) throw new Error(error.message)
    if (!data?.success) throw new Error(data?.error || 'Failed to read file')
    return data.content
  }, [project])

  const writeFile = useCallback(async (filePath: string, content: string, commitMessage?: string): Promise<void> => {
    if (!project) throw new Error('No project connected')

    const { data, error } = await supabase.functions.invoke('gitlab-files', {
      body: {
        projectId: project.id,
        action: 'write',
        filePath,
        content,
        commitMessage,
        ref: project.default_branch,
      },
    })

    if (error) throw new Error(error.message)
    if (!data?.success) throw new Error(data?.error || 'Failed to write file')

    toast({
      title: 'File saved',
      description: `${filePath} has been committed to GitLab`,
    })
  }, [project, toast])

  const deleteFile = useCallback(async (filePath: string, commitMessage?: string): Promise<void> => {
    if (!project) throw new Error('No project connected')

    const { data, error } = await supabase.functions.invoke('gitlab-files', {
      body: {
        projectId: project.id,
        action: 'delete',
        filePath,
        commitMessage,
        ref: project.default_branch,
      },
    })

    if (error) throw new Error(error.message)
    if (!data?.success) throw new Error(data?.error || 'Failed to delete file')

    toast({
      title: 'File deleted',
      description: `${filePath} has been removed from GitLab`,
    })
  }, [project, toast])

  return {
    isConnected,
    project,
    isLoading,
    connectProject,
    listFiles,
    readFile,
    writeFile,
    deleteFile,
  }
}