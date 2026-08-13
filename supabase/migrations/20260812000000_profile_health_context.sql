alter table public.profiles
  add column if not exists known_conditions text,
  add column if not exists allergies text;

alter table public.profiles
  drop constraint if exists profiles_known_conditions_length,
  add constraint profiles_known_conditions_length
    check (known_conditions is null or char_length(known_conditions) <= 2000),
  drop constraint if exists profiles_allergies_length,
  add constraint profiles_allergies_length
    check (allergies is null or char_length(allergies) <= 2000);

