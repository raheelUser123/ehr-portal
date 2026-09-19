-- SBH EHR Portal Final Production Migration v3.0
-- Safe to run more than once. Run after the existing base schema/module SQL files.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Role capabilities
-- ---------------------------------------------------------------------------
create table if not exists public.role_permissions (
  id bigint generated always as identity primary key,
  role text not null,
  capability text not null,
  allowed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(role, capability)
);
create index if not exists role_permissions_role_idx on public.role_permissions(role);

alter table public.role_permissions enable row level security;
drop policy if exists "role permissions read" on public.role_permissions;
create policy "role permissions read" on public.role_permissions for select to authenticated using (true);

-- Idempotent default capability seeds. Super Admin is handled as an application-level
-- full-access bypass, but rows are inserted as documentation/defaults as well.
insert into public.role_permissions(role,capability,allowed) values
('SUPER_ADMIN','dashboard.view',true),('SUPER_ADMIN','residents.view',true),('SUPER_ADMIN','residents.create',true),('SUPER_ADMIN','residents.edit',true),('SUPER_ADMIN','residents.delete',true),('SUPER_ADMIN','appointments.view',true),('SUPER_ADMIN','appointments.manage',true),('SUPER_ADMIN','forms.view',true),('SUPER_ADMIN','forms.create',true),('SUPER_ADMIN','forms.edit',true),('SUPER_ADMIN','forms.delete',true),('SUPER_ADMIN','forms.sign',true),('SUPER_ADMIN','vitals.view',true),('SUPER_ADMIN','vitals.manage',true),('SUPER_ADMIN','tracking.view',true),('SUPER_ADMIN','tracking.manage',true),('SUPER_ADMIN','medications.view',true),('SUPER_ADMIN','medications.manage',true),('SUPER_ADMIN','medications.administer',true),('SUPER_ADMIN','therapy.view',true),('SUPER_ADMIN','therapy.manage',true),('SUPER_ADMIN','mileage.view',true),('SUPER_ADMIN','mileage.manage',true),('SUPER_ADMIN','employee.view',true),('SUPER_ADMIN','employee.manage',true),('SUPER_ADMIN','notifications.view',true),('SUPER_ADMIN','form_builder.manage',true),('SUPER_ADMIN','settings.view',true),('SUPER_ADMIN','settings.manage',true),('SUPER_ADMIN','admin.dashboard',true),('SUPER_ADMIN','admin.users',true),('SUPER_ADMIN','admin.organizations',true),('SUPER_ADMIN','admin.facilities',true),('SUPER_ADMIN','admin.roles',true),('SUPER_ADMIN','admin.audit',true),
('ADMIN','dashboard.view',true),('ADMIN','residents.view',true),('ADMIN','residents.create',true),('ADMIN','residents.edit',true),('ADMIN','residents.delete',true),('ADMIN','appointments.view',true),('ADMIN','appointments.manage',true),('ADMIN','forms.view',true),('ADMIN','forms.create',true),('ADMIN','forms.edit',true),('ADMIN','forms.delete',true),('ADMIN','forms.sign',true),('ADMIN','vitals.view',true),('ADMIN','vitals.manage',true),('ADMIN','tracking.view',true),('ADMIN','tracking.manage',true),('ADMIN','medications.view',true),('ADMIN','medications.manage',true),('ADMIN','medications.administer',true),('ADMIN','therapy.view',true),('ADMIN','therapy.manage',true),('ADMIN','mileage.view',true),('ADMIN','mileage.manage',true),('ADMIN','employee.view',true),('ADMIN','employee.manage',true),('ADMIN','notifications.view',true),('ADMIN','form_builder.manage',true),('ADMIN','settings.view',true),('ADMIN','settings.manage',true),('ADMIN','admin.dashboard',true),('ADMIN','admin.users',true),('ADMIN','admin.organizations',true),('ADMIN','admin.facilities',true),('ADMIN','admin.audit',true),
('BHP','dashboard.view',true),('BHP','residents.view',true),('BHP','appointments.view',true),('BHP','forms.view',true),('BHP','forms.create',true),('BHP','forms.edit',true),('BHP','forms.sign',true),('BHP','vitals.view',true),('BHP','tracking.view',true),('BHP','therapy.view',true),('BHP','therapy.manage',true),('BHP','medications.view',true),('BHP','mileage.view',true),('BHP','employee.view',true),('BHP','notifications.view',true),
('BHT','dashboard.view',true),('BHT','residents.view',true),('BHT','appointments.view',true),('BHT','forms.view',true),('BHT','forms.create',true),('BHT','forms.edit',true),('BHT','vitals.view',true),('BHT','vitals.manage',true),('BHT','tracking.view',true),('BHT','tracking.manage',true),('BHT','therapy.view',true),('BHT','mileage.view',true),('BHT','mileage.manage',true),('BHT','medications.view',true),('BHT','notifications.view',true),
('NURSE','dashboard.view',true),('NURSE','residents.view',true),('NURSE','appointments.view',true),('NURSE','forms.view',true),('NURSE','forms.create',true),('NURSE','forms.edit',true),('NURSE','forms.sign',true),('NURSE','vitals.view',true),('NURSE','vitals.manage',true),('NURSE','tracking.view',true),('NURSE','tracking.manage',true),('NURSE','medications.view',true),('NURSE','medications.manage',true),('NURSE','medications.administer',true),('NURSE','notifications.view',true),
('THERAPIST','dashboard.view',true),('THERAPIST','residents.view',true),('THERAPIST','appointments.view',true),('THERAPIST','forms.view',true),('THERAPIST','forms.create',true),('THERAPIST','forms.edit',true),('THERAPIST','forms.sign',true),('THERAPIST','therapy.view',true),('THERAPIST','therapy.manage',true),('THERAPIST','tracking.view',true),('THERAPIST','notifications.view',true),
('CASE_MANAGER','dashboard.view',true),('CASE_MANAGER','residents.view',true),('CASE_MANAGER','appointments.view',true),('CASE_MANAGER','appointments.manage',true),('CASE_MANAGER','forms.view',true),('CASE_MANAGER','forms.create',true),('CASE_MANAGER','forms.edit',true),('CASE_MANAGER','tracking.view',true),('CASE_MANAGER','tracking.manage',true),('CASE_MANAGER','therapy.view',true),('CASE_MANAGER','medications.view',true),('CASE_MANAGER','notifications.view',true),
('PROVIDER','dashboard.view',true),('PROVIDER','residents.view',true),('PROVIDER','appointments.view',true),('PROVIDER','forms.view',true),('PROVIDER','forms.create',true),('PROVIDER','forms.edit',true),('PROVIDER','forms.sign',true),('PROVIDER','vitals.view',true),('PROVIDER','tracking.view',true),('PROVIDER','medications.view',true),('PROVIDER','medications.manage',true),('PROVIDER','medications.administer',true),('PROVIDER','therapy.view',true),('PROVIDER','notifications.view',true),
('STAFF','dashboard.view',true),('STAFF','residents.view',true),('STAFF','appointments.view',true),('STAFF','forms.view',true),('STAFF','vitals.view',true),('STAFF','tracking.view',true),('STAFF','medications.view',true),('STAFF','therapy.view',true),('STAFF','mileage.view',true),('STAFF','employee.view',true),('STAFF','notifications.view',true)
on conflict(role,capability) do nothing;

