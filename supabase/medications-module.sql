alter table public.medications add column if not exists prescriber text;
alter table public.medications add column if not exists instructions text;
alter table public.medications add column if not exists created_by uuid references public.profiles(id) on delete set null;
alter table public.medications add column if not exists created_at timestamptz default now();
create table if not exists public.medication_records(id uuid primary key default gen_random_uuid(),resident_id uuid not null references public.residents(id) on delete cascade,module text not null,title text not null,status text not null default 'draft',data jsonb not null default '{}'::jsonb,created_by uuid references public.profiles(id) on delete set null,created_at timestamptz default now(),updated_at timestamptz default now());
create index if not exists medication_records_resident_module_idx on public.medication_records(resident_id,module,created_at desc);
