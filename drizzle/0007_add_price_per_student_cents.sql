-- Add optional per-student price to platform plans (e.g. R$ 1,99/aluno for Pro plans)
ALTER TABLE platform_plans ADD COLUMN price_per_student_cents integer;
