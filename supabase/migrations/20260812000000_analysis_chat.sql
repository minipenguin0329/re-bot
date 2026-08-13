-- Persist AI chat turns attached to a user's completed analysis history.
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

create index if not exists chat_messages_analysis_sequence_idx
  on public.chat_messages (analysis_id, sequence);

alter table public.chat_messages enable row level security;

drop policy if exists chat_messages_own_analysis on public.chat_messages;
create policy chat_messages_own_analysis on public.chat_messages
  for all to authenticated
  using (
    exists (
      select 1 from public.analyses
      where analyses.id = chat_messages.analysis_id
        and analyses.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.analyses
      where analyses.id = chat_messages.analysis_id
        and analyses.user_id = (select auth.uid())
    )
  );
