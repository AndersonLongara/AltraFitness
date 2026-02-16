-- Corrige preços dos planos platform_plans (em centavos)
-- AltraPerformance: R$ 99,90 = 9990 centavos
-- AltraElite: R$ 851,15 = 85115 centavos

UPDATE platform_plans SET price_cents = 9990 WHERE slug = 'pro-monthly';
UPDATE platform_plans SET price_cents = 85115 WHERE slug = 'pro-yearly';
