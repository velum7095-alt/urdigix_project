/**
 * URDIGIX Billing Service
 * =======================
 * Secure service layer for quotations and invoices.
 * 
 * Security Features:
 * - All operations require admin authentication (enforced by RLS)
 * - Input validation with Zod schemas
 * - Audit logging via database triggers
 * - Type-safe operations
 */

import { supabase } from '@/integrations/supabase/client';
import { Quotation, Invoice, QuotationItem, InvoiceItem, BusinessSettings } from '@/types/billing';
import { z } from 'zod';

// ============================================
// VALIDATION SCHEMAS
// ============================================

const clientInfoSchema = z.object({
    client_name: z.string().min(1).max(200),
    client_business_name: z.string().max(200).optional().default(''),
    client_phone: z.string().max(20).optional().default(''),
    client_email: z.string().email().max(255).optional().or(z.literal('')).default(''),
    client_address: z.string().max(500).optional().default(''),
});

const itemSchema = z.object({
    service_name: z.string().min(1).max(200),
    description: z.string().max(1000).optional().default(''),
    quantity: z.number().int().positive().max(10000),
    rate: z.number().nonnegative().max(100000000),
    amount: z.number().nonnegative(),
    sort_order: z.number().int().nonnegative().optional().default(0),
});

// ============================================
// TYPE HELPERS (for untyped tables)
// ============================================

// Helper to cast Supabase responses for tables not yet in generated types
// Using 'unknown' intermediate cast to satisfy TypeScript's strict type checking
const fromTable = (table: string) => supabase.from(table as any);

