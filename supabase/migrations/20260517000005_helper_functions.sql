-- Search intents by natural language query
create or replace function search_intents(
  query text,
  filter_category text default null,
  filter_verified boolean default null,
  result_limit integer default 20,
  result_offset integer default 0
)
returns table (
  intent_uuid     uuid,
  app_uuid        uuid,
  app_name        text,
  app_slug        text,
  app_logo        text,
  intent_id       text,
  intent_name     text,
  description     text,
  category        text,
  triggers        text[],
  requires_auth   boolean,
  destructive     boolean,
  is_verified     boolean,
  is_community    boolean,
  match_rank      float
) as $$
begin
  return query
  select
    i.id,
    a.id,
    a.name,
    a.slug,
    a.logo_url,
    i.intent_id,
    i.name,
    i.description,
    i.category,
    i.triggers,
    i.requires_auth,
    i.destructive,
    a.is_verified,
    a.is_community,
    ts_rank(i.search_vector, plainto_tsquery('english', query)) as rank
  from intents i
  join apps a on i.app_id = a.id
  where
    a.is_active = true
    and (filter_category is null or i.category = filter_category)
    and (filter_verified is null or a.is_verified = filter_verified)
    and i.search_vector @@ plainto_tsquery('english', query)
  order by rank desc
  limit result_limit
  offset result_offset;
end;
$$ language plpgsql;

-- Increment agent hit counter
create or replace function increment_app_hits(app_uuid uuid)
returns void as $$
begin
  update apps
  set agent_hits = agent_hits + 1
  where id = app_uuid;
end;
$$ language plpgsql security definer;

-- Update publisher stats
create or replace function update_publisher_stats(pub_id uuid)
returns void as $$
begin
  update publishers
  set
    total_apps = (select count(*) from apps where publisher_id = pub_id),
    total_intents = (
      select count(*) from intents i
      join apps a on i.app_id = a.id
      where a.publisher_id = pub_id
    )
  where id = pub_id;
end;
$$ language plpgsql security definer;