create or replace function public.has_capability(cap text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles p
    where p.id = auth.uid() and coalesce(p.active,true) = true and upper(p.role) = 'SUPER_ADMIN'
  ) or exists(
    select 1
    from public.profiles p
    join public.role_permissions rp on rp.role = upper(p.role)
    where p.id = auth.uid() and coalesce(p.active,true) = true
      and rp.capability = cap and rp.allowed = true
  );
$$;

-- ---------------------------------------------------------------------------
-- Appointments
-- ---------------------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid not null references public.residents(id) on delete cascade,
  provider_name text,
  appointment_type text not null,
  appointment_date date not null,
  start_time time not null,
  end_time time,
  location text,
  reason text,
  status text not null default 'Scheduled',
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists appointments_date_idx on public.appointments(appointment_date,start_time);
create index if not exists appointments_resident_idx on public.appointments(resident_id,appointment_date desc);

alter table public.appointments enable row level security;
drop policy if exists "appointments read" on public.appointments;
drop policy if exists "appointments insert" on public.appointments;
drop policy if exists "appointments update" on public.appointments;
drop policy if exists "appointments delete" on public.appointments;
create policy "appointments read" on public.appointments for select to authenticated using (public.has_capability('appointments.view'));
create policy "appointments insert" on public.appointments for insert to authenticated with check (public.has_capability('appointments.manage'));
create policy "appointments update" on public.appointments for update to authenticated using (public.has_capability('appointments.manage')) with check (public.has_capability('appointments.manage'));
create policy "appointments delete" on public.appointments for delete to authenticated using (public.has_capability('appointments.manage'));

