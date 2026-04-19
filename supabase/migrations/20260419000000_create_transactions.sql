-- Create transactions table (deposits + withdrawals per bookmaker)
CREATE TABLE IF NOT EXISTS public.transactions (
  id           uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid           REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bookmaker_id uuid           REFERENCES public.bookmakers(id) ON DELETE CASCADE NOT NULL,
  type         text           NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount       numeric(12,2)  NOT NULL CHECK (amount > 0),
  datum        date           NOT NULL,
  notitie      text,
  created_at   timestamptz    DEFAULT now() NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);
