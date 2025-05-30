
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://izksnjgriegahapwyakp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6a3NuamdyaWVnYWhhcHd5YWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4NzYyOTcsImV4cCI6MjA2MjQ1MjI5N30.LXGiLFKoNzwo4Poo19Rl1bC4P59SfIgM69ff5vH0zY0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  }
);
