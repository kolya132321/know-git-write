import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface FileNode {
  id: string
  name: string
  path: string
  type: 'file' | 'tree'
  mode?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { projectId, path = '', ref = 'main', action, content, commitMessage, filePath } = await req.json()
    const token = Deno.env.get('GITLAB_ACCESS_TOKEN')

    if (!token || !projectId) {
      throw new Error('GitLab access token or project ID not configured')
    }

    const baseUrl = `https://gitlab.com/api/v4/projects/${projectId}`

    if (action === 'list') {
      // Get repository tree
      const response = await fetch(`${baseUrl}/repository/tree?path=${encodeURIComponent(path)}&ref=${ref}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch tree: ${response.status}`)
      }

      const files = await response.json()
      const fileNodes: FileNode[] = files.map((file: any) => ({
        id: file.id,
        name: file.name,
        path: file.path,
        type: file.type,
        mode: file.mode,
      }))

      return new Response(
        JSON.stringify({
          success: true,
          files: fileNodes,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    if (action === 'read') {
      // Get file content
      const response = await fetch(`${baseUrl}/repository/files/${encodeURIComponent(filePath)}/raw?ref=${ref}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`)
      }

      const fileContent = await response.text()

      return new Response(
        JSON.stringify({
          success: true,
          content: fileContent,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    if (action === 'write') {
      // Create or update file
      const response = await fetch(`${baseUrl}/repository/files/${encodeURIComponent(filePath)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          branch: ref,
          content: content,
          commit_message: commitMessage || `Update ${filePath}`,
          encoding: 'text',
        }),
      })

      if (!response.ok) {
        // Try updating if creation failed
        const updateResponse = await fetch(`${baseUrl}/repository/files/${encodeURIComponent(filePath)}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            branch: ref,
            content: content,
            commit_message: commitMessage || `Update ${filePath}`,
            encoding: 'text',
          }),
        })

        if (!updateResponse.ok) {
          throw new Error(`Failed to write file: ${updateResponse.status}`)
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'File saved successfully',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    if (action === 'delete') {
      // Delete file
      const response = await fetch(`${baseUrl}/repository/files/${encodeURIComponent(filePath)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          branch: ref,
          commit_message: commitMessage || `Delete ${filePath}`,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.status}`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'File deleted successfully',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    throw new Error('Invalid action')
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})