-- ---------------------------------------------------------------------------
-- Capability-aware RLS for modules that use the browser Supabase client.
-- ---------------------------------------------------------------------------
alter table public.therapy_progress_notes enable row level security;
drop policy if exists "therapy notes authenticated read" on public.therapy_progress_notes;
drop policy if exists "therapy notes authenticated insert" on public.therapy_progress_notes;
drop policy if exists "therapy notes authenticated update" on public.therapy_progress_notes;
drop policy if exists "therapy notes authenticated delete" on public.therapy_progress_notes;
drop policy if exists "therapy notes read" on public.therapy_progress_notes;
drop policy if exists "therapy notes insert" on public.therapy_progress_notes;
drop policy if exists "therapy notes update" on public.therapy_progress_notes;
drop policy if exists "therapy notes delete" on public.therapy_progress_notes;
create policy "therapy notes read" on public.therapy_progress_notes for select to authenticated using (public.has_capability('therapy.view'));
create policy "therapy notes insert" on public.therapy_progress_notes for insert to authenticated with check (public.has_capability('therapy.manage'));
create policy "therapy notes update" on public.therapy_progress_notes for update to authenticated using (public.has_capability('therapy.manage')) with check (public.has_capability('therapy.manage'));
create policy "therapy notes delete" on public.therapy_progress_notes for delete to authenticated using (public.has_capability('therapy.manage'));

alter table public.mileage_logs enable row level security;
drop policy if exists "mileage logs read" on public.mileage_logs;
drop policy if exists "mileage logs insert" on public.mileage_logs;
drop policy if exists "mileage logs update" on public.mileage_logs;
drop policy if exists "mileage logs delete" on public.mileage_logs;
create policy "mileage logs read" on public.mileage_logs for select to authenticated using (public.has_capability('mileage.view'));
create policy "mileage logs insert" on public.mileage_logs for insert to authenticated with check (public.has_capability('mileage.manage'));
create policy "mileage logs update" on public.mileage_logs for update to authenticated using (public.has_capability('mileage.manage')) with check (public.has_capability('mileage.manage'));
create policy "mileage logs delete" on public.mileage_logs for delete to authenticated using (public.has_capability('mileage.manage'));

alter table public.employee_records enable row level security;
drop policy if exists "employee records read" on public.employee_records;
drop policy if exists "employee records insert" on public.employee_records;
drop policy if exists "employee records update" on public.employee_records;
drop policy if exists "employee records delete" on public.employee_records;
create policy "employee records read" on public.employee_records for select to authenticated using (employee_id=auth.uid() or public.has_capability('employee.manage'));
create policy "employee records insert" on public.employee_records for insert to authenticated with check ((employee_id=auth.uid() and public.has_capability('employee.view')) or public.has_capability('employee.manage'));
create policy "employee records update" on public.employee_records for update to authenticated using (employee_id=auth.uid() or public.has_capability('employee.manage')) with check (employee_id=auth.uid() or public.has_capability('employee.manage'));
create policy "employee records delete" on public.employee_records for delete to authenticated using (public.has_capability('employee.manage'));

