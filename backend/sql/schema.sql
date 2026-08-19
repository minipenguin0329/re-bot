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
  known_conditions text check (
    known_conditions is null or char_length(known_conditions) <= 2000
  ),
  allergies text check (
    allergies is null or char_length(allergies) <= 2000
  ),
  special_notes text constraint profiles_special_notes_length_check check (
    special_notes is null or char_length(special_notes) <= 4000
  ),
  special_notes_classification jsonb not null default '[]'::jsonb
    constraint profiles_special_notes_classification_type_check
    check (jsonb_typeof(special_notes_classification) = 'array'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
  add column if not exists special_notes text;
alter table public.profiles
  add column if not exists special_notes_classification jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_special_notes_length_check'
  ) then
    alter table public.profiles
      add constraint profiles_special_notes_length_check
      check (special_notes is null or char_length(special_notes) <= 4000);
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_special_notes_classification_type_check'
  ) then
    alter table public.profiles
      add constraint profiles_special_notes_classification_type_check
      check (jsonb_typeof(special_notes_classification) = 'array');
  end if;
end $$;

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
  breakfast boolean not null default false,
  lunch boolean not null default false,
  dinner boolean not null default false,
  caffeine_count integer check (caffeine_count is null or caffeine_count between 0 and 100),
  alcohol boolean,
  meal_note text check (meal_note is null or char_length(meal_note) <= 2000),
  memo text check (memo is null or char_length(memo) <= 2000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, date)
);

alter table public.daily_logs
  add column if not exists breakfast boolean not null default false;
alter table public.daily_logs
  add column if not exists lunch boolean not null default false;
alter table public.daily_logs
  add column if not exists dinner boolean not null default false;

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
  symptom_keyword text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.analyses
  add column if not exists symptom_keyword text;

create table if not exists public.analysis_candidates (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  rank integer not null check (rank between 1 and 9),
  title text not null,
  reason text not null,
  evidence jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence) = 'array'),
  confirmation_question text not null,
  selected boolean not null default false,
  is_custom boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  unique (analysis_id, rank)
);

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
  additional_solutions jsonb not null default '[]'::jsonb
    check (
      jsonb_typeof(additional_solutions) = 'array'
      and jsonb_array_length(additional_solutions) <= 4
    ),
  support_resources jsonb not null default '[]'::jsonb
    check (
      jsonb_typeof(support_resources) = 'array'
      and jsonb_array_length(support_resources) <= 3
    ),
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

create table if not exists public.chat_messages (
  sequence bigint generated always as identity unique,
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  turn_id uuid not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 4000),
  model_name text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (turn_id, role),
  check (
    (role = 'user' and model_name is null)
    or (role = 'assistant' and model_name is not null)
  )
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text,
  image_url text,
  purchase_url text,
  tags jsonb not null default '[]'::jsonb check (jsonb_typeof(tags) = 'array'),
  price_krw integer check (price_krw is null or price_krw >= 0),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.products
  add column if not exists price_krw integer check (price_krw is null or price_krw >= 0);

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
create index if not exists analysis_candidates_selected_idx
  on public.analysis_candidates (analysis_id) where selected;
create index if not exists recommendations_user_created_idx
  on public.recommendations (user_id, created_at desc);
create index if not exists recommendations_analysis_idx
  on public.recommendations (analysis_id);
create index if not exists recommendations_candidate_idx
  on public.recommendations (candidate_id);
create index if not exists recommendation_feedback_user_created_idx
  on public.recommendation_feedback (user_id, created_at desc);
create index if not exists recommendation_feedback_recommendation_idx
  on public.recommendation_feedback (recommendation_id);
create index if not exists chat_messages_analysis_sequence_idx
  on public.chat_messages (analysis_id, sequence);
create index if not exists chat_messages_analysis_created_idx
  on public.chat_messages (analysis_id, created_at desc);
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
alter table public.chat_messages enable row level security;
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
    'chat_messages_own_analysis', 'products_read_active'
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
        when 'chat_messages_own_analysis' then 'chat_messages'
        else 'products'
      end
    );
  end loop;
end $$;

create policy profiles_own_rows on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy daily_logs_own_rows on public.daily_logs
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy symptoms_own_rows on public.symptoms
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy analyses_own_rows on public.analyses
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy analysis_candidates_own_rows on public.analysis_candidates
  for all to authenticated using (
    exists (
      select 1 from public.analyses
      where analyses.id = analysis_candidates.analysis_id
        and analyses.user_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.analyses
      where analyses.id = analysis_candidates.analysis_id
        and analyses.user_id = (select auth.uid())
    )
  );
