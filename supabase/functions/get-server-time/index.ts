
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.2.0'

// Configuración de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Crear el cliente de Supabase
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  // Manejar peticiones OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Obtener el tiempo actual del servidor
    const serverTime = Date.now();
    
    // Registrar la información en logs
    console.log(`Servidor entregando timestamp: ${serverTime} (${new Date(serverTime).toISOString()})`);
    
    // Devolver el tiempo actual del servidor
    return new Response(
      JSON.stringify({ 
        success: true,
        serverTime: serverTime,
        serverTimeISO: new Date(serverTime).toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );
  } catch (err) {
    console.error('Error inesperado:', err);
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor', 
        details: err.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
