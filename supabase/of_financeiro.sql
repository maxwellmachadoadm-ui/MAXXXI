-- Original Fotografia — ERP Financeiro por Projeto/Turma
-- Execute no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.of_projetos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  turma text,
  instituicao text,
  curso text,
  cidade text,
  data_inicio date,
  data_fim date,
  data_entrega_prevista date,
  status text DEFAULT 'captacao',
  num_clientes_esperados integer DEFAULT 0,
  num_clientes_confirmados integer DEFAULT 0,
  num_clientes_pagantes integer DEFAULT 0,
  ticket_medio_esperado numeric DEFAULT 0,
  ticket_medio_contratado numeric DEFAULT 0,
  meta_receita numeric DEFAULT 0,
  observacao text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.of_plano_contas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE,
  nome text NOT NULL,
  tipo text NOT NULL,
  categoria text,
  subcategoria text,
  rateavel boolean DEFAULT false,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.of_lancamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  projeto_id uuid REFERENCES public.of_projetos(id),
  plano_conta_id uuid REFERENCES public.of_plano_contas(id),
  tipo text NOT NULL,
  natureza text DEFAULT 'direta',
  descricao text NOT NULL,
  valor_previsto numeric DEFAULT 0,
  valor_realizado numeric DEFAULT 0,
  data_prevista date,
  data_realizada date,
  competencia text,
  origem text,
  destino text,
  forma_pagamento text,
  parcelas integer DEFAULT 1,
  parcela_atual integer DEFAULT 1,
  status text DEFAULT 'previsto',
  conciliado boolean DEFAULT false,
  observacao text,
  anexo_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.of_parcelas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lancamento_id uuid REFERENCES public.of_lancamentos(id) ON DELETE CASCADE,
  projeto_id uuid REFERENCES public.of_projetos(id),
  cliente_nome text,
  cliente_contato text,
  numero_parcela integer,
  total_parcelas integer,
  valor numeric NOT NULL,
  data_vencimento date NOT NULL,
  data_pagamento date,
  status text DEFAULT 'aberto',
  forma_pagamento text,
  observacao text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.of_orcamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id uuid REFERENCES public.of_projetos(id) ON DELETE CASCADE,
  plano_conta_id uuid REFERENCES public.of_plano_contas(id),
  descricao text,
  valor_orcado numeric DEFAULT 0,
  competencia text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.of_regras_rateio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  tipo_rateio text NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.of_rateios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  regra_id uuid REFERENCES public.of_regras_rateio(id),
  lancamento_id uuid REFERENCES public.of_lancamentos(id),
  projeto_id uuid REFERENCES public.of_projetos(id),
  valor_original numeric,
  percentual numeric,
  valor_rateado numeric,
  competencia text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.of_metas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id uuid REFERENCES public.of_projetos(id),
  tipo text,
  descricao text,
  valor_meta numeric,
  valor_realizado numeric DEFAULT 0,
  periodo text,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.of_projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.of_plano_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.of_lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.of_parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.of_orcamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.of_regras_rateio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.of_rateios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.of_metas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "of_all" ON public.of_projetos;
CREATE POLICY "of_all" ON public.of_projetos FOR ALL USING (true);
DROP POLICY IF EXISTS "of_plano_all" ON public.of_plano_contas;
CREATE POLICY "of_plano_all" ON public.of_plano_contas FOR ALL USING (true);
DROP POLICY IF EXISTS "of_lanc_all" ON public.of_lancamentos;
CREATE POLICY "of_lanc_all" ON public.of_lancamentos FOR ALL USING (true);
DROP POLICY IF EXISTS "of_parc_all" ON public.of_parcelas;
CREATE POLICY "of_parc_all" ON public.of_parcelas FOR ALL USING (true);
DROP POLICY IF EXISTS "of_orc_all" ON public.of_orcamento;
CREATE POLICY "of_orc_all" ON public.of_orcamento FOR ALL USING (true);
DROP POLICY IF EXISTS "of_regras_all" ON public.of_regras_rateio;
CREATE POLICY "of_regras_all" ON public.of_regras_rateio FOR ALL USING (true);
DROP POLICY IF EXISTS "of_rat_all" ON public.of_rateios;
CREATE POLICY "of_rat_all" ON public.of_rateios FOR ALL USING (true);
DROP POLICY IF EXISTS "of_metas_all" ON public.of_metas;
CREATE POLICY "of_metas_all" ON public.of_metas FOR ALL USING (true);

-- Plano de Contas padrão OF
INSERT INTO public.of_plano_contas (codigo, nome, tipo, categoria, rateavel, ordem) VALUES
('1.1','Pacote fotográfico','receita','Receita de Serviço',false,1),
('1.2','Álbum e impressão','receita','Receita de Produto',false,2),
('1.3','Taxa de inscrição','receita','Receita de Serviço',false,3),
('1.4','Sessão extra','receita','Receita de Serviço',false,4),
('1.5','Outras receitas','receita','Outros',false,5),
('2.1','Pró-labore sócio','despesa_fixa','Pessoal',true,10),
('2.2','Salários CLT','despesa_fixa','Pessoal',true,11),
('2.3','Encargos e FGTS','despesa_fixa','Pessoal',true,12),
('2.4','Aluguel estúdio','despesa_fixa','Infraestrutura',true,13),
('2.5','Energia elétrica','despesa_fixa','Infraestrutura',true,14),
('2.6','Internet e telefone','despesa_fixa','Infraestrutura',true,15),
('2.7','Sistemas e softwares','despesa_fixa','Tecnologia',true,16),
('2.8','Contabilidade','despesa_fixa','Administrativo',true,17),
('2.9','Marketing institucional','despesa_fixa','Marketing',true,18),
('2.10','Seguros','despesa_fixa','Administrativo',true,19),
('3.1','Fotógrafo avulso','despesa_direta','Produção',false,20),
('3.2','Impressão e álbum','despesa_direta','Produção',false,21),
('3.3','Cenografia e props','despesa_direta','Produção',false,22),
('3.4','Transporte','despesa_direta','Produção',false,23),
('3.5','Marketing do projeto','despesa_direta','Marketing',false,24),
('3.6','Comissão de vendas','despesa_direta','Comercial',false,25),
('3.7','Impostos sobre receita','despesa_direta','Fiscal',false,26),
('3.8','Outras diretas','despesa_direta','Outros',false,27)
ON CONFLICT (codigo) DO NOTHING;

-- Regras de Rateio padrão
INSERT INTO public.of_regras_rateio (nome, descricao, tipo_rateio, ativo) VALUES
('Igualitário','Divide igualmente entre projetos ativos','igualitario',true),
('Por Receita','Proporcional à receita de cada projeto','proporcional_receita',true),
('Por Clientes','Proporcional ao nº de clientes confirmados','proporcional_clientes',true),
('Manual','Percentual definido manualmente por projeto','manual',true)
ON CONFLICT DO NOTHING;
