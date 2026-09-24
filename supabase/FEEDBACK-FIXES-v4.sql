-- SBH EHR feedback fixes v4
-- Safe to run more than once.

alter table public.medications add column if not exists schedule_times jsonb not null default '[]'::jsonb;
alter table public.medications add column if not exists refill_count integer;
alter table public.medications add column if not exists expiration_date date;
alter table public.medications add column if not exists other_instructions text;

-- Optional index to speed up resident medication lookups used by MAR.
create index if not exists medications_resident_active_idx on public.medications(resident_id, active);

-- Therapy Progress Notes group/individual upgrade
alter table public.therapy_progress_notes add column if not exists facility_id uuid references public.facilities(id) on delete set null;
alter table public.therapy_progress_notes add column if not exists resident_ids uuid[] not null default '{}';
alter table public.therapy_progress_notes add column if not exists resident_assessments jsonb not null default '{}'::jsonb;
create index if not exists therapy_progress_notes_facility_idx on public.therapy_progress_notes(facility_id);
