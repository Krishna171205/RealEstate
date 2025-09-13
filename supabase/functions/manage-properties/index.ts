import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const generateImageUrl = (title: string, type: string) => {
  const prompts = {
    'House': `beautiful modern family house exterior with large windows, manicured lawn, contemporary architecture, residential neighborhood setting, natural lighting, clean architectural lines, inviting entrance, ${title.toLowerCase()}`,
    'Condo': `modern luxury condominium building exterior, sleek glass facade, urban setting, contemporary high-rise architecture, clean lines, sophisticated design, city backdrop, ${title.toLowerCase()}`,
    'Penthouse': `luxury penthouse exterior view, upscale high-rise building, sophisticated architecture, panoramic city views, modern glass design, premium residential building, ${title.toLowerCase()}`,
    'Townhouse': `elegant townhouse exterior, charming residential architecture, well-maintained facade, urban residential setting, classic design elements, inviting entrance, ${title.toLowerCase()}`,
    'Estate': `magnificent luxury estate exterior, grand architecture, expansive grounds, impressive facade, upscale residential property, majestic design, pristine landscaping, ${title.toLowerCase()}`,
    'Duplex': `attractive duplex home exterior, modern residential architecture, symmetrical design, well-maintained property, family-friendly neighborhood, clean contemporary lines, ${title.toLowerCase()}`,
    'Loft': `modern loft building exterior, industrial architecture, converted warehouse style, urban setting, large windows, contemporary residential conversion, ${title.toLowerCase()}`
  }
  
  const prompt = prompts[type] || prompts['House']
  return `https://readdy.ai/api/search-image?query=${encodeURIComponent(prompt)}&width=600&height=400&seq=prop${Date.now()}&orientation=landscape`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Use service role key for admin operations to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'GET') {
      console.log('Admin: Fetching all properties for management...')
      
      const { data: properties, error } = await supabaseClient
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('GET properties error:', error)
        return new Response(JSON.stringify({ 
          error: 'Failed to fetch properties',
          details: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log(`Admin: Successfully fetched ${properties?.length || 0} properties`)

      return new Response(JSON.stringify({ 
        success: true,
        properties: properties || [] 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      console.log('Admin: Adding new property with data:', body)
      
      // Validate required fields
      if (!body.title || !body.location || !body.description) {
        console.error('Admin: Missing required fields')
        return new Response(JSON.stringify({ 
          error: 'Missing required fields: title, location, description' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      // Generate image URL
      const imageUrl = generateImageUrl(body.title, body.type || 'House')
      
      const propertyData = {
        title: String(body.title).trim(),
        location: String(body.location).trim(),
        full_address: String(body.fullAddress || body.location).trim(),
        price: Math.max(0, parseInt(body.price) || 0),
        type: String(body.type || 'House').trim(),
        status: String(body.status || 'For Sale').trim(),
        beds: Math.max(1, parseInt(body.beds) || 1),
        baths: Math.max(1, parseInt(body.baths) || 1),
        sqft: Math.max(500, parseInt(body.sqft) || 1000),
        garage: Math.max(0, parseInt(body.garage) || 1),
        description: String(body.description).trim(),
        is_rental: Boolean(body.isRental),
        image_url: imageUrl,
        image: imageUrl
      }

      console.log('Admin: Inserting property with validated data:', propertyData)
      
      const { data, error } = await supabaseClient
        .from('properties')
        .insert([propertyData])
        .select()
        .single()

      if (error) {
        console.error('Admin: Insert property error:', error)
        return new Response(JSON.stringify({ 
          error: 'Failed to add property to database',
          details: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Admin: Property added successfully with ID:', data.id)

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Property added successfully',
        property: data 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'PUT') {
      const body = await req.json()
      console.log('Admin: Updating property with data:', body)
      
      if (!body.id) {
        console.error('Admin: Missing property ID for update')
        return new Response(JSON.stringify({ 
          error: 'Property ID is required for update' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      // First check if property exists
      const { data: existingProperty } = await supabaseClient
        .from('properties')
        .select('*')
        .eq('id', body.id)
        .single()

      if (!existingProperty) {
        console.error('Admin: Property not found for update, ID:', body.id)
        return new Response(JSON.stringify({ 
          error: 'Property not found' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Admin: Found existing property:', existingProperty.title)

      const updateData = {
        title: String(body.title || existingProperty.title).trim(),
        location: String(body.location || existingProperty.location).trim(),
        full_address: String(body.fullAddress || body.full_address || existingProperty.full_address).trim(),
        price: Math.max(0, parseInt(body.price) || existingProperty.price),
        type: String(body.type || existingProperty.type).trim(),
        status: String(body.status || existingProperty.status).trim(),
        beds: Math.max(1, parseInt(body.beds) || existingProperty.beds),
        baths: Math.max(1, parseInt(body.baths) || existingProperty.baths),
        sqft: Math.max(500, parseInt(body.sqft) || existingProperty.sqft),
        garage: Math.max(0, parseInt(body.garage) || existingProperty.garage),
        description: String(body.description || existingProperty.description).trim(),
        is_rental: Boolean(body.isRental !== undefined ? body.isRental : existingProperty.is_rental)
      }
      
      // Generate new image if title or type changed
      if (body.title !== existingProperty.title || body.type !== existingProperty.type) {
        console.log('Admin: Generating new image for updated property')
        const imageUrl = generateImageUrl(updateData.title, updateData.type)
        updateData.image_url = imageUrl
        updateData.image = imageUrl
      }
      
      console.log('Admin: Updating property with ID:', body.id, 'New data:', updateData)
      
      const { data, error } = await supabaseClient
        .from('properties')
        .update(updateData)
        .eq('id', body.id)
        .select()
        .single()

      if (error) {
        console.error('Admin: Update property error:', error)
        return new Response(JSON.stringify({ 
          error: 'Failed to update property in database',
          details: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Admin: Property updated successfully:', data.title)

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Property updated successfully',
        property: data 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'DELETE') {
      const body = await req.json()
      console.log('Admin: Attempting to delete property with ID:', body.id)
      
      if (!body.id) {
        console.error('Admin: Missing property ID for deletion')
        return new Response(JSON.stringify({ 
          error: 'Property ID is required for deletion' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      // First get the property to return it in response and verify it exists
      const { data: propertyToDelete, error: fetchError } = await supabaseClient
        .from('properties')
        .select('*')
        .eq('id', body.id)
        .single()

      if (fetchError || !propertyToDelete) {
        console.error('Admin: Property not found for deletion, ID:', body.id, fetchError)
        return new Response(JSON.stringify({ 
          error: 'Property not found' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Admin: Found property to delete:', propertyToDelete.title)
      
      const { error: deleteError } = await supabaseClient
        .from('properties')
        .delete()
        .eq('id', body.id)

      if (deleteError) {
        console.error('Admin: Delete property error:', deleteError)
        return new Response(JSON.stringify({ 
          error: 'Failed to delete property from database',
          details: deleteError.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('Admin: Property deleted successfully:', propertyToDelete.title)

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Property deleted successfully',
        deletedProperty: propertyToDelete 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Admin manage properties function error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})