-- Employee documents follow Employee/HR access.
drop policy if exists "employee documents read" on storage.objects;
drop policy if exists "employee documents upload" on storage.objects;
drop policy if exists "employee documents update" on storage.objects;
drop policy if exists "employee documents delete" on storage.objects;
create policy "employee documents read" on storage.objects for select to authenticated using(bucket_id='employee-documents' and public.has_capability('employee.view'));
create policy "employee documents upload" on storage.objects for insert to authenticated with check(bucket_id='employee-documents' and public.has_capability('employee.view'));
create policy "employee documents update" on storage.objects for update to authenticated using(bucket_id='employee-documents' and public.has_capability('employee.manage'));
create policy "employee documents delete" on storage.objects for delete to authenticated using(bucket_id='employee-documents' and public.has_capability('employee.manage'));

-- Keep role values normalized for capability matching.
update public.profiles set role = upper(role) where role is not null;

-- ============================================================
-- v3.1 Super Admin / RBAC hardening
-- ============================================================

create table if not exists public.role_permissions (
  id bigint generated always as identity primary key,
  role text not null,
  capability text not null,
  allowed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(role, capability)
);

update public.profiles
set role = upper(regexp_replace(trim(role), '[[:space:]-]+', '_', 'g'))
where role is not null;

alter table public.profiles enable row level security;
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own"
on public.profiles for select
to authenticated
using (id = auth.uid());

alter table public.role_permissions enable row level security;
drop policy if exists "role permissions read" on public.role_permissions;
create policy "role permissions read"
on public.role_permissions for select
to authenticated
using (true);

create or replace function public.has_capability(cap text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and coalesce(p.active, true) = true
      and upper(regexp_replace(trim(p.role), '[[:space:]-]+', '_', 'g')) = 'SUPER_ADMIN'
  )
  or exists(
    select 1
    from public.profiles p
    join public.role_permissions rp
      on rp.role = upper(regexp_replace(trim(p.role), '[[:space:]-]+', '_', 'g'))
    where p.id = auth.uid()
      and coalesce(p.active, true) = true
      and rp.capability = cap
      and rp.allowed = true
  );
$$;

grant execute on function public.has_capability(text) to authenticated;

insert into public.role_permissions(role, capability, allowed) values
('SUPER_ADMIN','dashboard.view',true),
('SUPER_ADMIN','residents.view',true),('SUPER_ADMIN','residents.create',true),('SUPER_ADMIN','residents.edit',true),('SUPER_ADMIN','residents.delete',true),
('SUPER_ADMIN','appointments.view',true),('SUPER_ADMIN','appointments.manage',true),
('SUPER_ADMIN','forms.view',true),('SUPER_ADMIN','forms.create',true),('SUPER_ADMIN','forms.edit',true),('SUPER_ADMIN','forms.delete',true),('SUPER_ADMIN','forms.sign',true),
('SUPER_ADMIN','vitals.view',true),('SUPER_ADMIN','vitals.manage',true),
('SUPER_ADMIN','tracking.view',true),('SUPER_ADMIN','tracking.manage',true),
('SUPER_ADMIN','medications.view',true),('SUPER_ADMIN','medications.manage',true),('SUPER_ADMIN','medications.administer',true),
('SUPER_ADMIN','therapy.view',true),('SUPER_ADMIN','therapy.manage',true),
('SUPER_ADMIN','mileage.view',true),('SUPER_ADMIN','mileage.manage',true),
('SUPER_ADMIN','employee.view',true),('SUPER_ADMIN','employee.manage',true),
('SUPER_ADMIN','notifications.view',true),('SUPER_ADMIN','form_builder.manage',true),
('SUPER_ADMIN','settings.view',true),('SUPER_ADMIN','settings.manage',true),
('SUPER_ADMIN','admin.dashboard',true),('SUPER_ADMIN','admin.users',true),('SUPER_ADMIN','admin.organizations',true),('SUPER_ADMIN','admin.facilities',true),('SUPER_ADMIN','admin.roles',true),('SUPER_ADMIN','admin.audit',true)
on conflict(role, capability) do update set allowed = true, updated_at = now();
