create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

revoke all on public.users from anon, authenticated;
