"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface App {
  id: string;
  name: string;
  slug: string;
  description: string;
  url: string;
  categories: string[];
  total_intents: number;
  agent_hits: number;
  is_verified: boolean;
  is_community: boolean;
}

export function RegistrySearch({ initialApps }: { initialApps: App[] }) {
  const [query, setQuery] = useState("");
  const [apps, setApps] = useState<App[]>(initialApps);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setApps(initialApps);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/v1/registry/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.ok && data.results) {
        // The search API returns { app: {...}, intent: {...} } objects.
        // Map them to the flat App shape expected by this component,
        // deduplicating by app id.
        const seen = new Set<string>();
        const mapped: App[] = [];
        for (const result of data.results) {
          const app = result.app ?? result;
          const id = app.id;
          if (id && !seen.has(id)) {
            seen.add(id);
            mapped.push({
              id: app.id,
              name: app.name,
              slug: app.slug,
              description: app.description ?? "",
              url: app.url ?? "",
              categories: app.categories ?? [],
              total_intents: app.total_intents ?? 0,
              agent_hits: app.agent_hits ?? 0,
              is_verified: app.is_verified ?? false,
              is_community: app.is_community ?? false,
            });
          }
        }
        setApps(mapped);
      }
    } catch {
      // Silently fail, keep showing current results
    } finally {
      setIsSearching(false);
    }
  }, [initialApps]);

  useEffect(() => {
    const timeout = setTimeout(() => search(query), 300);
    return () => clearTimeout(timeout);
  }, [query, search]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Intent Registry
          </h1>
          <p className="mt-2 text-muted text-lg">
            Discover agent-enabled applications and their capabilities.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {isSearching ? (
              <svg className="w-4 h-4 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            )}
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full p-3 pl-10 text-sm text-foreground bg-card rounded-xl border border-border focus:ring-accent focus:border-accent focus:outline-none"
            placeholder="Search intents or apps..."
          />
        </div>
      </div>

      {/* Results Grid */}
      {apps.length === 0 ? (
        <div className="text-center py-12 col-span-full">
          <p className="text-muted">{query ? "No results found." : "No apps in the registry yet."}</p>
          {!query && <p className="text-sm text-muted mt-2">Publish your app using the CLI to see it here.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
          {apps.map((app) => (
            <div key={app.id} className="glass rounded-2xl p-6 flex flex-col justify-between hover:bg-card-hover transition-all border border-border hover:border-accent/20">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold">
                      {app.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-1.5">
                        {app.name}
                        {app.is_verified && (
                          <span className="text-success" title="Verified Publisher">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </h2>
                      <span className="text-xs text-muted">{app.url}</span>
                    </div>
                  </div>
                  {app.is_community ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.05] text-muted border border-border">
                      Community
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      Official
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted line-clamp-2 mb-4">
                  {app.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {app.categories && app.categories.map((cat: string) => (
                    <span key={cat} className="text-xs px-2 py-0.5 rounded-md bg-white/[0.03] text-foreground border border-border">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-auto flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-foreground font-medium">{app.total_intents}</span> <span className="text-muted">intents</span>
                </div>
                <div className="text-sm">
                  <span className="text-foreground font-medium">{app.agent_hits >= 1000 ? `${(app.agent_hits / 1000).toFixed(1)}k` : app.agent_hits}</span> <span className="text-muted">hits</span>
                </div>
                <Link
                  href={`/registry/${app.slug}`}
                  className="text-sm text-accent font-medium hover:text-accent/80"
                >
                  View Details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
