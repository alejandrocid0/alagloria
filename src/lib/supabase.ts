
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = 'https://nmaqsaslhuixacrhausl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tYXFzYXNsaHVpeGFjcmhhdXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2ODQ0NTAsImV4cCI6MjA1NzI2MDQ1MH0._joZBvuoT7dYIbWsbzlPFTTFTRdg8Lo159bDcbtswlU';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
