import { supabase } from '@/integrations/supabase/client';
import { Quotation, Invoice, QuotationItem, InvoiceItem } from '@/types/billing';

export const billingService = {
    // ==========================================
    // QUOTATIONS
    // ==========================================
    async getQuotations() {
        // Fetch quotations with their items
        const { data, error } = await supabase
            .from('quotations')
            .select(`
                *,
                items:quotation_items(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Quotation[];
    },

    async createQuotation(quotation: Partial<Quotation>, items: Partial<QuotationItem>[]) {
        // 1. Create Quotation Record
        const { data: newQuotation, error: quoteError } = await supabase
            .from('quotations')
            .insert({
                ...quotation,
                // Ensure default status if missing
                status: quotation.status || 'draft',
                // Let DB handle timestamps and IDs
            })
            .select()
            .single();

        if (quoteError) throw quoteError;

        // 2. Create Items
        if (items && items.length > 0) {
            const itemsData = items.map((item, index) => ({
                ...item,
                quotation_id: newQuotation.id,
                sort_order: index
            }));

            const { error: itemsError } = await supabase
                .from('quotation_items')
                .insert(itemsData);

            if (itemsError) throw itemsError;
        }

        return newQuotation;
    },

    async updateQuotation(id: string, updates: Partial<Quotation>, items: Partial<QuotationItem>[]) {
        // 1. Update Quotation details
        const { error: updateError } = await supabase
            .from('quotations')
            .update(updates)
            .eq('id', id);

        if (updateError) throw updateError;

        // 2. Sync Items (Strategy: Delete all and re-create is simplest for strict sync)
        // Note: For large datasets, upsert is better, but for invoices/quotes, full replace is safer to assume order.

        // Delete existing items
        const { error: deleteError } = await supabase
            .from('quotation_items')
            .delete()
            .eq('quotation_id', id);

        if (deleteError) throw deleteError;

        // Re-insert items
        if (items && items.length > 0) {
            const itemsData = items.map((item, index) => ({
                ...item,
                quotation_id: id,
                // Remove ID if it exists to allow DB to generate new one, or keep it if strictly tracking history
                // Ideally, regenerate IDs to avoid conflicts unless doing upsert
                id: undefined,
                sort_order: index
            }));

            const { error: itemsError } = await supabase
                .from('quotation_items')
                .insert(itemsData);

            if (itemsError) throw itemsError;
        }
    },

    async deleteQuotation(id: string) {
        // Items will auto-delete due to CASCADE
        const { error } = await supabase
            .from('quotations')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async generateQuotationNumber() {
        const { data, error } = await supabase
            .rpc('generate_quotation_number');

        if (error) throw error;
        return data as string;
    },

    // ==========================================
    // INVOICES
    // ==========================================
    async getInvoices() {
        const { data, error } = await supabase
            .from('invoices')
            .select(`
                *,
                items:invoice_items(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Invoice[];
    },

    async createInvoice(invoice: Partial<Invoice>, items: Partial<InvoiceItem>[]) {
        const { data: newInvoice, error: invError } = await supabase
            .from('invoices')
            .insert({
                ...invoice,
                status: invoice.status || 'draft',
            })
            .select()
            .single();

        if (invError) throw invError;

        if (items && items.length > 0) {
            const itemsData = items.map((item, index) => ({
                ...item,
                invoice_id: newInvoice.id,
                sort_order: index
            }));

            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(itemsData);

            if (itemsError) throw itemsError;
        }

        return newInvoice;
    },

    async updateInvoice(id: string, updates: Partial<Invoice>, items: Partial<InvoiceItem>[]) {
        const { error: updateError } = await supabase
            .from('invoices')
            .update(updates)
            .eq('id', id);

        if (updateError) throw updateError;

        const { error: deleteError } = await supabase
            .from('invoice_items')
            .delete()
            .eq('invoice_id', id);

        if (deleteError) throw deleteError;

        if (items && items.length > 0) {
            const itemsData = items.map((item, index) => ({
                ...item,
                invoice_id: id,
                id: undefined,
                sort_order: index
            }));

            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(itemsData);

            if (itemsError) throw itemsError;
        }
    },

    async deleteInvoice(id: string) {
        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async generateInvoiceNumber() {
        const { data, error } = await supabase
            .rpc('generate_invoice_number');

        if (error) throw error;
        return data as string;
    },

    // ==========================================
    // BUSINESS SETTINGS
    // ==========================================
    async getBusinessSettings() {
        const { data, error } = await supabase
            .from('business_settings')
            .select('*')
            .single();

        // Return default if empty or error (handle gracefully)
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async updateBusinessSettings(settings: any) {
        // Upsert based on single row assumption
        const { data, error } = await supabase
            .from('business_settings')
            .upsert({
                // Assuming we use a fixed ID or just relying on single row
                id: settings.id || undefined,
                ...settings,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
