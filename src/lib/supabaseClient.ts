
import { createClient } from '@supabase/supabase-js';

// Standard Supabase Client for Client-Side Operations
// Note: Vite uses import.meta.env. Next.js users would use process.env.NEXT_PUBLIC_...
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
