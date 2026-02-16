-- Planos com trial de 30 dias: cartão obrigatório, R$ 0 hoje, cobrança após trial
ALTER TABLE platform_plans ADD COLUMN trial_days integer;
