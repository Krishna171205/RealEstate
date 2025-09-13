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
    // Use service role key for reliable data access and to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Public: Fetching all properties from database...')
    
    const { data: properties, error } = await supabaseClient
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Public: Error fetching properties:', error)
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch properties',
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Public: Successfully fetched ${properties?.length || 0} properties`)

    // Ensure all properties have required fields
    const validatedProperties = properties?.map(property => ({
      id: property.id,
      title: property.title || 'Untitled Property',
      location: property.location || 'Location TBD',
      full_address: property.full_address || property.location || 'Address TBD',
      price: property.price || 0,
      type: property.type || 'House',
      status: property.status || 'For Sale',
      beds: property.beds || 1,
      baths: property.baths || 1,
      sqft: property.sqft || 1000,
      garage: property.garage || 1,
      description: property.description || 'No description available',
      is_rental: Boolean(property.is_rental),
      image_url: property.image_url || property.image || '',
      created_at: property.created_at
    })) || []

    return new Response(JSON.stringify({ 
      success: true,
      properties: validatedProperties,
      count: validatedProperties.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Public get properties function error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})