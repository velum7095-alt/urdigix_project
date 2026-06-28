import { supabaseAdmin } from './_lib/supabase-admin.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Strict validation schema for invoice items
const InvoiceItemSchema = z.object({
    service_name: z.string().min(1, "Service name is required"),
    description: z.string().optional().default(""),
    quantity: z.number().int().positive().default(1),
    rate: z.number().nonnegative().default(0),
    amount: z.number().nonnegative(),
    sort_order: z.number().int().nonnegative().optional()
});

// Strict validation schema for invoices
const CreateInvoiceSchema = z.object({
    invoice_number: z.string().min(1, "Invoice number is required"),
    client_name: z.string().min(1, "Client name is required"),
    client_business_name: z.string().optional().default(""),
    client_phone: z.string().optional().default(""),
    client_email: z.string().optional().default(""),
    client_address: z.string().optional().default(""),
    due_date: z.string().optional(),
    items: z.array(InvoiceItemSchema).min(1, "At least one item is required")
});

async function requireAdmin(req: VercelRequest, res: VercelResponse): Promise<string | null> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return null;
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return null;
    }

    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc('has_role', {
        _user_id: userData.user.id,
        _role: 'admin',
    });

    if (roleError || !isAdmin) {
        res.status(403).json({ error: 'Forbidden' });
        return null;
    }

    return userData.user.id;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Require authenticated admin for all methods
    const adminId = await requireAdmin(req, res);
    if (!adminId) return;

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabaseAdmin
                .from('invoices')
                .select('*, items:invoice_items(*)')
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
            const { items, ...invoiceData } = validatedData;

            // Calculate pricing aggregates
            const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
            
            // Assume 18% GST default if not specified (aligns with schema default)
            const gstPercentage = 18.00;
            const gstAmount = parseFloat((subtotal * (gstPercentage / 100)).toFixed(2));
            const grandTotal = subtotal + gstAmount;

            // Fallback for due date (15 days from now)
            const due_date = invoiceData.due_date || (() => {
                const d = new Date();
                d.setDate(d.getDate() + 15);
                return d.toISOString().split('T')[0];
            })();

            // Insert invoice record
            const { data: invoice, error: invoiceError } = await supabaseAdmin
                .from('invoices')
                .insert([{
                    ...invoiceData,
                    due_date,
                    subtotal,
                    gst_percentage: gstPercentage,
                    gst_amount: gstAmount,
                    grand_total: grandTotal,
                    balance_due: grandTotal,
                    created_by: adminId
                }])
                .select()
                .single();

            if (invoiceError) throw invoiceError;

            // Insert invoice items
            const itemsToInsert = items.map((item, index) => ({
                ...item,
                invoice_id: invoice.id,
                sort_order: item.sort_order ?? index
            }));

            const { error: itemsError } = await supabaseAdmin
                .from('invoice_items')
                .insert(itemsToInsert);

            if (itemsError) {
                // Rollback: delete the created invoice
                await supabaseAdmin.from('invoices').delete().eq('id', invoice.id);
                throw itemsError;
            }

            // Fetch and return the fully populated invoice with its items
            const { data: completeInvoice, error: fetchError } = await supabaseAdmin
                .from('invoices')
                .select('*, items:invoice_items(*)')
                .eq('id', invoice.id)
                .single();

            if (fetchError) throw fetchError;

            return res.status(201).json(completeInvoice);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: 'Validation Error', details: error.errors });
            }
            console.error('Invoice creation error:', error);
            return res.status(500).json({ error: 'Failed to create invoice', details: error.message || error });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
