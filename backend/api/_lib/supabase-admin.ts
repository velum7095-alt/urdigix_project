
import { createClient } from '@supabase/supabase-js';

// Server-side client for API routes only.
// Keep SUPABASE_SERVICE_ROLE_KEY out of frontend VITE_ variables.
const missingVars = [
    !process.env.VITE_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL
        ? 'VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL'
        : '',
    !process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SUPABASE_SERVICE_ROLE_KEY' : '',
].filter(Boolean);

if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with the Service Role Key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
