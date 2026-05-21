-- Allow 'correctie' as transaction type and remove the amount > 0 constraint
-- so that negative correction amounts are accepted.

ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_type_check
  CHECK (type IN ('deposit', 'withdrawal', 'correctie'));

ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS transactions_amount_check;
