-- Chat transcripts contain free-form wellness information.
-- Keep them for 90 days from the most recent message in each analysis.
create extension if not exists pg_cron with schema pg_catalog;

create index if not exists chat_messages_analysis_created_idx
  on public.chat_messages (analysis_id, created_at desc);

create or replace function public.delete_expired_chat_messages()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count bigint;
begin
  with expired_analyses as (
    select analysis_id
    from public.chat_messages
    group by analysis_id
    having max(created_at) < timezone('utc', now()) - interval '90 days'
  ), deleted as (
    delete from public.chat_messages messages
    using expired_analyses expired
    where messages.analysis_id = expired.analysis_id
    returning 1
  )
  select count(*) into deleted_count from deleted;

  return deleted_count;
end;
$$;

revoke all on function public.delete_expired_chat_messages() from public;

select cron.unschedule(jobid)
from cron.job
where jobname = 'delete-expired-chat-messages';

select cron.schedule(
  'delete-expired-chat-messages',
  '20 3 * * *',
  'select public.delete_expired_chat_messages();'
);
