-- ============================================
-- URDIGIX CONTRACTS SYSTEM DATABASE SCHEMA
-- ============================================

-- Create Contracts Table
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number TEXT NOT NULL UNIQUE,
    contract_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Client details
    client_name TEXT NOT NULL,
    client_business_name TEXT NOT NULL DEFAULT '',
    client_phone TEXT NOT NULL DEFAULT '',
    client_email TEXT NOT NULL DEFAULT '',
    client_address TEXT NOT NULL DEFAULT '',
    
    -- Contract terms
    project_scope TEXT NOT NULL DEFAULT 'The Service Provider agrees to provide the design and marketing services as per the approved proposal and scope of work mutually agreed upon by both parties.',
    payment_terms TEXT NOT NULL DEFAULT '• 50% advance payment is required to initiate the project.\n• 50% balance payment upon completion before final delivery.\n• All payments are non-refundable once work has been initiated.\n• Payments can be made via bank transfer / UPI as shared by the provider.',
    project_timeline TEXT NOT NULL DEFAULT 'The project timeline will be confirmed after finalizing the requirements and receiving the advance payment. Delays in providing content or feedback may affect delivery timelines.',
    confidentiality_terms TEXT NOT NULL DEFAULT 'Both parties agree to keep all confidential information shared during the project strictly private and not disclose it to any third party.',
    ownership_terms TEXT NOT NULL DEFAULT 'Upon full payment, the client will own the final deliverables. The provider retains the right to showcase the work in the portfolio.',
    revisions_terms TEXT NOT NULL DEFAULT '• Each deliverable includes up to 2 rounds of revisions.\n• Additional revisions beyond the included rounds will be chargeable.\n• Feedback should be provided within the agreed timeline to avoid delays.',
    cancellation_policy TEXT NOT NULL DEFAULT '• If the client cancels the project before completion, the advance payment is non-refundable.\n• If cancellation is made after work has started, charges will be calculated based on the work completed.',
    liability_terms TEXT NOT NULL DEFAULT 'The Service Provider shall not be liable for any indirect, incidental, or consequential damages arising from the use of the deliverables or any delay in delivery due to circumstances beyond control.',
    governing_law TEXT NOT NULL DEFAULT 'This contract shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the jurisdiction of the courts in Bangalore, Karnataka.',
    
    -- Signee details
    client_signee_name TEXT NOT NULL DEFAULT '',
    client_signee_designation TEXT NOT NULL DEFAULT '',
    client_signee_company TEXT NOT NULL DEFAULT '',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admin full access to contracts"
ON public.contracts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create Contract Items Table
CREATE TABLE IF NOT EXISTS public.contract_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    delivery_time TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS on Contract Items
ALTER TABLE public.contract_items ENABLE ROW LEVEL SECURITY;

-- Admin policies for Contract Items
CREATE POLICY "Admin full access to contract_items"
ON public.contract_items
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for update_at
CREATE TRIGGER update_contracts_updated_at
BEFORE UPDATE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate next contract number
CREATE OR REPLACE FUNCTION public.generate_contract_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    next_num INTEGER;
    year_str TEXT;
    num_str TEXT;
BEGIN
    year_str := to_char(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(SUBSTRING(contract_number FROM '[0-9]+$')::INTEGER), 0) + 1
    INTO next_num
    FROM public.contracts
    WHERE contract_number LIKE 'UDX-CON-' || year_str || '-%';
    
    num_str := lpad(next_num::TEXT, 4, '0');
    RETURN 'UDX-CON-' || year_str || '-' || num_str;
END;
$$;
