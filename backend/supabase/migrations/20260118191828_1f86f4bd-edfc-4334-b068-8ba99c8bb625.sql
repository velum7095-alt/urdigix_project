-- Create audit log table for user role changes
CREATE TABLE public.user_role_audit (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_role app_role,
    performed_by UUID,
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ip_address TEXT
);

-- Enable RLS on audit table
ALTER TABLE public.user_role_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view role audit logs"
ON public.user_role_audit
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create trigger function for auditing role changes
CREATE OR REPLACE FUNCTION public.audit_user_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.user_role_audit (user_id, role, action, performed_by)
        VALUES (NEW.user_id, NEW.role, 'INSERT', auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.user_role_audit (user_id, role, action, old_role, performed_by)
        VALUES (NEW.user_id, NEW.role, 'UPDATE', OLD.role, auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.user_role_audit (user_id, role, action, old_role, performed_by)
        VALUES (OLD.user_id, OLD.role, 'DELETE', OLD.role, auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Create trigger on user_roles table
CREATE TRIGGER user_roles_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.audit_user_role_changes();

-- Add index for faster audit queries
CREATE INDEX idx_user_role_audit_user_id ON public.user_role_audit(user_id);
CREATE INDEX idx_user_role_audit_performed_at ON public.user_role_audit(performed_at DESC);