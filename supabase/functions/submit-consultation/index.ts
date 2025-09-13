import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    console.log('Received consultation request:', body)
    
    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.preferredDate || !body.preferredTime || !body.serviceType) {
      console.error('Missing required fields:', body)
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Split name into first and last name for database compatibility
    const nameParts = body.name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    const consultationData = {
      name: body.name,
      first_name: firstName,
      last_name: lastName,
      email: body.email,
      phone: body.phone,
      preferred_date: body.preferredDate,
      preferred_time: body.preferredTime,
      service_type: body.serviceType,
      message: body.message || '',
      status: 'pending'
    }

    console.log('Inserting consultation data:', consultationData)

    const { data, error } = await supabaseClient
      .from('consultations')
      .insert([consultationData])
      .select()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Consultation inserted successfully:', data[0])

    return new Response(JSON.stringify({ success: true, consultation: data[0] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})