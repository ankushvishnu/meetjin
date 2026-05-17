-- Apps
create index apps_publisher_id_idx on apps(publisher_id);
create index apps_slug_idx on apps(slug);
create index apps_is_verified_idx on apps(is_verified);
create index apps_is_community_idx on apps(is_community);
create index apps_categories_idx on apps using gin(categories);
create index apps_search_idx on apps using gin(search_vector);

-- Intents
create index intents_app_id_idx on intents(app_id);
create index intents_category_idx on intents(category);
create index intents_triggers_idx on intents using gin(triggers);
create index intents_search_idx on intents using gin(search_vector);

-- Agent sessions
create index agent_sessions_created_at_idx on agent_sessions(created_at);
create index agent_sessions_agent_id_idx on agent_sessions(agent_id);

-- Intent matches
create index intent_matches_intent_id_idx on intent_matches(intent_id);
create index intent_matches_app_id_idx on intent_matches(app_id);
create index intent_matches_created_at_idx on intent_matches(created_at);
