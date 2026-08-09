-- Index foreign keys used by joins and replace per-row auth.uid() calls with
-- init-plan friendly expressions recommended by Supabase's database advisor.

create index if not exists analyses_selected_candidate_idx
  on public.analyses (selected_candidate_id);
create index if not exists recommendation_feedback_recommendation_idx
  on public.recommendation_feedback (recommendation_id);
create index if not exists recommendations_analysis_idx
  on public.recommendations (analysis_id);
create index if not exists recommendations_candidate_idx
  on public.recommendations (candidate_id);

drop policy if exists profiles_own_rows on public.profiles;
drop policy if exists daily_logs_own_rows on public.daily_logs;
drop policy if exists symptoms_own_rows on public.symptoms;
drop policy if exists analyses_own_rows on public.analyses;
drop policy if exists analysis_candidates_own_rows on public.analysis_candidates;
drop policy if exists recommendations_own_rows on public.recommendations;
drop policy if exists recommendation_feedback_own_rows on public.recommendation_feedback;
drop policy if exists reports_own_rows on public.reports;

create policy profiles_own_rows on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy daily_logs_own_rows on public.daily_logs
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy symptoms_own_rows on public.symptoms
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy analyses_own_rows on public.analyses
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy analysis_candidates_own_rows on public.analysis_candidates
  for all to authenticated
  using (
    exists (
      select 1 from public.analyses
      where analyses.id = analysis_candidates.analysis_id
        and analyses.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.analyses
      where analyses.id = analysis_candidates.analysis_id
        and analyses.user_id = (select auth.uid())
    )
  );

create policy recommendations_own_rows on public.recommendations
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy recommendation_feedback_own_rows on public.recommendation_feedback
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy reports_own_rows on public.reports
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
