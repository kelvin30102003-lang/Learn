alter table public.users
  add column if not exists target_level text not null default 'N5';

alter table public.users
  drop constraint if exists users_target_level_check;

alter table public.users
  add constraint users_target_level_check check (target_level in ('N5', 'N4', 'N3', 'N2', 'N1'));
