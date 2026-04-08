-- ORION v19 — Schema completo para conexão Supabase
-- Executar no Supabase SQL Editor (uma vez)

-- ══════════════════════════════════════════════
-- EMPRESAS
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.empresas (
  id text PRIMARY KEY,
  nome text NOT NULL,
  sigla text NOT NULL,
  descricao text DEFAULT '',
  cor text DEFAULT '#3b82f6',
  rgb text DEFAULT '59,130,246',
  score integer DEFAULT 50,
  status text DEFAULT 'Novo',
  status_cor text DEFAULT '#3b82f6',
  fat numeric DEFAULT 0,
  meta numeric DEFAULT 0,
  result numeric DEFAULT 0,
  cresc numeric DEFAULT 0,
  drive text DEFAULT 'https://drive.google.com',
  tipo text DEFAULT 'portfolio',
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "empresas_auth" ON public.empresas FOR ALL USING (auth.uid() IS NOT NULL);

-- Seed das 5 empresas base
INSERT INTO public.empresas (id, nome, sigla, descricao, cor, rgb, score, status, status_cor, fat, meta, result, cresc, tipo) VALUES
  ('dw','Doctor Wealth','DW','Ecossistema Financeiro Médico','#3b82f6','59,130,246',80,'Crescimento','#10b981',48500,60000,22000,18.4,'portfolio'),
  ('of','Original Fotografia','OF','Estúdio & Eventos Visuais','#f59e0b','245,158,11',52,'Turnaround','#f59e0b',28000,35000,4200,-4.2,'portfolio'),
  ('fs','Forme Seguro','FS','Fundos de Formatura Premium','#8b5cf6','139,92,246',65,'Lançamento','#06b6d4',15000,50000,8500,50,'portfolio'),
  ('cdl','CDL Divinópolis','CDL','Câmara de Dirigentes Lojistas','#10b981','16,185,129',88,'Estável','#10b981',35000,40000,12000,5.3,'portfolio'),
  ('gp','Gestão Pessoal','GP','Patrimônio & Finanças Pessoais','#ec4899','236,72,153',75,'Saudável','#10b981',0,0,0,0,'pessoal')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════
-- LANÇAMENTOS FINANCEIROS
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.lancamentos (
  id text PRIMARY KEY,
  empresa_id text NOT NULL REFERENCES public.empresas(id),
  type text DEFAULT 'expense',
  descricao text NOT NULL,
  valor numeric DEFAULT 0,
  data date NOT NULL,
  categoria text DEFAULT '',
  status text DEFAULT 'confirmado',
  recorrente boolean DEFAULT false,
  frequencia text DEFAULT '',
  observacao text DEFAULT '',
  impacta_resultado boolean DEFAULT true,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.lancamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lancamentos_auth" ON public.lancamentos FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_lancamentos_empresa ON public.lancamentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON public.lancamentos(data);
CREATE INDEX IF NOT EXISTS idx_lancamentos_type ON public.lancamentos(type);

-- ══════════════════════════════════════════════
-- TAREFAS
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.tarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id text NOT NULL REFERENCES public.empresas(id),
  texto text NOT NULL,
  prioridade text DEFAULT 'media',
  concluida boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tarefas_auth" ON public.tarefas FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_tarefas_empresa ON public.tarefas(empresa_id);

-- ══════════════════════════════════════════════
-- CRM
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.crm_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id text NOT NULL REFERENCES public.empresas(id),
  fase text NOT NULL,
  fase_cor text DEFAULT '#3b82f6',
  nome text NOT NULL,
  valor text DEFAULT '',
  posicao integer DEFAULT 0,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.crm_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_auth" ON public.crm_itens FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_crm_empresa ON public.crm_itens(empresa_id);

-- ══════════════════════════════════════════════
-- NOTAS
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.notas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id text NOT NULL REFERENCES public.empresas(id),
  conteudo text DEFAULT '',
  user_id uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(empresa_id)
);
ALTER TABLE public.notas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notas_auth" ON public.notas FOR ALL USING (auth.uid() IS NOT NULL);

-- ══════════════════════════════════════════════
-- AGENDA
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.agenda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  dia text,
  num text,
  hora text DEFAULT 'Dia inteiro',
  cor text DEFAULT '#3b82f6',
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.agenda ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agenda_auth" ON public.agenda FOR ALL USING (auth.uid() IS NOT NULL);

-- ══════════════════════════════════════════════
-- ALERTAS
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.alertas (
  id serial PRIMARY KEY,
  texto text NOT NULL,
  nivel text DEFAULT 'amber',
  lido boolean DEFAULT false,
  horario text,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alertas_auth" ON public.alertas FOR ALL USING (auth.uid() IS NOT NULL);

-- Seed alertas iniciais
INSERT INTO public.alertas (texto, nivel, lido, horario) VALUES
  ('Original Fotografia — Inadimplência em 8,7% (limite: 5%)','red',false,'Hoje 09:15'),
  ('Original Fotografia — Contrato cliente XYZ inadimplente há 60 dias','red',false,'Hoje 08:30'),
  ('Forme Seguro — Meta mensal: apenas 30% atingida (R$ 15k / R$ 50k)','amber',false,'Ontem 17:00'),
  ('Doctor Wealth — 3 tarefas de alta prioridade pendentes','amber',false,'Ontem 14:22')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════
-- CHECK-INS
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL DEFAULT CURRENT_DATE,
  prioridade text DEFAULT '',
  decisao text DEFAULT '',
  resultado text DEFAULT '',
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(data)
);
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checkins_auth" ON public.checkins FOR ALL USING (auth.uid() IS NOT NULL);

-- ══════════════════════════════════════════════
-- CATEGORIAS (do v17)
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id text,
  nome text NOT NULL,
  tipo text NOT NULL,
  icone text,
  cor text,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

INSERT INTO public.categorias (nome, tipo, icone, cor) VALUES
  ('Salário','income','💰','#10b981'),
  ('Freelance','income','💼','#10b981'),
  ('Investimentos Rendimento','income','📈','#10b981'),
  ('Outras Receitas','income','➕','#10b981'),
  ('Distribuição de Lucros','income','🏆','#10b981'),
  ('Alimentação','expense','🍽️','#ef4444'),
  ('Moradia','expense','🏠','#ef4444'),
  ('Transporte','expense','🚗','#ef4444'),
  ('Saúde','expense','🏥','#ef4444'),
  ('Lazer e Entretenimento','expense','🎭','#ef4444'),
  ('Educação','expense','📚','#ef4444'),
  ('Impostos e Taxas','expense','📋','#ef4444'),
  ('Assinaturas','expense','📱','#ef4444'),
  ('Outras Despesas','expense','➖','#ef4444'),
  ('Pró-labore Sócio','expense','👔','#f59e0b'),
  ('Transferência Entre Contas','transfer','↔️','#6366f1'),
  ('Aporte em Investimento','investment','📊','#8b5cf6'),
  ('Resgate de Investimento','investment','💹','#8b5cf6')
ON CONFLICT DO NOTHING;
