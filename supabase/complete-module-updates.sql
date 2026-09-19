alter table public.medications add column if not exists prescriber text;
alter table public.medications add column if not exists instructions text;
alter table public.medications add column if not exists created_by uuid references public.profiles(id) on delete set null;
alter table public.medications add column if not exists created_at timestamptz default now();
create table if not exists public.medication_records(id uuid primary key default gen_random_uuid(),resident_id uuid not null references public.residents(id) on delete cascade,module text not null,title text not null,status text not null default 'draft',data jsonb not null default '{}'::jsonb,created_by uuid references public.profiles(id) on delete set null,created_at timestamptz default now(),updated_at timestamptz default now());
create index if not exists medication_records_resident_module_idx on public.medication_records(resident_id,module,created_at desc);
-- Run this in Supabase SQL Editor.

create table if not exists public.therapy_progress_notes (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid not null references public.residents(id) on delete cascade,

  group_therapy boolean not null default false,
  individual_therapy boolean not null default false,
  in_person boolean not null default false,
  telehealth boolean not null default false,

  note_date date,
  start_time time,
  end_time time,
  total_duration text,

  employee_contractor text,
  facility_address text,
  topic text,

  note_summary text,
  recommendation text,

  bht_name text,
  bhp_name text,
  bht_signature text,
  bhp_signature text,

  signer_ids uuid[] not null default '{}',

  status text not null default 'draft'
    check (status in ('draft','submitted')),

  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists therapy_progress_notes_resident_idx
  on public.therapy_progress_notes(resident_id);

create index if not exists therapy_progress_notes_date_idx
  on public.therapy_progress_notes(note_date desc);

alter table public.therapy_progress_notes enable row level security;

drop policy if exists "therapy notes authenticated read" on public.therapy_progress_notes;
drop policy if exists "therapy notes authenticated insert" on public.therapy_progress_notes;
drop policy if exists "therapy notes authenticated update" on public.therapy_progress_notes;
drop policy if exists "therapy notes authenticated delete" on public.therapy_progress_notes;

create policy "therapy notes authenticated read"
on public.therapy_progress_notes for select
to authenticated
using (true);

create policy "therapy notes authenticated insert"
on public.therapy_progress_notes for insert
to authenticated
with check (true);

create policy "therapy notes authenticated update"
on public.therapy_progress_notes for update
to authenticated
using (true)
with check (true);

create policy "therapy notes authenticated delete"
on public.therapy_progress_notes for delete
to authenticated
using (true);
-- Run this in Supabase SQL Editor.
create table if not exists public.mileage_logs (
  id uuid primary key default gen_random_uuid(),
  log_date date,
  resident_initials text,
  beginning_mileage numeric,
  ending_mileage numeric,
  total_mileage numeric,
  destination text,
  issues text,
  driver_signature text,
  witness_name text,
  resident_signature text,
  witness_signature text,
  signer_ids uuid[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','submitted')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists mileage_logs_date_idx on public.mileage_logs(log_date desc);
alter table public.mileage_logs enable row level security;
drop policy if exists "mileage logs read" on public.mileage_logs;
drop policy if exists "mileage logs insert" on public.mileage_logs;
drop policy if exists "mileage logs update" on public.mileage_logs;
drop policy if exists "mileage logs delete" on public.mileage_logs;
create policy "mileage logs read" on public.mileage_logs for select to authenticated using (true);
create policy "mileage logs insert" on public.mileage_logs for insert to authenticated with check (true);
create policy "mileage logs update" on public.mileage_logs for update to authenticated using (true) with check (true);
create policy "mileage logs delete" on public.mileage_logs for delete to authenticated using (true);


-- EMPLOYEE MODULE: also run supabase/employee-module.sql