create policy recommendations_own_rows on public.recommendations
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy recommendation_feedback_own_rows on public.recommendation_feedback
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy chat_messages_own_analysis on public.chat_messages
  for all to authenticated
  using (
    exists (
      select 1 from public.analyses
      where analyses.id = chat_messages.analysis_id
        and analyses.user_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.analyses
      where analyses.id = chat_messages.analysis_id
        and analyses.user_id = (select auth.uid())
    )
  );
create policy products_read_active on public.products
  for select using (active = true);

insert into public.products (
  id, name, category, description, image_url, purchase_url, tags, price_krw, active
) values
  ('10000000-0000-4000-8000-000000000001', '저자극 보습 크림', 'recommended', '건조한 피부를 위한 데일리 보습 제품', null, 'https://search.shopping.naver.com/search/all?query=%EC%A0%80%EC%9E%90%EA%B7%B9%20%EB%B3%B4%EC%8A%B5%20%ED%81%AC%EB%A6%BC', '["hydration"]'::jsonb, 18900, true),
  ('10000000-0000-4000-8000-000000000002', '데일리 수분 케어', 'recommended', '일상적인 수분 보충을 돕는 케어 제품', null, 'https://search.shopping.naver.com/search/all?query=%EB%8D%B0%EC%9D%BC%EB%A6%AC%20%EC%88%98%EB%B6%84%20%EC%BC%80%EC%96%B4', '["hydration"]'::jsonb, 15900, true),
  ('10000000-0000-4000-8000-000000000003', '마그네슘 밸런스', 'recommended', '편안한 수면 루틴을 위한 제품', null, 'https://search.shopping.naver.com/search/all?query=%EB%A7%88%EA%B7%B8%EB%84%A4%EC%8A%98%20%EB%B0%B8%EB%9F%B0%EC%8A%A4', '["sleep"]'::jsonb, 22000, true),
  ('10000000-0000-4000-8000-000000000004', '숙면 아이필로우', 'recommended', '빛을 줄여 수면 환경을 돕는 아이필로우', null, 'https://search.shopping.naver.com/search/all?query=%EC%88%99%EB%A9%B4%20%EC%95%84%EC%9D%B4%ED%95%84%EB%A1%9C%EC%9A%B0', '["sleep"]'::jsonb, 12900, true),
  ('10000000-0000-4000-8000-000000000005', '저자극 클렌징 폼', 'popular', '부드러운 세안을 위한 저자극 클렌저', null, 'https://search.shopping.naver.com/search/all?query=%EC%A0%80%EC%9E%90%EA%B7%B9%20%ED%81%B4%EB%A0%8C%EC%A7%95%20%ED%8F%BC', '["hydration"]'::jsonb, 13900, true),
  ('10000000-0000-4000-8000-000000000006', '데스크 눈 휴식 타이머', 'popular', '화면 휴식 주기를 관리하는 데스크 도구', null, 'https://search.shopping.naver.com/search/all?query=%EB%8D%B0%EC%8A%A4%ED%81%AC%20%EB%88%88%20%ED%9C%B4%EC%8B%9D%20%ED%83%80%EC%9D%B4%EB%A8%B8', '["desk_environment"]'::jsonb, 25900, true),
  ('10000000-0000-4000-8000-000000000007', '스트레칭 폼롤러', 'popular', '짧은 스트레칭과 운동 루틴을 돕는 폼롤러', null, 'https://search.shopping.naver.com/search/all?query=%EC%8A%A4%ED%8A%B8%EB%A0%88%EC%B9%AD%20%ED%8F%BC%EB%A1%A4%EB%9F%AC', '["exercise"]'::jsonb, 19900, true),
  ('10000000-0000-4000-8000-000000000008', '무드등 화이트노이즈', 'popular', '편안한 취침 환경을 만드는 무드등', null, 'https://search.shopping.naver.com/search/all?query=%EB%AC%B4%EB%93%9C%EB%93%B1%20%ED%99%94%EC%9D%B4%ED%8A%B8%EB%85%B8%EC%9D%B4%EC%A6%88', '["sleep", "desk_environment"]'::jsonb, 34900, true)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  image_url = excluded.image_url,
  purchase_url = excluded.purchase_url,
  tags = excluded.tags,
  price_krw = excluded.price_krw,
  active = excluded.active;

-- Private image bucket. Request-scoped user clients perform RLS-protected uploads.
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

drop policy if exists wellness_images_insert_own on storage.objects;
drop policy if exists wellness_images_select_own on storage.objects;
drop policy if exists wellness_images_delete_own on storage.objects;

create policy wellness_images_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'wellness-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy wellness_images_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'wellness-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy wellness_images_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'wellness-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
