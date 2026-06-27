-- ============================================
-- URDIGIX BILLING SYSTEM - SECURE DATABASE SCHEMA
-- ============================================
-- This migration creates a fully secure billing system with:
-- 1. Quotations & Invoices tables with proper constraints
-- 2. Line item tables with foreign key relationships
-- 3. Business settings table
-- 4. Strict RLS policies (admin-only access)
-- 5. Audit logging for all billing operations
-- 6. Secure number generation functions

-- ============================================
-- 1. BUSINESS SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL DEFAULT 'URDIGIX',
    company_address TEXT NOT NULL DEFAULT '',
    company_phone TEXT NOT NULL DEFAULT '',
    company_email TEXT NOT NULL DEFAULT '',
    company_website TEXT NOT NULL DEFAULT '',
    logo_url TEXT,
    currency TEXT NOT NULL DEFAULT '₹',
    currency_code TEXT NOT NULL DEFAULT 'INR',
    gst_number TEXT,
    gst_percentage NUMERIC(5,2) NOT NULL DEFAULT 18.00,
    enable_gst BOOLEAN NOT NULL DEFAULT true,
    enable_discount BOOLEAN NOT NULL DEFAULT true,
    default_payment_terms TEXT NOT NULL DEFAULT '50% advance, balance on delivery',
    default_validity_days INTEGER NOT NULL DEFAULT 15,
    bank_name TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    upi_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can access business settings
CREATE POLICY "Admin full access to business_settings"
ON public.business_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 2. QUOTATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number TEXT NOT NULL UNIQUE,
    quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    validity_days INTEGER NOT NULL DEFAULT 15,
    valid_until DATE NOT NULL,
    
    -- Client Information (encrypted-at-rest by Supabase)
    client_name TEXT NOT NULL,
    client_business_name TEXT NOT NULL DEFAULT '',
    client_phone TEXT NOT NULL DEFAULT '',
    client_email TEXT NOT NULL DEFAULT '',
    client_address TEXT NOT NULL DEFAULT '',
    
    -- Pricing
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    taxable_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    gst_percentage NUMERIC(5,2) NOT NULL DEFAULT 18.00,
    gst_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    
    -- Terms & Notes
    payment_terms TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    
    -- Conversion tracking
    converted_to_invoice BOOLEAN NOT NULL DEFAULT false,
    invoice_id UUID,
    
    -- Audit
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Only admins can access quotations
CREATE POLICY "Admin full access to quotations"
ON public.quotations
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_client_name ON public.quotations(client_name);
CREATE INDEX IF NOT EXISTS idx_quotations_date ON public.quotations(quotation_date DESC);

-- ============================================
-- 3. QUOTATION ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    rate NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (rate >= 0),
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- Only admins can access quotation items
CREATE POLICY "Admin full access to quotation_items"
ON public.quotation_items
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON public.quotation_items(quotation_id);

-- ============================================
-- 4. INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    
    -- Link to quotation
    quotation_id UUID REFERENCES public.quotations(id),
    quotation_number TEXT,
    
    -- Client Information
    client_name TEXT NOT NULL,
    client_business_name TEXT NOT NULL DEFAULT '',
    client_phone TEXT NOT NULL DEFAULT '',
    client_email TEXT NOT NULL DEFAULT '',
    client_address TEXT NOT NULL DEFAULT '',
    
    -- Pricing
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    taxable_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    gst_percentage NUMERIC(5,2) NOT NULL DEFAULT 18.00,
    gst_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    
    -- Payment
    amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
    balance_due NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_terms TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'pending', 'overdue', 'cancelled')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    
    -- Audit
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Only admins can access invoices
CREATE POLICY "Admin full access to invoices"
ON public.invoices
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client_name ON public.invoices(client_name);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- ============================================
-- 5. INVOICE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    rate NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (rate >= 0),
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Only admins can access invoice items
CREATE POLICY "Admin full access to invoice_items"
ON public.invoice_items
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

-- ============================================
-- 6. BILLING AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.billing_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    performed_by UUID REFERENCES auth.users(id),
    performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address TEXT
);

-- Enable RLS
ALTER TABLE public.billing_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admin can view billing audit logs"
ON public.billing_audit_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_billing_audit_record ON public.billing_audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_billing_audit_date ON public.billing_audit_log(performed_at DESC);

-- ============================================
-- 7. SECURE QUOTATION NUMBER GENERATOR
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_quotation_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    year_prefix TEXT;
    sequence_num INTEGER;
    new_number TEXT;
BEGIN
    -- Check if caller is admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
    
    year_prefix := TO_CHAR(CURRENT_DATE, 'YY');
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(
        CASE 
            WHEN quotation_number ~ ('^URD-Q' || year_prefix || '-[0-9]+$')
            THEN SUBSTRING(quotation_number FROM '[0-9]+$')::INTEGER
            ELSE 0
        END
    ), 0) + 1 INTO sequence_num
    FROM public.quotations
    WHERE quotation_number LIKE 'URD-Q' || year_prefix || '-%';
    
    new_number := 'URD-Q' || year_prefix || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$;

-- ============================================
-- 8. SECURE INVOICE NUMBER GENERATOR
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    year_prefix TEXT;
    sequence_num INTEGER;
    new_number TEXT;
BEGIN
    -- Check if caller is admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
    
    year_prefix := TO_CHAR(CURRENT_DATE, 'YY');
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(
        CASE 
            WHEN invoice_number ~ ('^URD-INV' || year_prefix || '-[0-9]+$')
            THEN SUBSTRING(invoice_number FROM '[0-9]+$')::INTEGER
            ELSE 0
        END
    ), 0) + 1 INTO sequence_num
    FROM public.invoices
    WHERE invoice_number LIKE 'URD-INV' || year_prefix || '-%';
    
    new_number := 'URD-INV' || year_prefix || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$;

-- ============================================
-- 9. AUDIT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.billing_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.billing_audit_log (table_name, record_id, action, new_data, performed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.billing_audit_log (table_name, record_id, action, old_data, new_data, performed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.billing_audit_log (table_name, record_id, action, old_data, performed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- ============================================
-- 10. APPLY AUDIT TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS audit_quotations ON public.quotations;
CREATE TRIGGER audit_quotations
    AFTER INSERT OR UPDATE OR DELETE ON public.quotations
    FOR EACH ROW EXECUTE FUNCTION public.billing_audit_trigger();

DROP TRIGGER IF EXISTS audit_invoices ON public.invoices;
CREATE TRIGGER audit_invoices
    AFTER INSERT OR UPDATE OR DELETE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.billing_audit_trigger();

-- ============================================
-- 11. UPDATE TIMESTAMP TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS update_quotations_updated_at ON public.quotations;
CREATE TRIGGER update_quotations_updated_at
    BEFORE UPDATE ON public.quotations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_settings_updated_at ON public.business_settings;
CREATE TRIGGER update_business_settings_updated_at
    BEFORE UPDATE ON public.business_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 12. INSERT DEFAULT BUSINESS SETTINGS
-- ============================================
INSERT INTO public.business_settings (
    company_name,
    company_email,
    company_phone,
    company_address,
    company_website
) VALUES (
    'URDIGIX',
    'hello@urdigix.com',
    '+91 9876543210',
    'India',
    'https://urdigix.com'
) ON CONFLICT DO NOTHING;