-- Align attempt ownership with the custom public.users authentication model.
-- Apply after choosing the custom-auth path documented in README.md.

do $$
declare constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.attempts'::regclass
    and contype = 'f'
    and conkey = array[(select attnum from pg_attribute where attrelid = 'public.attempts'::regclass and attname = 'user_id')];
  if constraint_name is not null then execute format('alter table public.attempts drop constraint %I', constraint_name); end if;
end $$;

alter table public.attempts
  add constraint attempts_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;

create unique index if not exists user_answers_attempt_question_key
  on public.user_answers (attempt_id, question_id);
