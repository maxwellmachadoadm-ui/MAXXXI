-- ORION — Schema Supabase
-- Execute no SQL Editor do Supabase Dashboard

-- ══════════════════════════════════════════════════════════════
-- PROFILES (extends auth.users)
-- ══════════════════════════════════════════════════════════════
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null unique,
  phone text,
  cpf text,
  avatar_url text,
  role text not null default 'viewer' check (role in ('admin','editor','viewer')),
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    case when (select count(*) from public.profiles) = 0 then 'admin' else 'viewer' end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ══════════════════════════════════════════════════════════════
-- INVITES
-- ══════════════════════════════════════════════════════════════
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text default 'viewer' check (role in ('admin','editor','viewer')),
  invited_by uuid references public.profiles(id),
  accepted boolean default false,
  token text unique default encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- EMPRESAS
-- ══════════════════════════════════════════════════════════════
create table public.empresas (
  id text primary key,
  nome text not null,
  sigla text not null,
  descricao text,
  cor text default '#3b82f6',
  rgb text default '59,130,246',
  score integer default 0,
  status text default 'Ativo',
  status_cor text default '#10b981',
  faturamento numeric default 0,
  meta numeric default 0,
  resultado numeric default 0,
  crescimento numeric default 0,
  drive_url text,
  created_at timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- KPIs
-- ══════════════════════════════════════════════════════════════
create table public.kpis (
  id uuid primary key default gen_random_uuid(),
  empresa_id text references public.empresas(id) on delete cascade,
  icone text,
  label text not null,
  valor text not null,
  ordem integer default 0
);

-- ══════════════════════════════════════════════════════════════
-- OKRs
-- ══════════════════════════════════════════════════════════════
create table public.okrs (
  id uuid primary key default gen_random_uuid(),
  empresa_id text references public.empresas(id) on delete cascade,
  objetivo text not null,
  progresso integer default 0
);

-- ══════════════════════════════════════════════════════════════
-- TAREFAS
-- ══════════════════════════════════════════════════════════════
create table public.tarefas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  empresa_id text references public.empresas(id) on delete cascade,
  prioridade text default 'media' check (prioridade in ('alta','media','baixa')),
  status text default 'todo' check (status in ('todo','doing','done')),
  prazo date,
  assigned_to uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- CONTRATOS
-- ══════════════════════════════════════════════════════════════
create table public.contratos (
  id uuid primary key default gen_random_uuid(),
  empresa_id text references public.empresas(id) on delete cascade,
  nome text not null,
  valor text,
  status text default 'ativo' check (status in ('ativo','inadim','negoc')),
  vencimento text
);

-- ══════════════════════════════════════════════════════════════
-- RISCOS
-- ══════════════════════════════════════════════════════════════
create table public.riscos (
  id uuid primary key default gen_random_uuid(),
  empresa_id text references public.empresas(id) on delete cascade,
  descricao text not null,
  nivel text default 'medio' check (nivel in ('alto','medio','baixo'))
);

-- ══════════════════════════════════════════════════════════════
-- DECISOES
-- ══════════════════════════════════════════════════════════════
create table public.decisoes (
  id uuid primary key default gen_random_uuid(),
  empresa_id text references public.empresas(id) on delete cascade,
  descricao text not null,
  data text
);

-- ══════════════════════════════════════════════════════════════
-- CRM LEADS
-- ══════════════════════════════════════════════════════════════
create table public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  empresa_id text references public.empresas(id) on delete cascade,
  fase text not null check (fase in ('Lead','Proposta','Negociacao','Fechado')),
  nome text not null,
  valor text,
  created_at timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- CHECK-INS DIARIOS
-- ══════════════════════════════════════════════════════════════
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  data date not null default current_date,
  prioridade text,
  decisao text,
  resultado text,
  unique(user_id, data)
);

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════
alter table public.profiles enable row level security;
alter table public.invites enable row level security;
alter table public.empresas enable row level security;
alter table public.kpis enable row level security;
alter table public.okrs enable row level security;
alter table public.tarefas enable row level security;
alter table public.contratos enable row level security;
alter table public.riscos enable row level security;
alter table public.decisoes enable row level security;
alter table public.crm_leads enable row level security;
alter table public.checkins enable row level security;

-- Profiles: users can read all, update own
create policy "profiles_read" on public.profiles for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id);

-- Invites: admins can manage, all can read own
create policy "invites_read" on public.invites for select to authenticated using (true);
create policy "invites_admin_insert" on public.invites for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "invites_admin_delete" on public.invites for delete to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- All business tables: authenticated can read, admin/editor can write
create policy "empresas_read" on public.empresas for select to authenticated using (true);
create policy "empresas_write" on public.empresas for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','editor')));

create policy "kpis_read" on public.kpis for select to authenticated using (true);
create policy "kpis_write" on public.kpis for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','editor')));

create policy "okrs_read" on public.okrs for select to authenticated using (true);
create policy "okrs_write" on public.okrs for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','editor')));

create policy "tarefas_read" on public.tarefas for select to authenticated using (true);
create policy "tarefas_write" on public.tarefas for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','editor')));

create policy "contratos_read" on public.contratos for select to authenticated using (true);
create policy "contratos_write" on public.contratos for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','editor')));

create policy "riscos_read" on public.riscos for select to authenticated using (true);
create policy "riscos_write" on public.riscos for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','editor')));

create policy "decisoes_read" on public.decisoes for select to authenticated using (true);
create policy "decisoes_write" on public.decisoes for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','editor')));

create policy "crm_read" on public.crm_leads for select to authenticated using (true);
create policy "crm_write" on public.crm_leads for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','editor')));

create policy "checkins_read" on public.checkins for select to authenticated using (true);
create policy "checkins_own" on public.checkins for insert to authenticated with check (auth.uid() = user_id);
create policy "checkins_update_own" on public.checkins for update to authenticated using (auth.uid() = user_id);
