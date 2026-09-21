-- SBH EHR feedback fixes v4
-- Safe to run more than once.

alter table public.medications add column if not exists schedule_times jsonb not null default '[]'::jsonb;
alter table public.medications add column if not exists refill_count integer;
alter table public.medications add column if not exists expiration_date date;
alter table public.medications add column if not exists other_instructions text;

-- Optional index to speed up resident medication lookups used by MAR.
create index if not exists medications_resident_active_idx on public.medications(resident_id, active);
