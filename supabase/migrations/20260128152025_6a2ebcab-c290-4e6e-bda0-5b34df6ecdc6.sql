-- Create the notes table
CREATE TABLE public.notes (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL
);

-- Insert some sample data into the table
INSERT INTO public.notes (title)
VALUES
  ('Today I created a Supabase project.'),
  ('I added some data and queried it from Next.js.'),
  ('It was awesome!');

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Add a policy to allow public read access
CREATE POLICY "Anyone can view notes"
ON public.notes
FOR SELECT
USING (true);