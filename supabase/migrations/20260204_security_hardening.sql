-- ============================================
-- SECURITY HARDENING & AUDIT LOGGING
-- ============================================

-- 1. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,
    new_data JSONB,
    performed_by UUID REFERENCES auth.users(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ip_address TEXT -- Application can pass this via context if needed
);

-- Protect Audit Logs (Read-only for Admins, No updates/deletes allowed)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- No one can update or delete audit logs to ensure integrity
CREATE POLICY "No updates to audit logs"
ON public.audit_logs FOR UPDATE
USING (false);

CREATE POLICY "No deletes to audit logs"
ON public.audit_logs FOR DELETE
USING (false);

-- 2. Create Audit Trigger Function
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    user_id UUID;
BEGIN
    user_id := auth.uid();
    
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, new_data, performed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), user_id);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, performed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), user_id);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, performed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Apply Audit Triggers to Sensitive Tables
DROP TRIGGER IF EXISTS audit_quotations ON public.quotations;
CREATE TRIGGER audit_quotations
AFTER INSERT OR UPDATE OR DELETE ON public.quotations
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_invoices ON public.invoices;
CREATE TRIGGER audit_invoices
AFTER INSERT OR UPDATE OR DELETE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS audit_business_settings ON public.business_settings;
CREATE TRIGGER audit_business_settings
AFTER INSERT OR UPDATE OR DELETE ON public.business_settings
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- 4. Ensure `has_role` function exists and is secure
-- This assumes roles are stored in app_metadata or a separate roles table. 
-- For this hardening, we check app_metadata.
CREATE OR REPLACE FUNCTION public.has_role(
  _user_id UUID,
  _role TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check app_metadata for 'role' claim
  -- Security Note: app_metadata is secure and can only be updated by Supabase Admin/Auth hooks
  SELECT raw_app_meta_data->>'role' INTO user_role
  FROM auth.users
  WHERE id = _user_id;
  
  -- Also allow if the user is in a 'user_roles' table (if you use that pattern)
  -- But for now, we default to app_metadata check or strict email check for generic admin
  
  -- Fallback: If no role in metadata, check if email is in whitelist (Environment specific hardening)
  -- Ideally, use a dedicated permissions table.
  
  RETURN user_role = _role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
