-- Therapy Progress Notes: Oasis-style group + individual workflow. Safe to re-run.
alter table public.therapy_progress_notes add column if not exists facility_id uuid references public.facilities(id) on delete set null;
alter table public.therapy_progress_notes add column if not exists resident_ids uuid[] not null default '{}';
alter table public.therapy_progress_notes add column if not exists resident_assessments jsonb not null default '{}'::jsonb;
create index if not exists therapy_progress_notes_facility_idx on public.therapy_progress_notes(facility_id);
