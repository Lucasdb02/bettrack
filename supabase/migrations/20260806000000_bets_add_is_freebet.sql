-- Add freebet flag: when true, the stake is not returned/lost (bookmaker-funded stake)
ALTER TABLE public.bets
  ADD COLUMN IF NOT EXISTS is_freebet boolean NOT NULL DEFAULT false;
