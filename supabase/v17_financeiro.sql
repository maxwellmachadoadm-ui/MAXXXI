-- ORION v17 — Engine Financeira: categorias, contas, DRE, fluxo de caixa
-- Executar no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id text,
  nome text NOT NULL,
  tipo text NOT NULL,
  icone text,
  cor text,
  parent_id uuid REFERENCES public.categorias(id),
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categorias_auth" ON public.categorias FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS public.contas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  nome text NOT NULL,
  tipo text NOT NULL,
  banco text,
  saldo_inicial numeric DEFAULT 0,
  saldo_atual numeric DEFAULT 0,
  cor text,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.contas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contas_auth" ON public.contas FOR ALL USING (auth.uid() IS NOT NULL);

ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS type text DEFAULT 'expense';
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categorias(id);
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS conta_id uuid REFERENCES public.contas(id);
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS conta_destino_id uuid REFERENCES public.contas(id);
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS origin text DEFAULT 'manual';
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS amount numeric DEFAULT 0;
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS date_competencia date;
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS date_pagamento date;
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS recorrente boolean DEFAULT false;
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS frequencia_recorrencia text;
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS impacta_resultado boolean DEFAULT true;
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS tags text[];

CREATE OR REPLACE FUNCTION public.set_impacta_resultado()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type IN ('transfer', 'investment') THEN
    NEW.impacta_resultado := false;
  ELSE
    NEW.impacta_resultado := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_impacta_resultado ON public.lancamentos;
CREATE TRIGGER trg_impacta_resultado
  BEFORE INSERT OR UPDATE ON public.lancamentos
  FOR EACH ROW EXECUTE FUNCTION public.set_impacta_resultado();

CREATE INDEX IF NOT EXISTS idx_lancamentos_type ON public.lancamentos(type);
CREATE INDEX IF NOT EXISTS idx_lancamentos_date ON public.lancamentos(data);
CREATE INDEX IF NOT EXISTS idx_lancamentos_category ON public.lancamentos(category_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_impacta ON public.lancamentos(impacta_resultado);

INSERT INTO public.categorias (nome, tipo, icone, cor) VALUES
('Salário','income','💰','#10b981'),
('Freelance','income','💼','#10b981'),
('Investimentos Rendimento','income','📈','#10b981'),
('Outras Receitas','income','➕','#10b981'),
('Alimentação','expense','🍽️','#ef4444'),
('Moradia','expense','🏠','#ef4444'),
('Transporte','expense','🚗','#ef4444'),
('Saúde','expense','🏥','#ef4444'),
('Salão e Barbearia','expense','✂️','#ef4444'),
('Lazer e Entretenimento','expense','🎭','#ef4444'),
('Educação','expense','📚','#ef4444'),
('Vestuário','expense','👕','#ef4444'),
('Impostos e Taxas','expense','📋','#ef4444'),
('Financiamento','expense','🏦','#ef4444'),
('Manutenção Veículo','expense','🔧','#ef4444'),
('Manutenção Casa','expense','🔨','#ef4444'),
('Assinaturas','expense','📱','#ef4444'),
('Outras Despesas','expense','➖','#ef4444'),
('Transferência Entre Contas','transfer','↔️','#6366f1'),
('Aporte em Investimento','investment','📊','#8b5cf6'),
('Resgate de Investimento','investment','💹','#8b5cf6'),
('Pró-labore Sócio','expense','👔','#f59e0b'),
('Distribuição de Lucros','income','🏆','#10b981')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE VIEW public.vw_dre_mensal AS
SELECT
  empresa_id,
  to_char(data, 'YYYY-MM') as competencia,
  type,
  categoria,
  SUM(CASE WHEN tipo='receita' OR type='income' THEN COALESCE(valor,amount,0) ELSE 0 END) as total_receitas,
  SUM(CASE WHEN (tipo='despesa' OR type='expense') AND impacta_resultado=true THEN COALESCE(valor,amount,0) ELSE 0 END) as total_despesas,
  SUM(CASE WHEN tipo='receita' OR type='income' THEN COALESCE(valor,amount,0) ELSE 0 END) -
  SUM(CASE WHEN (tipo='despesa' OR type='expense') AND impacta_resultado=true THEN COALESCE(valor,amount,0) ELSE 0 END) as resultado,
  COUNT(*) as total_lancamentos
FROM public.lancamentos
WHERE status != 'cancelado'
GROUP BY empresa_id, to_char(data, 'YYYY-MM'), type, categoria;

CREATE OR REPLACE VIEW public.vw_fluxo_caixa AS
SELECT
  empresa_id,
  to_char(data, 'YYYY-MM') as mes,
  SUM(CASE WHEN tipo='receita' OR type='income' THEN COALESCE(valor,amount,0) ELSE 0 END) as entradas,
  SUM(CASE WHEN tipo='despesa' OR type='expense' THEN COALESCE(valor,amount,0) ELSE 0 END) as saidas,
  SUM(CASE WHEN tipo='receita' OR type='income' THEN COALESCE(valor,amount,0) ELSE 0 END) -
  SUM(CASE WHEN tipo='despesa' OR type='expense' THEN COALESCE(valor,amount,0) ELSE 0 END) as saldo_mes
FROM public.lancamentos
WHERE status != 'cancelado'
GROUP BY empresa_id, to_char(data, 'YYYY-MM')
ORDER BY mes;

CREATE OR REPLACE VIEW public.vw_resumo_categoria AS
SELECT
  l.empresa_id,
  to_char(l.data, 'YYYY-MM') as competencia,
  l.categoria,
  l.type,
  c.icone,
  c.cor,
  COUNT(*) as quantidade,
  SUM(COALESCE(l.valor,l.amount,0)) as total
FROM public.lancamentos l
LEFT JOIN public.categorias c ON c.nome = l.categoria
WHERE l.status != 'cancelado' AND l.impacta_resultado = true
GROUP BY l.empresa_id, to_char(l.data, 'YYYY-MM'), l.categoria, l.type, c.icone, c.cor;
