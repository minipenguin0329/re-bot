alter table public.recommendations
  add column if not exists support_resources jsonb
  not null default '[]'::jsonb;

alter table public.recommendations
  drop constraint if exists recommendations_support_resources_check;

alter table public.recommendations
  add constraint recommendations_support_resources_check
    check (
      jsonb_typeof(support_resources) = 'array'
      and jsonb_array_length(support_resources) <= 3
    );
