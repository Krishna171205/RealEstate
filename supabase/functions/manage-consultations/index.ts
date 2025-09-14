import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase configuration')
      return new Response(JSON.stringify({ 
        error: 'Server configuration error' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey)

    // GET - Fetch all consultations
    if (req.method === 'GET') {
      console.log('Admin: Fetching all consultations for management...')
      
      const { data: consultations, error } = await supabaseClient
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('GET consultations error:', error)
        return new Response(JSON.stringify({ 
          error: 'Failed to fetch consultations',
          details: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log(`Admin: Successfully fetched ${consultations?.length || 0} consultations`)

      return new Response(JSON.stringify({ 
        success: true,
        consultations: consultations || [] 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // PUT - Update consultation status
    if (req.method === 'PUT') {
      const body = await req.json()
      console.log('Admin: Updating consultation status with data:', body)
      
      if (!body.id) {
        console.error('Admin: Missing consultation ID for update')
        return new Response(JSON.stringify({ 
          error: 'Consultation ID is required for update' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      const { data, error } = await supabaseClient
        .from('consultations')
        .update({ status: body.status })
        .eq('id', body.id)
        .select()
        .single()

      if (error) {
        console.error('Admin: Update consultation error:', error)
        return new Response(JSON.stringify({ 
          error: 'Failed to update consultation in database',
          details: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Admin: Consultation updated successfully:', data.id)

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Consultation updated successfully',
        consultation: data 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // DELETE - Remove consultation
    if (req.method === 'DELETE') {
      const body = await req.json()
      const consultationId = body.id || body.consultationId
      
      console.log('Admin: DELETE request received with body:', body)
      console.log('Admin: Attempting to delete consultation with ID:', consultationId)
      
      if (!consultationId || isNaN(parseInt(consultationId))) {
        console.error('Admin: Invalid or missing consultation ID for deletion:', consultationId)
        return new Response(JSON.stringify({ 
          error: 'Valid consultation ID is required for deletion',
          receivedId: consultationId
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      const numericId = parseInt(consultationId)
      console.log('Admin: Parsed consultation ID as numeric:', numericId)
      
      // First verify the consultation exists
      const { data: consultationToDelete, error: fetchError } = await supabaseClient
        .from('consultations')
        .select('*')
        .eq('id', numericId)
        .maybeSingle()

      if (fetchError) {
        console.error('Admin: Error checking consultation existence:', fetchError)
        return new Response(JSON.stringify({ 
          error: 'Database error while checking consultation',
          details: fetchError.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (!consultationToDelete) {
        console.error('Admin: Consultation not found for deletion, ID:', numericId)
        return new Response(JSON.stringify({ 
          error: 'Consultation not found with the specified ID',
          searchedId: numericId
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Admin: Found consultation to delete:', consultationToDelete.name, 'ID:', consultationToDelete.id)
      
      // Perform the deletion
      const { error: deleteError } = await supabaseClient
        .from('consultations')
        .delete()
        .eq('id', numericId)

      if (deleteError) {
        console.error('Admin: Delete consultation error:', deleteError)
        return new Response(JSON.stringify({ 
          error: 'Failed to delete consultation from database',
          details: deleteError.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Admin: Consultation deleted successfully:', consultationToDelete.name)

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Consultation deleted successfully',
        deletedConsultation: {
          id: consultationToDelete.id,
          name: consultationToDelete.name
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Method not allowed
    return new Response(JSON.stringify({ 
      error: 'Method not allowed',
      allowedMethods: ['GET', 'PUT', 'DELETE']
    }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Admin manage consultations function error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})