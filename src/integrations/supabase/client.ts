// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://hancogrsqrajdxmontft.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhbmNvZ3JzcXJhamR4bW9udGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTY0MDIsImV4cCI6MjA2MDAzMjQwMn0.XT8nrIt-P-ursfpJlKPvZQXqnq-h7e8bbVsvx7-_nwE";


// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);