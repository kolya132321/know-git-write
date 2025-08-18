import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

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
      const response = await fetch('/functions/v1/gitlab-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      })

      const data = await response.json()

      if (data.success) {
        setProject(data.project)
        setIsConnected(true)
        toast({
          title: 'Connected to GitLab',
          description: `Successfully connected to ${data.project.name}`,
        })
        return true
      } else {
        throw new Error(data.error)
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

    const response = await fetch('/functions/v1/gitlab-files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: project.id,
        action: 'list',
        path,
        ref,
      }),
    })

    const data = await response.json()
    if (!data.success) throw new Error(data.error)
    return data.files
  }, [project])

  const readFile = useCallback(async (filePath: string, ref = 'main'): Promise<string> => {
    if (!project) throw new Error('No project connected')

    const response = await fetch('/functions/v1/gitlab-files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: project.id,
        action: 'read',
        filePath,
        ref,
      }),
    })

    const data = await response.json()
    if (!data.success) throw new Error(data.error)
    return data.content
  }, [project])

  const writeFile = useCallback(async (filePath: string, content: string, commitMessage?: string): Promise<void> => {
    if (!project) throw new Error('No project connected')

    const response = await fetch('/functions/v1/gitlab-files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: project.id,
        action: 'write',
        filePath,
        content,
        commitMessage,
        ref: project.default_branch,
      }),
    })

    const data = await response.json()
    if (!data.success) throw new Error(data.error)

    toast({
      title: 'File saved',
      description: `${filePath} has been committed to GitLab`,
    })
  }, [project, toast])

  const deleteFile = useCallback(async (filePath: string, commitMessage?: string): Promise<void> => {
    if (!project) throw new Error('No project connected')

    const response = await fetch('/functions/v1/gitlab-files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: project.id,
        action: 'delete',
        filePath,
        commitMessage,
        ref: project.default_branch,
      }),
    })

    const data = await response.json()
    if (!data.success) throw new Error(data.error)

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