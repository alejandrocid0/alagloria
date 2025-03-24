
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { method, section, page } = await req.json();

    // Initialize response
    let responseData;

    if (method === 'GET') {
      // Fetch content based on section and page
      const query = supabase.from('content_items');
      
      if (section && page) {
        const { data, error } = await query
          .select('*')
          .eq('section', section)
          .eq('page', page);
        
        if (error) throw error;
        responseData = data;
      } else if (section) {
        const { data, error } = await query
          .select('*')
          .eq('section', section);
        
        if (error) throw error;
        responseData = data;
      } else if (page) {
        const { data, error } = await query
          .select('*')
          .eq('page', page);
        
        if (error) throw error;
        responseData = data;
      } else {
        // Get all content
        const { data, error } = await query.select('*');
        
        if (error) throw error;
        responseData = data;
      }
    } else if (method === 'UPDATE') {
      const { key, value } = await req.json();
      
      // Update content item
      const { data, error } = await supabase.from('content_items')
        .update({ content: value })
        .eq('key', key)
        .select();
      
      if (error) throw error;
      responseData = data;
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
