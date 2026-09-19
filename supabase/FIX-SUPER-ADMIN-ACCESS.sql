-- SBH EHR Portal: Super Admin / role capability access fix
-- Safe to run more than once.

create table if not exists public.role_permissions (
  id bigint generated always as identity primary key,
  role text not null,
  capability text not null,
  allowed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(role, capability)
);

-- Normalize role values so SUPER ADMIN, super-admin, etc. become SUPER_ADMIN.
update public.profiles
set role = upper(regexp_replace(trim(role), '[[:space:]-]+', '_', 'g'))
where role is not null;

-- User may safely read their own profile. This also helps client-side profile UI.
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

-- Capability resolver used by proxy.ts and RLS policies.
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

-- Ensure Super Admin capability rows exist as documentation/fallback.
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
