-- Mostrar Pipeline de Vendas por plano (opcional, ajuda o personal a crescer e migrar para PRO)
ALTER TABLE platform_plans ADD COLUMN has_sales_pipeline integer DEFAULT 0;
