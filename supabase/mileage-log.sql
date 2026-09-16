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
