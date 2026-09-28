-- EDU-MIT Supabase schema
-- Run this in Supabase SQL Editor before enabling remote data.

create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('super_admin', 'school_admin', 'teacher', 'student');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.record_status as enum ('active', 'inactive', 'suspended', 'draft', 'approved');
exception when duplicate_object then null; end $$;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  school_code text unique,
  logo_url text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references public.schools(id) on delete cascade,
  full_name text not null,
  email text not null,
  role public.user_role not null,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.school_settings (
  school_id uuid primary key references public.schools(id) on delete cascade,
  country text default 'Nigeria',
  currency text default 'NGN',
  academic_session text default '2026/27',
  current_term text default 'Term 1',
  pass_mark integer default 50,
  grading_scale text default 'A-F',
  modules jsonb not null default '{}'::jsonb
);

create table if not exists public.school_subscriptions (
  school_id uuid primary key references public.schools(id) on delete cascade,
  plan text not null default 'Standard',
  status text not null default 'Active',
  renewal_date date
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid unique references auth.users(id) on delete set null,
  email text,
  admission_no text not null,
  first_name text not null,
  last_name text not null,
  class_name text,
  guardian_name text,
  guardian_phone text,
  parent_name text,
  address text,
  passport_url text,
  documents jsonb not null default '[]'::jsonb,
  status public.record_status not null default 'active',
  scores jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (school_id, admission_no)
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  subjects jsonb not null default '[]'::jsonb,
  classes jsonb not null default '[]'::jsonb,
  performance numeric(5,2) default 0,
  notes text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.academic_data (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  classes jsonb not null default '[]'::jsonb,
  subjects jsonb not null default '[]'::jsonb,
  subject_codes jsonb not null default '{}'::jsonb,
  timetable jsonb not null default '[]'::jsonb,
  dashboard_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (school_id)
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  attendance_date date not null,
  student_records jsonb not null default '{}'::jsonb,
  staff_records jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (school_id, attendance_date)
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  title text not null,
  class_name text,
  subject text,
  exam_date date,
  duration_minutes integer,
  status public.record_status not null default 'draft',
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.exam_results (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  exam_id uuid references public.exams(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  score numeric(5,2) not null check (score >= 0 and score <= 100),
  status public.record_status not null default 'draft',
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  unique (exam_id, student_id)
);

alter table public.students add column if not exists email text;
alter table public.students add column if not exists parent_name text;
alter table public.students add column if not exists address text;
alter table public.students add column if not exists passport_url text;
alter table public.students add column if not exists documents jsonb not null default '[]'::jsonb;
alter table public.academic_data add column if not exists dashboard_data jsonb not null default '{}'::jsonb;

create index if not exists profiles_school_idx on public.profiles(school_id);
create index if not exists students_school_idx on public.students(school_id);
create index if not exists teachers_school_idx on public.teachers(school_id);
create index if not exists attendance_school_date_idx on public.attendance_records(school_id, attendance_date);
create index if not exists exams_school_idx on public.exams(school_id);
create index if not exists results_school_idx on public.exam_results(school_id);

alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.school_settings enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.academic_data enable row level security;
alter table public.attendance_records enable row level security;
alter table public.exams enable row level security;
alter table public.exam_results enable row level security;
alter table public.school_subscriptions enable row level security;

create or replace function public.current_school_id()
returns uuid
language sql stable security definer set search_path = public
as $$ select school_id from public.profiles where id = auth.uid() and status = 'active' $$;

create or replace function public.is_super_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin' and status = 'active') $$;

create or replace function public.current_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() and status = 'active' $$;

create or replace function public.provision_auth_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  requested_role public.user_role;
  assigned_school uuid;
begin
  requested_role := coalesce(new.raw_user_meta_data ->> 'role', 'school_admin')::public.user_role;

  if requested_role = 'school_admin' then
    insert into public.schools (name)
    values (coalesce(nullif(trim(new.raw_user_meta_data ->> 'school_name'), ''), 'My School'))
    returning id into assigned_school;
  elsif requested_role = 'teacher' then
    select school_id into assigned_school
    from public.teachers
    where lower(email) = lower(new.email) and user_id is null
    limit 1;
    if assigned_school is null then
      raise exception 'No teacher invitation exists for this email.';
    end if;
  elsif requested_role = 'student' then
    select school_id into assigned_school
    from public.students
    where lower(email) = lower(new.email)
      and admission_no = upper(trim(new.raw_user_meta_data ->> 'admission_no'))
      and user_id is null
    limit 1;
    if assigned_school is null then
      raise exception 'The email and admission number do not match a student record.';
    end if;
  else
    raise exception 'This role cannot be self-registered.';
  end if;

  insert into public.profiles (id, school_id, full_name, email, role)
  values (new.id, assigned_school, coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)), lower(new.email), requested_role);

  if requested_role = 'teacher' then
    update public.teachers set user_id = new.id where school_id = assigned_school and lower(email) = lower(new.email);
  elsif requested_role = 'student' then
    update public.students set user_id = new.id where school_id = assigned_school and lower(email) = lower(new.email) and admission_no = upper(trim(new.raw_user_meta_data ->> 'admission_no'));
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.provision_auth_user();

create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_super_admin() then
    raise exception 'Only a Super Admin can change account roles.';
  end if;
  return new;
end;
$$;

create or replace function public.student_attendance()
returns table (attendance_date date, status text)
language sql stable security definer set search_path = public
as $$
  select a.attendance_date, a.student_records ->> s.id::text
  from public.attendance_records a
  join public.students s on s.school_id = a.school_id
  where s.user_id = auth.uid() and a.student_records ? s.id::text
  order by a.attendance_date desc;
$$;
grant execute on function public.student_attendance() to authenticated;

create or replace function public.student_schedule()
returns table (day text, start_time text, class_name text, subject text, teacher text)
language sql stable security definer set search_path = public
as $$
  select item ->> 'day', item ->> 'time', item ->> 'className', item ->> 'subject', item ->> 'teacher'
  from public.students s
  join public.academic_data a on a.school_id = s.school_id
  cross join lateral jsonb_array_elements(a.timetable) item
  where s.user_id = auth.uid() and item ->> 'className' = s.class_name;
$$;
grant execute on function public.student_schedule() to authenticated;

create or replace function public.student_results()
returns table (exam_title text, subject text, score numeric, status public.record_status, approved_at timestamptz)
language sql stable security definer set search_path = public
as $$
  select e.title, e.subject, r.score, r.status, r.approved_at
  from public.exam_results r
  join public.exams e on e.id = r.exam_id
  join public.students s on s.id = r.student_id
  where s.user_id = auth.uid();
$$;
grant execute on function public.student_results() to authenticated;

drop trigger if exists prevent_profile_role_change on public.profiles;
create trigger prevent_profile_role_change
before update on public.profiles
for each row execute function public.prevent_profile_role_change();

drop policy if exists "school members read schools" on public.schools;
drop policy if exists "school members manage schools" on public.schools;
drop policy if exists "users read own school profiles" on public.profiles;
drop policy if exists "school members manage settings" on public.school_settings;
drop policy if exists "school members manage students" on public.students;
drop policy if exists "school members manage teachers" on public.teachers;
drop policy if exists "school members manage academics" on public.academic_data;
drop policy if exists "school members manage attendance" on public.attendance_records;
drop policy if exists "school members manage exams" on public.exams;
drop policy if exists "school members manage results" on public.exam_results;
drop policy if exists "school members manage subscriptions" on public.school_subscriptions;

create policy "school members read schools" on public.schools for select
using (id = public.current_school_id() or public.is_super_admin());
create policy "school admins update own school" on public.schools for update
using (id = public.current_school_id() and public.current_role() = 'school_admin' or public.is_super_admin())
with check (id = public.current_school_id() and public.current_role() = 'school_admin' or public.is_super_admin());
create policy "platform admins delete schools" on public.schools for delete
using (public.is_super_admin());

create policy "users read own school profiles" on public.profiles for select
using (id = auth.uid() or (school_id = public.current_school_id() and public.current_role() = 'school_admin') or public.is_super_admin());
create policy "platform admins manage profiles" on public.profiles for all
using (public.is_super_admin()) with check (public.is_super_admin());
create policy "school admins deactivate staff" on public.profiles for update
using (school_id = public.current_school_id() and role = 'teacher' and public.current_role() = 'school_admin')
with check (school_id = public.current_school_id() and role = 'teacher');

create policy "school members read settings" on public.school_settings for select
using (school_id = public.current_school_id() or public.is_super_admin());
create policy "school admins manage settings" on public.school_settings for all
using ((school_id = public.current_school_id() and public.current_role() = 'school_admin') or public.is_super_admin())
with check ((school_id = public.current_school_id() and public.current_role() = 'school_admin') or public.is_super_admin());

create policy "school roles read students" on public.students for select
using (public.is_super_admin() or (school_id = public.current_school_id() and public.current_role() in ('school_admin', 'teacher')) or user_id = auth.uid());
create policy "school admins manage students" on public.students for all
using ((school_id = public.current_school_id() and public.current_role() = 'school_admin') or public.is_super_admin())
with check ((school_id = public.current_school_id() and public.current_role() = 'school_admin') or public.is_super_admin());

create policy "school roles read teachers" on public.teachers for select
using (public.is_super_admin() or (school_id = public.current_school_id() and public.current_role() = 'school_admin') or user_id = auth.uid());
create policy "school admins manage teachers" on public.teachers for all
using ((school_id = public.current_school_id() and public.current_role() = 'school_admin') or public.is_super_admin())
with check ((school_id = public.current_school_id() and public.current_role() = 'school_admin') or public.is_super_admin());

create policy "school staff read academics" on public.academic_data for select
using ((school_id = public.current_school_id() and public.current_role() in ('school_admin', 'teacher')) or public.is_super_admin());
create policy "school admins manage academics" on public.academic_data for all
using ((school_id = public.current_school_id() and public.current_role() = 'school_admin') or public.is_super_admin())
with check ((school_id = public.current_school_id() and public.current_role() = 'school_admin') or public.is_super_admin());

create policy "school staff manage attendance" on public.attendance_records for all
using ((school_id = public.current_school_id() and public.current_role() in ('school_admin', 'teacher')) or public.is_super_admin())
with check ((school_id = public.current_school_id() and public.current_role() in ('school_admin', 'teacher')) or public.is_super_admin());

create policy "school staff read exams" on public.exams for select
using ((school_id = public.current_school_id() and public.current_role() in ('school_admin', 'teacher')) or public.is_super_admin());
create policy "school admins manage exams" on public.exams for all
using ((school_id = public.current_school_id() and public.current_role() = 'school_admin') or public.is_super_admin())
with check ((school_id = public.current_school_id() and public.current_role() = 'school_admin') or public.is_super_admin());

create policy "school users read results" on public.exam_results for select
using (public.is_super_admin() or exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid()) or (school_id = public.current_school_id() and public.current_role() in ('school_admin', 'teacher')));
create policy "school staff manage results" on public.exam_results for all
using ((school_id = public.current_school_id() and public.current_role() in ('school_admin', 'teacher')) or public.is_super_admin())
with check ((school_id = public.current_school_id() and public.current_role() in ('school_admin', 'teacher')) or public.is_super_admin());

create policy "school admins read subscriptions" on public.school_subscriptions for select
using ((school_id = public.current_school_id() and public.current_role() = 'school_admin') or public.is_super_admin());
create policy "school admins manage subscriptions" on public.school_subscriptions for all
using ((school_id = public.current_school_id() and public.current_role() = 'school_admin') or public.is_super_admin())
with check ((school_id = public.current_school_id() and public.current_role() = 'school_admin') or public.is_super_admin());
