-- RE:BOT Supabase schema. Run this entire file in the Supabase SQL Editor.
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 100),
  job text check (job is null or char_length(job) <= 100),
  birth_year integer check (birth_year is null or birth_year between 1900 and 2100),
  gender text check (gender is null or char_length(gender) <= 30),
  average_sleep_hours double precision check (
    average_sleep_hours is null or average_sleep_hours between 0 and 24
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  sleep_hours double precision check (sleep_hours is null or sleep_hours between 0 and 24),
  sleep_irregular boolean not null default false,
  stress_level integer check (stress_level is null or stress_level between 1 and 5),
  water_ml integer check (water_ml is null or water_ml between 0 and 20000),
  exercise_minutes integer check (
    exercise_minutes is null or exercise_minutes between 0 and 1440
  ),
  caffeine_count integer check (caffeine_count is null or caffeine_count between 0 and 100),
  alcohol boolean,
  meal_note text check (meal_note is null or char_length(meal_note) <= 2000),
  memo text check (memo is null or char_length(memo) <= 2000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, date)
);

create table if not exists public.symptoms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (char_length(category) between 1 and 100),
  description text not null check (char_length(description) between 1 and 4000),
  is_repeated boolean not null default false,
  image_path text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symptom_id uuid not null references public.symptoms(id) on delete cascade,
  status text not null check (status in ('pending', 'completed', 'failed')),
  model_name text not null,
  selection_status text not null default 'unselected'
    check (selection_status in ('unselected', 'candidate', 'none')),
  selected_candidate_id uuid,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.analysis_candidates (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  rank integer not null check (rank between 1 and 3),
  title text not null,
  reason text not null,
  evidence jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence) = 'array'),
  confirmation_question text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (analysis_id, rank)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'analyses_selected_candidate_id_fkey'
  ) then
    alter table public.analyses
      add constraint analyses_selected_candidate_id_fkey
      foreign key (selected_candidate_id)
      references public.analysis_candidates(id)
      on delete set null;
  end if;
end $$;

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  candidate_id uuid references public.analysis_candidates(id) on delete set null,
  action text not null,
  reason text not null,
  duration_minutes integer check (duration_minutes is null or duration_minutes between 1 and 1440),
  difficulty text check (difficulty is null or difficulty in ('easy', 'medium', 'hard')),
  alternative text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.recommendation_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommendation_id uuid not null references public.recommendations(id) on delete cascade,
  feedback text not null check (feedback in ('positive', 'negative')),
  reason text check (reason is null or char_length(reason) <= 1000),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_type text not null check (period_type in ('weekly', 'monthly')),
  period_start date not null,
  period_end date not null,
  statistics jsonb not null default '{}'::jsonb check (jsonb_typeof(statistics) = 'object'),
  summary jsonb not null default '{}'::jsonb check (jsonb_typeof(summary) = 'object'),
  created_at timestamptz not null default timezone('utc', now()),
  check (period_start <= period_end),
  unique (user_id, period_type, period_start, period_end)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text,
  image_url text,
  purchase_url text,
  tags jsonb not null default '[]'::jsonb check (jsonb_typeof(tags) = 'array'),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists daily_logs_user_date_idx
  on public.daily_logs (user_id, date desc);
create index if not exists symptoms_user_created_idx
  on public.symptoms (user_id, created_at desc);
create index if not exists symptoms_user_category_idx
  on public.symptoms (user_id, category, created_at desc);
create index if not exists analyses_user_created_idx
  on public.analyses (user_id, created_at desc);
create index if not exists analyses_symptom_idx
  on public.analyses (symptom_id);
create index if not exists analysis_candidates_analysis_rank_idx
  on public.analysis_candidates (analysis_id, rank);
create index if not exists recommendations_user_created_idx
  on public.recommendations (user_id, created_at desc);
create index if not exists recommendation_feedback_user_created_idx
  on public.recommendation_feedback (user_id, created_at desc);
create index if not exists reports_user_period_idx
  on public.reports (user_id, period_type, period_start desc);
create index if not exists products_active_category_idx
  on public.products (active, category);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists daily_logs_set_updated_at on public.daily_logs;
create trigger daily_logs_set_updated_at
before update on public.daily_logs
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.symptoms enable row level security;
alter table public.analyses enable row level security;
alter table public.analysis_candidates enable row level security;
alter table public.recommendations enable row level security;
alter table public.recommendation_feedback enable row level security;
alter table public.reports enable row level security;
alter table public.products enable row level security;

-- Re-runnable policy creation.
do $$
declare
  policy_name text;
begin
  foreach policy_name in array array[
    'profiles_own_rows', 'daily_logs_own_rows', 'symptoms_own_rows',
    'analyses_own_rows', 'analysis_candidates_own_rows',
    'recommendations_own_rows', 'recommendation_feedback_own_rows',
    'reports_own_rows', 'products_read_active'
  ] loop
    execute format('drop policy if exists %I on public.%I', policy_name,
      case policy_name
        when 'profiles_own_rows' then 'profiles'
        when 'daily_logs_own_rows' then 'daily_logs'
        when 'symptoms_own_rows' then 'symptoms'
        when 'analyses_own_rows' then 'analyses'
        when 'analysis_candidates_own_rows' then 'analysis_candidates'
        when 'recommendations_own_rows' then 'recommendations'
        when 'recommendation_feedback_own_rows' then 'recommendation_feedback'
        when 'reports_own_rows' then 'reports'
        else 'products'
      end
    );
  end loop;
end $$;

create policy profiles_own_rows on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy daily_logs_own_rows on public.daily_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy symptoms_own_rows on public.symptoms
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy analyses_own_rows on public.analyses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy analysis_candidates_own_rows on public.analysis_candidates
  for all using (
    exists (
      select 1 from public.analyses
      where analyses.id = analysis_candidates.analysis_id
        and analyses.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.analyses
      where analyses.id = analysis_candidates.analysis_id
        and analyses.user_id = auth.uid()
    )
  );
create policy recommendations_own_rows on public.recommendations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy recommendation_feedback_own_rows on public.recommendation_feedback
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy reports_own_rows on public.reports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy products_read_active on public.products
  for select using (active = true);

-- Private image bucket. The backend service-role client performs uploads.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wellness-images',
  'wellness-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
