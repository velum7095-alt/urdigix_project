
import { createClient } from '@supabase/supabase-js';

// Server-side client for admin operations
// These keys must be set in your Vercel Project Settings
const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
];

// Check for missing env vars
const missingVars = requiredEnvVars.filter(key =>
    !process.env[key] && !process.env[`NEXT_PUBLIC_${key.replace('VITE_', '')}`]
);

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
