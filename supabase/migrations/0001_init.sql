-- LeadForge — schema inicial
-- Convenção: toda tabela com dado "coletável" carrega source + confidence
-- quando aplicável (princípio "não inventar dados", seção 6 da spec).

create extension if not exists "pgcrypto";

-- =========================================================================
-- companies
-- =========================================================================
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  category text,
  categories text[],
  description text,
  place_id text unique,
  address text,
  city text,
  state text,
  country text,
  postal_code text,
  latitude double precision,
  longitude double precision,
  phone text,
  international_phone text,
  website text,
  google_maps_url text,
  rating numeric(2,1),
  review_count integer,
  business_status text,
  price_level text,
  pipeline_status text not null default 'DISCOVERED'
    check (pipeline_status in (
      'DISCOVERED','IMPORTED','ENRICHING','ANALYZING','ANALYZED','PROMPT_READY','ERROR'
    )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index companies_place_id_idx on companies (place_id);
create index companies_city_state_idx on companies (city, state);

-- =========================================================================
-- opening_hours
-- =========================================================================
create table opening_hours (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  day smallint not null check (day between 0 and 6),
  open_time time,
  close_time time,
  is_closed boolean not null default false,
  source text,
  confidence numeric(3,2),
  created_at timestamptz not null default now()
);
create index opening_hours_company_idx on opening_hours (company_id);

-- =========================================================================
-- social_profiles
-- =========================================================================
create table social_profiles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  platform text not null,
  url text not null,
  username text,
  source text,
  confidence numeric(3,2),
  created_at timestamptz not null default now(),
  unique (company_id, platform, url)
);
create index social_profiles_company_idx on social_profiles (company_id);

-- =========================================================================
-- websites
-- =========================================================================
create table websites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  url text not null,
  exists boolean,
  status_code integer,
  title text,
  description text,
  technology text,
  mobile_score numeric(5,2),
  performance_score numeric(5,2),
  analyzed_at timestamptz
);
create index websites_company_idx on websites (company_id);

-- =========================================================================
-- brand_analysis
-- =========================================================================
create table brand_analysis (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  logo_url text,
  primary_color text,
  secondary_color text,
  accent_color text,
  background_color text,
  typography text,
  visual_style text,
  characteristics text[],
  confidence numeric(3,2),
  source text,
  created_at timestamptz not null default now()
);
create index brand_analysis_company_idx on brand_analysis (company_id);

-- =========================================================================
-- business_analysis
-- =========================================================================
create table business_analysis (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  business_type text,
  target_audience text[],
  main_goal text,
  secondary_goals text[],
  strengths text[],
  weaknesses text[],
  opportunities text[],
  recommendations text[],
  created_at timestamptz not null default now()
);
create index business_analysis_company_idx on business_analysis (company_id);

-- =========================================================================
-- lead_scores
-- =========================================================================
create table lead_scores (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  temperature text not null check (temperature in ('VERY_HOT','HOT','WARM','COLD')),
  reasons jsonb not null default '[]',
  calculated_at timestamptz not null default now()
);
create index lead_scores_company_idx on lead_scores (company_id);

-- =========================================================================
-- website_strategies
-- =========================================================================
create table website_strategies (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  objective text,
  recommended_structure jsonb,
  recommended_features jsonb,
  primary_cta text,
  secondary_ctas text[],
  ux_strategy text[],
  seo_strategy text[],
  content_strategy text[],
  visual_strategy text[],
  created_at timestamptz not null default now()
);
create index website_strategies_company_idx on website_strategies (company_id);

-- =========================================================================
-- prompts
-- =========================================================================
create table prompts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  type text not null default 'website_prompt',
  content text not null,
  version integer not null,
  model text,
  generated_at timestamptz not null default now(),
  edited_at timestamptz,
  unique (company_id, type, version)
);
create index prompts_company_idx on prompts (company_id);

-- =========================================================================
-- lead_status
-- =========================================================================
create table lead_status (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  status text not null default 'NEW'
    check (status in (
      'NEW','QUALIFIED','CONTACTED','RESPONDED','MEETING',
      'PROPOSAL','NEGOTIATION','WON','LOST'
    )),
  notes text,
  next_action text,
  proposal_value numeric(12,2),
  last_contacted_at timestamptz,
  updated_at timestamptz not null default now()
);
create index lead_status_company_idx on lead_status (company_id);

-- =========================================================================
-- events (histórico — seção 34)
-- =========================================================================
create table company_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  type text not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);
create index company_events_company_idx on company_events (company_id);

-- =========================================================================
-- updated_at trigger genérico
-- =========================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger companies_set_updated_at
  before update on companies
  for each row execute function set_updated_at();

create trigger lead_status_set_updated_at
  before update on lead_status
  for each row execute function set_updated_at();

-- =========================================================================
-- Row Level Security
-- Todas as escritas de pipeline (Places, análise, LLM) passam pelo backend
-- com a service role key, que ignora RLS. RLS aqui protege leitura/escrita
-- feitas diretamente pelo frontend autenticado via Supabase Auth.
-- =========================================================================
alter table companies enable row level security;
alter table opening_hours enable row level security;
alter table social_profiles enable row level security;
alter table websites enable row level security;
alter table brand_analysis enable row level security;
alter table business_analysis enable row level security;
alter table lead_scores enable row level security;
alter table website_strategies enable row level security;
alter table prompts enable row level security;
alter table lead_status enable row level security;
alter table company_events enable row level security;

-- Política inicial simples: qualquer usuário autenticado pode ler/escrever.
-- Refinar por dono/workspace quando o modelo multi-usuário for definido.
create policy "authenticated read companies" on companies
  for select using (auth.role() = 'authenticated');
create policy "authenticated write companies" on companies
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated read opening_hours" on opening_hours
  for select using (auth.role() = 'authenticated');
create policy "authenticated read social_profiles" on social_profiles
  for select using (auth.role() = 'authenticated');
create policy "authenticated read websites" on websites
  for select using (auth.role() = 'authenticated');
create policy "authenticated read brand_analysis" on brand_analysis
  for select using (auth.role() = 'authenticated');
create policy "authenticated read business_analysis" on business_analysis
  for select using (auth.role() = 'authenticated');
create policy "authenticated read lead_scores" on lead_scores
  for select using (auth.role() = 'authenticated');
create policy "authenticated read website_strategies" on website_strategies
  for select using (auth.role() = 'authenticated');
create policy "authenticated read prompts" on prompts
  for select using (auth.role() = 'authenticated');
create policy "authenticated all lead_status" on lead_status
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read company_events" on company_events
  for select using (auth.role() = 'authenticated');

-- Fix de segurança: search_path explícito na função de trigger
-- (aplicado via Supabase:apply_migration como migration separada em produção,
-- consolidado aqui para manter o schema local em sincronia)
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql
set search_path = public;
