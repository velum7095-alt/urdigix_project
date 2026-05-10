
import { supabaseAdmin } from './_lib/supabase-admin.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Strict validation schema
const CreateInvoiceSchema = z.object({
    invoice_number: z.string().min(1),
    client_name: z.string().min(1),
    amount: z.number().positive().optional(),
    items: z.array(z.any()).optional(),
    due_date: z.string().optional()
});

async function requireAdmin(req: VercelRequest, res: VercelResponse): Promise<boolean> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return false;
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return false;
    }

    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc('has_role', {
        _user_id: userData.user.id,
        _role: 'admin',
    });

    if (roleError || !isAdmin) {
        res.status(403).json({ error: 'Forbidden' });
        return false;
    }

    return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Require authenticated admin for all methods
    const ok = await requireAdmin(req, res);
    if (!ok) return;

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabaseAdmin
                .from('invoices')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(500).json({ error: 'Failed to fetch invoices' });
        }
    }

    if (req.method === 'POST') {
        try {
            const validatedData = CreateInvoiceSchema.parse(req.body);
            const { data, error } = await supabaseAdmin
                .from('invoices')
                .insert([validatedData])
                .select()
                .single();

            if (error) throw error;
            return res.status(201).json(data);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: 'Validation Error', details: error.errors });
            }
            return res.status(500).json({ error: 'Failed to create invoice' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