export const billingService = {
    // ==========================================
    // QUOTATIONS
    // ==========================================
    async getQuotations(): Promise<Quotation[]> {
        const { data, error } = await fromTable('quotations')
            .select(`
                *,
                items:quotation_items(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data as unknown as Quotation[]) || [];
    },

    async createQuotation(quotation: Partial<Quotation>, items: Partial<QuotationItem>[]): Promise<Quotation> {
        // Validate client info
        const clientValidation = clientInfoSchema.safeParse({
            client_name: quotation.client_name,
            client_business_name: quotation.client_business_name,
            client_phone: quotation.client_phone,
            client_email: quotation.client_email,
            client_address: quotation.client_address,
        });

        if (!clientValidation.success) {
            throw new Error(`Validation error: ${clientValidation.error.message}`);
        }

        // Validate items
        for (const item of items) {
            const itemValidation = itemSchema.safeParse(item);
            if (!itemValidation.success) {
                throw new Error(`Item validation error: ${itemValidation.error.message}`);
            }
        }

        // 1. Create Quotation Record
        const { data: newQuotation, error: quoteError } = await fromTable('quotations')
            .insert({
                ...quotation,
                status: quotation.status || 'draft',
            })
            .select()
            .single();

        if (quoteError) throw quoteError;

        const createdQuotation = newQuotation as unknown as { id: string };

        // 2. Create Items
        if (items && items.length > 0) {
            const itemsData = items.map((item, index) => ({
                ...item,
                quotation_id: createdQuotation.id,
                sort_order: index
            }));

            const { error: itemsError } = await fromTable('quotation_items')
                .insert(itemsData);

            if (itemsError) throw itemsError;
        }

        return newQuotation as unknown as Quotation;
    },

    async updateQuotation(id: string, updates: Partial<Quotation>, items: Partial<QuotationItem>[]): Promise<void> {
        // Validate UUID format
        if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            throw new Error('Invalid quotation ID');
        }

        // 1. Update Quotation details
        const { error: updateError } = await fromTable('quotations')
            .update(updates)
            .eq('id', id);

        if (updateError) throw updateError;

        // 2. Sync Items (only if items provided)
        if (items && items.length > 0) {
            // Delete existing items
            const { error: deleteError } = await fromTable('quotation_items')
                .delete()
                .eq('quotation_id', id);

            if (deleteError) throw deleteError;

            // Re-insert items
            const itemsData = items.map((item, index) => ({
                service_name: item.service_name,
                description: item.description || '',
                quantity: item.quantity,
                rate: item.rate,
                amount: item.amount,
                quotation_id: id,
                sort_order: index
            }));

            const { error: itemsError } = await fromTable('quotation_items')
                .insert(itemsData);

            if (itemsError) throw itemsError;
        }
    },

    async deleteQuotation(id: string): Promise<void> {
        // Validate UUID format
        if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            throw new Error('Invalid quotation ID');
        }

        // Items will auto-delete due to CASCADE
        const { error } = await fromTable('quotations')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async generateQuotationNumber(): Promise<string> {
        const { data, error } = await supabase
            .rpc('generate_quotation_number');

        if (error) throw error;
        return data as string;
    },

    // ==========================================
    // INVOICES
    // ==========================================
    async getInvoices(): Promise<Invoice[]> {
        const { data, error } = await fromTable('invoices')
            .select(`
                *,
                items:invoice_items(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data as unknown as Invoice[]) || [];
    },

    async createInvoice(invoice: Partial<Invoice>, items: Partial<InvoiceItem>[]): Promise<Invoice> {
        // Validate client info
        const clientValidation = clientInfoSchema.safeParse({
            client_name: invoice.client_name,
            client_business_name: invoice.client_business_name,
            client_phone: invoice.client_phone,
            client_email: invoice.client_email,
            client_address: invoice.client_address,
        });

        if (!clientValidation.success) {
            throw new Error(`Validation error: ${clientValidation.error.message}`);
        }

        // Validate items
        for (const item of items) {
            const itemValidation = itemSchema.safeParse(item);
            if (!itemValidation.success) {
                throw new Error(`Item validation error: ${itemValidation.error.message}`);
            }
        }

        const { data: newInvoice, error: invError } = await fromTable('invoices')
            .insert({
                ...invoice,
                status: invoice.status || 'draft',
            })
            .select()
            .single();

        if (invError) throw invError;

        const createdInvoice = newInvoice as unknown as { id: string };

        if (items && items.length > 0) {
            const itemsData = items.map((item, index) => ({
                ...item,
                invoice_id: createdInvoice.id,
                sort_order: index
            }));

            const { error: itemsError } = await fromTable('invoice_items')
                .insert(itemsData);

            if (itemsError) throw itemsError;
        }

        return newInvoice as unknown as Invoice;
    },

    async updateInvoice(id: string, updates: Partial<Invoice>, items: Partial<InvoiceItem>[]): Promise<void> {
        // Validate UUID format
        if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            throw new Error('Invalid invoice ID');
        }

        const { error: updateError } = await fromTable('invoices')
            .update(updates)
            .eq('id', id);

        if (updateError) throw updateError;

        // Only sync items if provided
        if (items && items.length > 0) {
            const { error: deleteError } = await fromTable('invoice_items')
                .delete()
                .eq('invoice_id', id);

            if (deleteError) throw deleteError;

            const itemsData = items.map((item, index) => ({
                service_name: item.service_name,
                description: item.description || '',
                quantity: item.quantity,
                rate: item.rate,
                amount: item.amount,
                invoice_id: id,
                sort_order: index
            }));

            const { error: itemsError } = await fromTable('invoice_items')
                .insert(itemsData);

            if (itemsError) throw itemsError;
        }
    },

    async deleteInvoice(id: string): Promise<void> {
        // Validate UUID format
        if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            throw new Error('Invalid invoice ID');
        }

        const { error } = await fromTable('invoices')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async generateInvoiceNumber(): Promise<string> {
        const { data, error } = await supabase
            .rpc('generate_invoice_number');

        if (error) throw error;
        return data as string;
    },

    // ==========================================
    // BUSINESS SETTINGS
    // ==========================================
    async getBusinessSettings(): Promise<BusinessSettings | null> {
        const { data, error } = await fromTable('business_settings')
            .select('*')
            .maybeSingle();

        // Return null if no settings found (handle gracefully)
        if (error && error.code !== 'PGRST116') throw error;
        return data as unknown as BusinessSettings | null;
    },

    async updateBusinessSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
        // Upsert based on single row assumption
        const { data, error } = await fromTable('business_settings')
            .upsert({
                id: settings.id || undefined,
                ...settings,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data as unknown as BusinessSettings;
    }
};
