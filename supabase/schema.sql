create type account_category as enum (
  'emergency',
  'savings',
  'discretionary',
  'investment',
  'retirement',
  'business',
  'debt'
);

create type account_liquidity as enum (
  'liquid',
  'semi_liquid',
  'illiquid'
);

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  provider text not null,
  category account_category not null,
  liquidity account_liquidity not null,
  currency text not null,
  balance numeric(18, 2) not null default 0,
  is_liability boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists account_history (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  date date not null,
  balance numeric(18, 2) not null default 0,
  fx_rate_used numeric(18, 6),
  created_at timestamptz not null default now()
);

create index if not exists accounts_user_id_idx on accounts(user_id);
create index if not exists account_history_account_id_idx on account_history(account_id);
create index if not exists account_history_date_idx on account_history(date);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_accounts_updated_at
before update on accounts
for each row execute function set_updated_at();

alter table accounts enable row level security;
alter table account_history enable row level security;

create policy "Accounts are user-owned" on accounts
for select
to authenticated
using (auth.uid() = user_id);

create policy "Accounts can be inserted by owner" on accounts
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Accounts can be updated by owner" on accounts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Accounts can be deleted by owner" on accounts
for delete
to authenticated
using (auth.uid() = user_id);

create policy "Account history is owner readable" on account_history
for select
to authenticated
using (
  exists (
    select 1 from accounts
    where accounts.id = account_history.account_id
      and accounts.user_id = auth.uid()
  )
);

create policy "Account history is owner writable" on account_history
for insert
to authenticated
with check (
  exists (
    select 1 from accounts
    where accounts.id = account_history.account_id
      and accounts.user_id = auth.uid()
  )
);

create policy "Account history is owner updatable" on account_history
for update
to authenticated
using (
  exists (
    select 1 from accounts
    where accounts.id = account_history.account_id
      and accounts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from accounts
    where accounts.id = account_history.account_id
      and accounts.user_id = auth.uid()
  )
);

create policy "Account history is owner deletable" on account_history
for delete
to authenticated
using (
  exists (
    select 1 from accounts
    where accounts.id = account_history.account_id
      and accounts.user_id = auth.uid()
  )
);
