-- ═══════════════════════════════════════════════════════════
-- ORION Gestão Executiva — v15 SQL Consolidado
-- Execute este arquivo COMPLETO no Supabase SQL Editor
-- Todas as tabelas, políticas RLS, buckets e seeds
-- ═══════════════════════════════════════════════════════════


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. TABELAS DE NEGÓCIO (persistência)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.lancamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  tipo text NOT NULL,
  descricao text,
  valor numeric,
  categoria text,
  subcategoria text,
  banco text,
  origem text,
  mes text,
  data date,
  status text DEFAULT 'rascunho',
  anexo_nome text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  titulo text NOT NULL,
  descricao text,
  status text DEFAULT 'todo',
  prioridade text DEFAULT 'media',
  responsavel text,
  prazo date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  nome text NOT NULL,
  email text,
  telefone text,
  valor text,
  fase text DEFAULT 'Lead',
  responsavel text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compromissos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  nome text NOT NULL,
  descricao text,
  valor numeric,
  vencimento date,
  frequencia text DEFAULT 'mensal',
  tipo text DEFAULT 'recorrente',
  categoria text,
  banco text,
  status text DEFAULT 'a_vencer',
  pago_em date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text DEFAULT 'colaborador',
  companies_access text[],
  custom_permissions text[],
  status text DEFAULT 'pendente',
  invited_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compromissos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lancamentos_auth" ON public.lancamentos;
CREATE POLICY "lancamentos_auth" ON public.lancamentos FOR ALL USING (true);
DROP POLICY IF EXISTS "tarefas_auth" ON public.tarefas;
CREATE POLICY "tarefas_auth" ON public.tarefas FOR ALL USING (true);
DROP POLICY IF EXISTS "leads_auth" ON public.leads;
CREATE POLICY "leads_auth" ON public.leads FOR ALL USING (true);
DROP POLICY IF EXISTS "compromissos_auth" ON public.compromissos;
CREATE POLICY "compromissos_auth" ON public.compromissos FOR ALL USING (true);
DROP POLICY IF EXISTS "invites_auth" ON public.invites;
CREATE POLICY "invites_auth" ON public.invites FOR ALL USING (true);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. EXTRATOS COM IA (Gestão Pessoal)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.extratos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  nome_arquivo text,
  banco text,
  periodo text,
  status text DEFAULT 'processando',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  extrato_id uuid REFERENCES public.extratos(id) ON DELETE CASCADE,
  data date,
  descricao text,
  valor numeric,
  tipo text,
  categoria text,
  subcategoria text,
  status_validacao text DEFAULT 'pendente',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.regras_classificacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  descricao_pattern text,
  categoria text,
  subcategoria text,
  confirmacoes integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, descricao_pattern)
);

ALTER TABLE public.extratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regras_classificacao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "extratos_user" ON public.extratos;
CREATE POLICY "extratos_user" ON public.extratos FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "transacoes_user" ON public.transacoes;
CREATE POLICY "transacoes_user" ON public.transacoes FOR ALL USING (
  extrato_id IN (SELECT id FROM public.extratos WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "regras_user" ON public.regras_classificacao;
CREATE POLICY "regras_user" ON public.regras_classificacao FOR ALL USING (auth.uid() = user_id);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. ORIGINAL FOTOGRAFIA — ERP
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. MÓDULOS CONFIGURÁVEIS POR EMPRESA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.empresa_modulos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id text NOT NULL,
  modulo text NOT NULL,
  ativo boolean DEFAULT true,
  UNIQUE(empresa_id, modulo)
);

ALTER TABLE public.empresa_modulos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "empresa_modulos_select" ON public.empresa_modulos;
CREATE POLICY "empresa_modulos_select" ON public.empresa_modulos FOR SELECT USING (true);
DROP POLICY IF EXISTS "empresa_modulos_admin" ON public.empresa_modulos;
CREATE POLICY "empresa_modulos_admin" ON public.empresa_modulos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. LOG DE AUTOMAÇÕES LINKSYNC
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.automacoes_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id text NOT NULL,
  tipo text NOT NULL,
  descricao text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.automacoes_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "automacoes_log_select" ON public.automacoes_log;
CREATE POLICY "automacoes_log_select" ON public.automacoes_log FOR SELECT USING (true);
DROP POLICY IF EXISTS "automacoes_log_insert" ON public.automacoes_log;
CREATE POLICY "automacoes_log_insert" ON public.automacoes_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. STORAGE BUCKETS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('logos', 'logos', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('biblioteca', 'biblioteca', false, 20971520, ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. POLÍTICAS RLS DE STORAGE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Avatars
DROP POLICY IF EXISTS "Avatars — leitura pública" ON storage.objects;
CREATE POLICY "Avatars — leitura pública" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatars — upload pelo próprio usuário" ON storage.objects;
CREATE POLICY "Avatars — upload pelo próprio usuário" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Avatars — atualização pelo próprio usuário" ON storage.objects;
CREATE POLICY "Avatars — atualização pelo próprio usuário" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Logos
DROP POLICY IF EXISTS "Logos — leitura pública" ON storage.objects;
CREATE POLICY "Logos — leitura pública" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

DROP POLICY IF EXISTS "Logos — upload autenticado" ON storage.objects;
CREATE POLICY "Logos — upload autenticado" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Logos — atualização autenticada" ON storage.objects;
CREATE POLICY "Logos — atualização autenticada" ON storage.objects
  FOR UPDATE USING (bucket_id = 'logos' AND auth.role() = 'authenticated');

-- Biblioteca
DROP POLICY IF EXISTS "Biblioteca — leitura autenticada" ON storage.objects;
CREATE POLICY "Biblioteca — leitura autenticada" ON storage.objects
  FOR SELECT USING (bucket_id = 'biblioteca' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Biblioteca — upload autenticado" ON storage.objects;
CREATE POLICY "Biblioteca — upload autenticado" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'biblioteca' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Biblioteca — exclusão autenticada" ON storage.objects;
CREATE POLICY "Biblioteca — exclusão autenticada" ON storage.objects
  FOR DELETE USING (bucket_id = 'biblioteca' AND auth.role() = 'authenticated');


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 8. FIX RLS AVATAR (profiles)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP POLICY IF EXISTS "users_update_own_avatar" ON public.profiles;
CREATE POLICY "users_update_own_avatar" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "storage_avatar_insert" ON storage.objects;
CREATE POLICY "storage_avatar_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "storage_avatar_select" ON storage.objects;
CREATE POLICY "storage_avatar_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "storage_avatar_update" ON storage.objects;
CREATE POLICY "storage_avatar_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ═══════════════════════════════════════════════════════════
-- FIM — ORION v15 Consolidado
-- 21 tabelas, 3 buckets, todas as políticas RLS
-- ═══════════════════════════════════════════════════════════
