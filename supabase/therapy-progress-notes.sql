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
