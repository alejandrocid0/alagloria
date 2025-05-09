
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // Return the current server timestamp
  const now = new Date();
  
  return new Response(JSON.stringify(now.toISOString()), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});
