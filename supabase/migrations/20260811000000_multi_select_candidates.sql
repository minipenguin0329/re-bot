-- Support selecting multiple analysis candidates instead of a single one.
alter table public.analysis_candidates
  add column if not exists selected boolean not null default false;

update public.analysis_candidates ac
set selected = true
from public.analyses a
where a.selected_candidate_id = ac.id;

alter table public.analyses
  drop constraint if exists analyses_selected_candidate_id_fkey;

drop index if exists public.analyses_selected_candidate_idx;

alter table public.analyses
  drop column if exists selected_candidate_id;

create index if not exists analysis_candidates_selected_idx
  on public.analysis_candidates (analysis_id) where selected;
