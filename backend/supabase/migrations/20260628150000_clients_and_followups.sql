-- ============================================
-- CLIENT TRACKING AND FOLLOW-UPS DATABASE SCHEMA
-- ============================================

-- 1. Create Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    business_name TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'active', 'inactive', 'completed')),
    facebook_url TEXT NOT NULL DEFAULT '',
    instagram_url TEXT NOT NULL DEFAULT '',
    whatsapp_number TEXT NOT NULL DEFAULT '',
    website_url TEXT NOT NULL DEFAULT '',
    referral_source TEXT NOT NULL DEFAULT '',
    contact_type TEXT NOT NULL DEFAULT 'direct' CHECK (contact_type IN ('direct', 'facebook', 'instagram', 'whatsapp', 'website', 'referral', 'other')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on Clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for Clients
CREATE POLICY "Admin full access to clients"
ON public.clients
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Create Client Follow-ups Table
CREATE TABLE IF NOT EXISTS public.client_follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    follow_up_date TIMESTAMPTZ NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'rescheduled')),
    medium TEXT NOT NULL DEFAULT 'phone' CHECK (medium IN ('phone', 'whatsapp', 'email', 'in_person')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on Client Follow-ups
ALTER TABLE public.client_follow_ups ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for Client Follow-ups
CREATE POLICY "Admin full access to client_follow_ups"
ON public.client_follow_ups
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Create update triggers for timestamps
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_follow_ups_updated_at
BEFORE UPDATE ON public.client_follow_ups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
