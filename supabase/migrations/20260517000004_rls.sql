-- Enable RLS
alter table publishers enable row level security;
alter table apps enable row level security;
alter table intents enable row level security;
alter table registry_events enable row level security;
alter table waitlist enable row level security;

-- Publishers: read own row, public can read basic info
create policy "publishers_read_own"
  on publishers for select
  using (auth.uid() = auth_user_id);

create policy "publishers_update_own"
  on publishers for update
  using (auth.uid() = auth_user_id);

-- Apps: public can read active apps
create policy "apps_public_read"
  on apps for select
  using (is_active = true);

create policy "apps_publisher_write"
  on apps for all
  using (
    publisher_id in (
      select id from publishers
      where auth_user_id = auth.uid()
    )
  );

-- Intents: public can read
create policy "intents_public_read"
  on intents for select
  using (true);

create policy "intents_publisher_write"
  on intents for all
  using (
    app_id in (
      select id from apps
      where publisher_id in (
        select id from publishers
        where auth_user_id = auth.uid()
      )
    )
  );

-- Waitlist: insert only for anon
create policy "waitlist_insert"
  on waitlist for insert
  with check (true);
