
import { supabaseAdmin } from './_lib/supabase-admin';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Strict validation schema
const CreateInvoiceSchema = z.object({
    invoice_number: z.string().min(1),
    client_name: z.string().min(1),
    amount: z.number().positive().optional(), // Example constraint
    items: z.array(z.any()).optional(),
    due_date: z.string().optional()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // GET: Fetch Invoices
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
            return res.status(500).json({ error: error.message });
        }
    }

    // POST: Create Invoice
    if (req.method === 'POST') {
        try {
            // validate input
            const body = req.body;
            const validatedData = CreateInvoiceSchema.parse(body);

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
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
