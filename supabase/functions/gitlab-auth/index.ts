import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { projectId, branch = 'main' } = await req.json()
    const token = Deno.env.get('GITLAB_ACCESS_TOKEN')

    if (!token) {
      throw new Error('GitLab access token not configured')
    }

    if (!projectId) {
      throw new Error('Project ID is required')
    }

    // Verify GitLab connection and get project info
    const response = await fetch(`https://gitlab.com/api/v4/projects/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`GitLab API error: ${response.status}`)
    }

    const project = await response.json()

    return new Response(
      JSON.stringify({
        success: true,
        project: {
          id: project.id,
          name: project.name,
          path: project.path,
          default_branch: project.default_branch,
          web_url: project.web_url,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
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