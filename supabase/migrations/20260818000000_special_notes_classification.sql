-- Store one free-form special-notes field and the server-generated AI classification.
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
