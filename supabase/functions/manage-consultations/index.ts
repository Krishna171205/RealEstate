import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'GET') {
      console.log('Fetching consultations from database...')
      
      const { data: consultations, error } = await supabaseClient
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching consultations:', error)
        throw error
      }

      console.log('Successfully fetched consultations:', consultations?.length || 0)

      return new Response(JSON.stringify({ consultations: consultations || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'PUT') {
      const body = await req.json()
      console.log('Updating consultation status:', body)
      
      const { data, error } = await supabaseClient
        .from('consultations')
        .update({ status: body.status })
        .eq('id', body.id)
        .select()

      if (error) {
        console.error('Error updating consultation:', error)
        throw error
      }

      console.log('Successfully updated consultation:', data[0])

      return new Response(JSON.stringify({ success: true, consultation: data[0] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'DELETE') {
      const body = await req.json()
      console.log('Deleting consultation:', body.id)
      
      const { error } = await supabaseClient
        .from('consultations')
        .delete()
        .eq('id', body.id)

      if (error) {
        console.error('Error deleting consultation:', error)
        throw error
      }

      console.log('Successfully deleted consultation')

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})