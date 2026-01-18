-- Create admin role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user roles table for secure role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create site_content table for editable content
CREATE TABLE public.site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site content"
ON public.site_content FOR SELECT
USING (true);

CREATE POLICY "Only admins can edit site content"
ON public.site_content FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create contact_submissions table
CREATE TABLE public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only admins can view submissions"
ON public.contact_submissions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update submissions"
ON public.contact_submissions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete submissions"
ON public.contact_submissions FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create page_views table for analytics
CREATE TABLE public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path TEXT NOT NULL,
    visitor_id TEXT,
    referrer TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
ON public.page_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only admins can view analytics"
ON public.page_views FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default site content
INSERT INTO public.site_content (section_key, content) VALUES
('hero', '{"title": "Digital Marketing Excellence", "subtitle": "We help brands grow through strategic digital marketing, compelling content, and data-driven campaigns."}'),
('services', '{"items": [{"title": "Social Media Marketing", "description": "Strategic content creation and management across all major platforms."}, {"title": "Video Production", "description": "Professional video content that captures attention and drives engagement."}, {"title": "Brand Strategy", "description": "Comprehensive brand development and positioning strategies."}, {"title": "Analytics & Insights", "description": "Data-driven insights to optimize your marketing performance."}]}'),
('testimonials', '{"items": [{"name": "Sarah Johnson", "role": "CEO, TechStart", "text": "Their video content went viral on multiple occasions. The reels they created helped us gain 10K+ followers in just two months."}, {"name": "Michael Chen", "role": "Marketing Director, GrowthCo", "text": "The team delivered exceptional results. Our engagement rates increased by 300% within the first quarter."}]}');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();