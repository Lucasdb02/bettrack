-- Create bookmakers table
CREATE TABLE IF NOT EXISTS public.bookmakers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  naam text NOT NULL,
  saldo numeric DEFAULT 0,
  start_datum date,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, naam)
);

-- Enable Row Level Security
ALTER TABLE public.bookmakers ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own bookmakers
CREATE POLICY "Users can view their own bookmakers"
  ON public.bookmakers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmakers"
  ON public.bookmakers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmakers"
  ON public.bookmakers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmakers"
  ON public.bookmakers FOR DELETE
  USING (auth.uid() = user_id);
