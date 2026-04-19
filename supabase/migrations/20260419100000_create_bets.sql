-- Create bets table
CREATE TABLE IF NOT EXISTS public.bets (
  id         uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid          REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  datum      date          NOT NULL,
  sport      text,
  wedstrijd  text,
  markt      text,
  selectie   text,
  odds       numeric(10,3),
  inzet      numeric(12,2),
  uitkomst   text          CHECK (uitkomst IN ('gewonnen','verloren','lopend','push','void','half_gewonnen','half_verloren','onbeslist')),
  bookmaker  text,
  notities   text,
  tags       text[],
  created_at timestamptz   DEFAULT now() NOT NULL
);

ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bets"
  ON public.bets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bets"
  ON public.bets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bets"
  ON public.bets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bets"
  ON public.bets FOR DELETE
  USING (auth.uid() = user_id);
