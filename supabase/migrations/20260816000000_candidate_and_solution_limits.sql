alter table public.analysis_candidates
  add column if not exists is_custom boolean not null default false;

alter table public.analysis_candidates
  drop constraint if exists analysis_candidates_rank_check;

alter table public.analysis_candidates
  add constraint analysis_candidates_rank_check
    check (rank between 1 and 9);

alter table public.recommendations
  add column if not exists additional_solutions jsonb not null default '[]'::jsonb;

alter table public.recommendations
  drop constraint if exists recommendations_additional_solutions_check;

alter table public.recommendations
  add constraint recommendations_additional_solutions_check
    check (
      jsonb_typeof(additional_solutions) = 'array'
      and jsonb_array_length(additional_solutions) <= 4
    );
