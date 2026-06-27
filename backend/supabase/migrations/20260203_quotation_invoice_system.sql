-- ============================================
-- URDIGIX Quotation & Invoice Management System
-- Database Schema
-- ============================================

-- Business Settings Table
CREATE TABLE IF NOT EXISTS public.business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL DEFAULT 'URDIGIX',
    company_address TEXT DEFAULT 'India',
    company_phone TEXT DEFAULT '+91 78930 40375',
    company_email TEXT DEFAULT 'hello@urdigix.com',
    company_website TEXT DEFAULT 'www.urdigix.com',
    logo_url TEXT,
    currency TEXT NOT NULL DEFAULT '₹',
    currency_code TEXT NOT NULL DEFAULT 'INR',
    gst_number TEXT,
    gst_percentage DECIMAL(5,2) DEFAULT 18.00,
    enable_gst BOOLEAN DEFAULT true,
    enable_discount BOOLEAN DEFAULT true,
    default_payment_terms TEXT DEFAULT '50% advance, balance on delivery',
    default_validity_days INTEGER DEFAULT 15,
    bank_name TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    upi_id TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Policies for business_settings
CREATE POLICY "Anyone can view business settings"
ON public.business_settings FOR SELECT
USING (true);

CREATE POLICY "Only admins can edit business settings"
ON public.business_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.business_settings (company_name) 
VALUES ('URDIGIX')
ON CONFLICT DO NOTHING;

-- ============================================
-- Quotations Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number TEXT UNIQUE NOT NULL,
    quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    validity_days INTEGER DEFAULT 15,
    valid_until DATE,
    
    -- Client Details
    client_name TEXT NOT NULL,
    client_business_name TEXT,
    client_phone TEXT,
    client_email TEXT,
    client_address TEXT,
    
    -- Pricing
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_type TEXT DEFAULT 'percentage', -- 'percentage' or 'fixed'
    discount_value DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    taxable_amount DECIMAL(12,2) DEFAULT 0,
    gst_percentage DECIMAL(5,2) DEFAULT 18.00,
    gst_amount DECIMAL(12,2) DEFAULT 0,
    grand_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- Terms
    payment_terms TEXT,
    notes TEXT,
    
    -- Status: draft, sent, accepted, rejected, expired
    status TEXT NOT NULL DEFAULT 'draft',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    sent_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    converted_to_invoice BOOLEAN DEFAULT false,
    invoice_id UUID
);

-- Enable RLS
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Policies for quotations
CREATE POLICY "Only admins can manage quotations"
ON public.quotations FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- Quotation Items Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE NOT NULL,
    service_name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    rate DECIMAL(12,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- Policies for quotation_items
CREATE POLICY "Only admins can manage quotation items"
ON public.quotation_items FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- Invoices Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    
    -- Link to quotation (optional)
    quotation_id UUID REFERENCES public.quotations(id),
    quotation_number TEXT,
    
    -- Client Details
    client_name TEXT NOT NULL,
    client_business_name TEXT,
    client_phone TEXT,
    client_email TEXT,
    client_address TEXT,
    
    -- Pricing
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_type TEXT DEFAULT 'percentage',
    discount_value DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    taxable_amount DECIMAL(12,2) DEFAULT 0,
    gst_percentage DECIMAL(5,2) DEFAULT 18.00,
    gst_amount DECIMAL(12,2) DEFAULT 0,
    grand_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- Payment
    amount_paid DECIMAL(12,2) DEFAULT 0,
    balance_due DECIMAL(12,2) DEFAULT 0,
    payment_terms TEXT,
    notes TEXT,
    
    -- Status: draft, sent, paid, pending, overdue, cancelled
    status TEXT NOT NULL DEFAULT 'draft',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    sent_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Policies for invoices
CREATE POLICY "Only admins can manage invoices"
ON public.invoices FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- Invoice Items Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    service_name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    rate DECIMAL(12,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Policies for invoice_items
CREATE POLICY "Only admins can manage invoice items"
ON public.invoice_items FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- Functions for auto-generating numbers
-- ============================================

-- Generate quotation number (URD-Q-YYYYMM-XXX)
CREATE OR REPLACE FUNCTION generate_quotation_number()
RETURNS TEXT AS $$
DECLARE
    year_month TEXT;
    seq_num INTEGER;
    new_number TEXT;
BEGIN
    year_month := TO_CHAR(CURRENT_DATE, 'YYYYMM');
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(quotation_number FROM 'URD-Q-' || year_month || '-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO seq_num
    FROM public.quotations
    WHERE quotation_number LIKE 'URD-Q-' || year_month || '-%';
    
    new_number := 'URD-Q-' || year_month || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Generate invoice number (URD-INV-YYYYMM-XXX)
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    year_month TEXT;
    seq_num INTEGER;
    new_number TEXT;
BEGIN
    year_month := TO_CHAR(CURRENT_DATE, 'YYYYMM');
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(invoice_number FROM 'URD-INV-' || year_month || '-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO seq_num
    FROM public.invoices
    WHERE invoice_number LIKE 'URD-INV-' || year_month || '-%';
    
    new_number := 'URD-INV-' || year_month || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Update triggers
-- ============================================
CREATE TRIGGER update_quotations_updated_at
BEFORE UPDATE ON public.quotations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_settings_updated_at
BEFORE UPDATE ON public.business_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
