
import { supabaseAdmin } from './_lib/supabase-admin.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Safe test query - fetch distinct count or just 1 row
        const { data, error } = await supabaseAdmin
            .from('business_settings')
            .select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Supabase Connection Error:', error);
            throw error;
        }

        return res.status(200).json({
            status: 'ok',
            message: 'Successfully connected to Supabase!',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('DB Connection Failed:', error.message);
        // Do not leak secrets in error
        return res.status(500).json({ error: 'Database connection failed' });
    }
}
