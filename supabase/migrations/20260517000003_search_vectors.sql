-- Apps search vector
create or replace function apps_search_vector_update()
returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.categories, ' '), '')), 'C');
  return new;
end;
$$ language plpgsql;

create trigger apps_search_vector_trigger
before insert or update on apps
for each row execute function apps_search_vector_update();

-- Intents search vector
create or replace function intents_search_vector_update()
returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.triggers, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.category, '')), 'C');
  return new;
end;
$$ language plpgsql;

create trigger intents_search_vector_trigger
before insert or update on intents
for each row execute function intents_search_vector_update();
