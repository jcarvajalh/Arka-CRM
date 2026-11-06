-- ============================================================
-- Arka CRM — Supabase setup
-- Ejecutar en el SQL Editor de Supabase (proyecto nuevo o existente)
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Tabla: clients
-- ------------------------------------------------------------
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,

  -- Vista
  has_website boolean not null default false,

  -- Columnas de la tabla
  client_name text not null,
  contact_name text,
  contact_channel text check (contact_channel in ('WhatsApp', 'Instagram', 'Correo')),
  contact_detail text,
  status text not null default 'Prospecto' check (status in (
    'Prospecto', 'Contactado', 'Respondió', 'Reunión',
    'Propuesta enviada', 'Negociación', 'Ganado', 'Finalizado', 'Perdido'
  )),
  date date default current_date,
  niche text,
  website_url text,
  social_media text,

  -- Flags
  is_high_potential boolean default false,

  -- Backlog (array de objetos JSON: {id, label, checked})
  backlog jsonb default '[]'::jsonb,

  -- Archivos (URLs de Supabase Storage)
  audit_doc_url text,
  proposal_doc_url text,

  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table clients enable row level security;

drop policy if exists "Users see own clients" on clients;
create policy "Users see own clients"
  on clients for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists clients_user_id_idx on clients (user_id);
create index if not exists clients_has_website_idx on clients (user_id, has_website);
create index if not exists clients_status_idx on clients (user_id, status);

-- ------------------------------------------------------------
-- Tabla: project_tasks (clientes ganados — tablero tipo Trello)
-- ------------------------------------------------------------
create table if not exists project_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade not null,

  title text not null,
  description text,
  status text not null default 'sin_empezar' check (status in (
    'sin_empezar', 'en_desarrollo', 'terminadas', 'revisadas', 'aprobadas'
  )),
  order_index integer default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table project_tasks enable row level security;

drop policy if exists "Users see own tasks" on project_tasks;
create policy "Users see own tasks"
  on project_tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists project_tasks_client_id_idx on project_tasks (client_id);
create index if not exists project_tasks_user_id_idx on project_tasks (user_id);

-- ------------------------------------------------------------
-- updated_at automático
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists clients_set_updated_at on clients;
create trigger clients_set_updated_at
  before update on clients
  for each row execute function set_updated_at();

drop trigger if exists project_tasks_set_updated_at on project_tasks;
create trigger project_tasks_set_updated_at
  before update on project_tasks
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- Realtime
-- ------------------------------------------------------------
alter publication supabase_realtime add table clients;
alter publication supabase_realtime add table project_tasks;

-- ------------------------------------------------------------
-- Storage: bucket client-docs (auditorías y propuestas en PDF)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('client-docs', 'client-docs', false)
on conflict (id) do nothing;

drop policy if exists "User owns their docs" on storage.objects;
create policy "User owns their docs"
  on storage.objects for all
  using (bucket_id = 'client-docs' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'client-docs' and auth.uid()::text = (storage.foldername(name))[1]);
