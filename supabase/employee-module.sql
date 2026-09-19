-- Complete Employee / HR workspace
alter table public.employees add column if not exists employee_number text;
alter table public.employees add column if not exists department text;
alter table public.employees add column if not exists supervisor_id uuid references public.profiles(id) on delete set null;
alter table public.employees add column if not exists updated_at timestamptz default now();
create table if not exists public.employee_records(id uuid primary key default gen_random_uuid(),employee_id uuid references public.profiles(id) on delete cascade,module text not null,title text not null,status text not null default 'draft',data jsonb not null default '{}'::jsonb,created_by uuid references public.profiles(id) on delete set null,created_at timestamptz default now(),updated_at timestamptz default now());
create index if not exists employee_records_employee_module_idx on public.employee_records(employee_id,module,created_at desc);
alter table public.employee_records enable row level security;
drop policy if exists "employee records read" on public.employee_records;drop policy if exists "employee records insert" on public.employee_records;drop policy if exists "employee records update" on public.employee_records;drop policy if exists "employee records delete" on public.employee_records;
create policy "employee records read" on public.employee_records for select to authenticated using (employee_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and upper(p.role) in ('ADMIN','SUPER_ADMIN')));
create policy "employee records insert" on public.employee_records for insert to authenticated with check (employee_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and upper(p.role) in ('ADMIN','SUPER_ADMIN')));
create policy "employee records update" on public.employee_records for update to authenticated using (employee_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and upper(p.role) in ('ADMIN','SUPER_ADMIN'))) with check (employee_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and upper(p.role) in ('ADMIN','SUPER_ADMIN')));
create policy "employee records delete" on public.employee_records for delete to authenticated using (employee_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and upper(p.role) in ('ADMIN','SUPER_ADMIN')));
insert into storage.buckets(id,name,public) values('employee-documents','employee-documents',false) on conflict(id) do nothing;
drop policy if exists "employee documents read" on storage.objects;drop policy if exists "employee documents upload" on storage.objects;drop policy if exists "employee documents update" on storage.objects;drop policy if exists "employee documents delete" on storage.objects;
create policy "employee documents read" on storage.objects for select to authenticated using(bucket_id='employee-documents');
create policy "employee documents upload" on storage.objects for insert to authenticated with check(bucket_id='employee-documents');
create policy "employee documents update" on storage.objects for update to authenticated using(bucket_id='employee-documents');
create policy "employee documents delete" on storage.objects for delete to authenticated using(bucket_id='employee-documents');
