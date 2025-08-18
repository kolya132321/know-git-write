import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GitBranch, Loader2 } from 'lucide-react'
import { useGitLabIntegration } from '@/hooks/useGitLabIntegration'

interface GitLabConnectionProps {
  onConnected: () => void
}

export const GitLabConnection = ({ onConnected }: GitLabConnectionProps) => {
  const [projectId, setProjectId] = useState('')
  const { connectProject, isLoading, project, isConnected } = useGitLabIntegration()

  const handleConnect = async () => {
    if (!projectId.trim()) return
    
    const success = await connectProject(projectId.trim())
    if (success) {
      onConnected()
    }
  }

  if (isConnected && project) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Connected to GitLab
          </CardTitle>
          <CardDescription>
            <a href={project.web_url} target="_blank" rel="noopener noreferrer" className="text-kb-primary hover:underline">
              {project.name}
            </a>
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Connect to GitLab
        </CardTitle>
        <CardDescription>
          Enter your GitLab project ID to sync your knowledge base with GitLab
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="projectId">Project ID</Label>
          <Input
            id="projectId"
            placeholder="12345678"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">
            Find your project ID in your GitLab project's settings → General
          </p>
        </div>
        <Button 
          onClick={handleConnect} 
          disabled={!projectId.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Connect Project'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}