create extension if not exists pgcrypto;

create table if not exists organizations(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists facilities(
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  address text,
  created_at timestamptz default now()
);

create table if not exists profiles(
  id uuid primary key,
  organization_id uuid references organizations(id) on delete set null,
  facility_id uuid references facilities(id) on delete set null,
  full_name text,
  role text not null default 'staff',
  phone text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists residents(
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  facility_id uuid references facilities(id) on delete set null,
  reference_id text,
  first_name text,
  last_name text,
  dob date,
  ahcccs_id text,
  admit_date date,
  diagnosis text,
  status text default 'active',
  phone text,
  email text,
  created_at timestamptz default now()
);

create table if not exists form_templates(
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  category text,
  name text not null,
  schema jsonb not null default '{}'::jsonb,
  active boolean default true,
  version int default 1,
  created_at timestamptz default now()
);

alter table form_templates add column if not exists slug text;
alter table form_templates add column if not exists created_by uuid references profiles(id) on delete set null;
create unique index if not exists form_templates_slug_key on form_templates(slug) where slug is not null;

create table if not exists form_submissions(
  id uuid primary key default gen_random_uuid(),
  template_id uuid references form_templates(id) on delete set null,
  resident_id uuid references residents(id) on delete cascade,
  created_by uuid references profiles(id) on delete set null,
  status text default 'draft',
  data jsonb not null default '{}'::jsonb,
  signed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table form_submissions add column if not exists form_slug text;
alter table form_submissions add column if not exists form_title text;
create index if not exists form_submissions_resident_idx on form_submissions(resident_id);
create index if not exists form_submissions_slug_idx on form_submissions(form_slug);

create table if not exists signatures(
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references form_submissions(id) on delete cascade,
  signer_id uuid references profiles(id) on delete set null,
  signer_name text,
  signer_role text,
  signed_at timestamptz default now()
);

create table if not exists vitals(
  id uuid primary key default gen_random_uuid(),
  resident_id uuid references residents(id) on delete cascade,
  recorded_by uuid references profiles(id) on delete set null,
  recorded_at timestamptz default now(),
  temperature numeric,
  pulse int,
  respiration int,
  systolic int,
  diastolic int,
  spo2 int,
  weight numeric,
  glucose numeric,
  height numeric
);

create table if not exists medications(
  id uuid primary key default gen_random_uuid(),
  resident_id uuid references residents(id) on delete cascade,
  name text not null,
  dosage text,
  route text,
  frequency text,
  prn boolean default false,
  active boolean default true,
  start_date date,
  end_date date
);

create table if not exists medication_administration(
  id uuid primary key default gen_random_uuid(),
  medication_id uuid references medications(id) on delete cascade,
  resident_id uuid references residents(id) on delete cascade,
  administered_by uuid references profiles(id) on delete set null,
  scheduled_at timestamptz,
  administered_at timestamptz,
  status text,
  notes text
);

create table if not exists employees(
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  organization_id uuid references organizations(id) on delete set null,
  employment_status text,
  hire_date date,
  job_title text,
  application jsonb default '{}'::jsonb
);

create table if not exists audit_logs(
  id bigint generated always as identity primary key,
  organization_id uuid,
  actor_id uuid,
  entity_type text,
  entity_id text,
  action text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists notifications(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text default 'info',
  href text,
  read boolean default false,
  created_at timestamptz default now()
);
create index if not exists notifications_user_idx on notifications(user_id, created_at desc);

-- Helpful profile bootstrap trigger for new Supabase Auth users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, active)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), 'staff', true)
  on conflict (id) do update set full_name = excluded.full_name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
