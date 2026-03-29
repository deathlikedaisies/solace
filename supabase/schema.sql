create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'dose_event_type' and n.nspname = 'public'
  ) then
    create type public.dose_event_type as enum ('initial', 'reduction', 'increase');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  benzo_name text not null,
  starting_dose double precision check (starting_dose > 0),
  current_dose double precision not null check (current_dose > 0),
  taper_start_date date not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
  add column if not exists starting_dose double precision;

update public.profiles
set starting_dose = current_dose
where starting_dose is null;

alter table public.profiles
  drop constraint if exists profiles_starting_dose_positive;

alter table public.profiles
  add constraint profiles_starting_dose_positive
  check (starting_dose is null or starting_dose > 0);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  dose double precision not null check (dose > 0),
  anxiety integer not null check (anxiety between 0 and 10),
  mood integer not null check (mood between 0 and 10),
  sleep_quality integer not null check (sleep_quality between 0 and 10),
  sleep_hours double precision not null check (sleep_hours between 0 and 24),
  symptoms text[] not null default '{}',
  notes text,
  severe_flag boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint daily_logs_user_date_unique unique (user_id, log_date)
);

create table if not exists public.dose_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_date date not null,
  dose double precision not null check (dose > 0),
  event_type public.dose_event_type not null,
  note text,
  source_log_id uuid unique references public.daily_logs (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_taper_start_idx on public.profiles (taper_start_date);
create index if not exists daily_logs_user_date_idx on public.daily_logs (user_id, log_date desc);
create index if not exists dose_events_user_date_idx on public.dose_events (user_id, event_date desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists daily_logs_set_updated_at on public.daily_logs;
create trigger daily_logs_set_updated_at
before update on public.daily_logs
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.dose_events enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles
for delete
using (auth.uid() = id);

drop policy if exists "daily_logs_select_own" on public.daily_logs;
create policy "daily_logs_select_own"
on public.daily_logs
for select
using (auth.uid() = user_id);

drop policy if exists "daily_logs_insert_own" on public.daily_logs;
create policy "daily_logs_insert_own"
on public.daily_logs
for insert
with check (auth.uid() = user_id);

drop policy if exists "daily_logs_update_own" on public.daily_logs;
create policy "daily_logs_update_own"
on public.daily_logs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "daily_logs_delete_own" on public.daily_logs;
create policy "daily_logs_delete_own"
on public.daily_logs
for delete
using (auth.uid() = user_id);

drop policy if exists "dose_events_select_own" on public.dose_events;
create policy "dose_events_select_own"
on public.dose_events
for select
using (auth.uid() = user_id);

drop policy if exists "dose_events_insert_own" on public.dose_events;
create policy "dose_events_insert_own"
on public.dose_events
for insert
with check (auth.uid() = user_id);

drop policy if exists "dose_events_update_own" on public.dose_events;
create policy "dose_events_update_own"
on public.dose_events
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "dose_events_delete_own" on public.dose_events;
create policy "dose_events_delete_own"
on public.dose_events
for delete
using (auth.uid() = user_id);
