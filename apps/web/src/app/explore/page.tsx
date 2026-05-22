"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ApiCard } from "@/components/ApiCard";
import { IntentPanel } from "@/components/IntentPanel";
import { ApiTestAgent } from "@/components/ApiTestAgent";
import apis, { CommunityApi } from "@/data/community-apis";

const categories = [
  "all",
  "weather",
  "space",
  "developer",
  "data",
  "fun",
  "finance",
  "food",
  "geo",
] as const;

type LiveStatus = "idle" | "loading" | "ok" | "error";

function getPingUrl(api: CommunityApi) {
  const firstIntent = api.intents[0];
  if (!firstIntent) return api.baseUrl;

  const endpoint = firstIntent.endpoint.replace(/\{([^}]+)\}/g, (_, key) => {
    const param = firstIntent.parameters?.[key];
    if (param?.example !== undefined) return encodeURIComponent(String(param.example));
    if (param?.default !== undefined) return encodeURIComponent(String(param.default));
    if (param?.type === "number") return "1";
    if (param?.type === "boolean") return "true";
    return "test";
  });

  return `${api.baseUrl.replace(/\/$/, "")}${endpoint}`;
}

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedApi, setSelectedApi] = useState<CommunityApi | null>(null);
  const [liveStatus, setLiveStatus] = useState<Record<string, LiveStatus>>({});

  const filteredApis = useMemo(
    () =>
      activeCategory === "all"
        ? apis
        : apis.filter((api) => api.category === activeCategory),
    [activeCategory]
  );

  useEffect(() => {
    apis.forEach((api) => {
      setLiveStatus((prev) => ({ ...prev, [api.slug]: "loading" }));
      const pingUrl = getPingUrl(api);

      fetch(pingUrl, { method: "GET" })
        .then((res) => {
          setLiveStatus((prev) => ({
            ...prev,
            [api.slug]: res.ok ? "ok" : "error",
          }));
        })
        .catch(() => {
          setLiveStatus((prev) => ({ ...prev, [api.slug]: "error" }));
        });
    });
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <section className="border-b border-border bg-card/10">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-[1fr_0.95fr] lg:items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 rounded-full border border-border bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.36em] text-muted">
                  API Playground
                </div>
                <div className="space-y-4">
                  <h1 className="text-5xl font-black uppercase tracking-tight text-foreground sm:text-6xl">
                    Explore live intent maps.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-muted">
                    See real APIs in a modern agent playground, select a live endpoint, and experiment with intent-driven API calls.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`rounded-full border px-4 py-2 text-sm transition-all ${
                        activeCategory === category
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-card text-muted hover:border-accent/20 hover:bg-card-hover"
                      }`}
                    >
                      {category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-border bg-card p-8 shadow-[0_35px_80px_rgba(0,0,0,0.22)]">
                <p className="text-sm uppercase tracking-[0.35em] text-muted">Agent Console</p>
                <div className="mt-6 rounded-3xl border border-border bg-background/90 p-6 font-mono text-sm text-foreground">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.35em] text-muted">Live request</span>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-muted">real-time</span>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre-wrap leading-7">
                    <code>
{`GET /api/v1/trainers
Host: api.spotter.app
Accept: application/json

# response
200 OK
{
  "data": [ ... ]
}`}
                  </code>
                  </pre>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href="/build"
                      className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-background transition-all hover:bg-accent/90"
                    >
                      Open Agent Console
                    </a>
                    <a
                      href="/publish"
                      className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-accent/20 hover:text-accent"
                    >
                      Publish Intent Map
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid gap-10 xl:grid-cols-[0.6fr_0.4fr]">
            <div className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
                <div className="rounded-[2rem] border border-border bg-card p-8">
                  <p className="text-sm uppercase tracking-[0.35em] text-muted">Live status</p>
                  <p className="mt-4 text-3xl font-semibold text-foreground">Browse real endpoint health across our sample APIs.</p>
                </div>
                <div className="rounded-[2rem] border border-border bg-card p-8">
                  <p className="text-sm uppercase tracking-[0.35em] text-muted">Agent-ready</p>
                  <p className="mt-4 text-3xl font-semibold text-foreground">Each API is backed by an intent map and ready for agent discovery.</p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-border bg-card p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">API Catalog</h2>
                    <p className="mt-2 text-sm text-muted">Click any card to open details and explore the intent map.</p>
                  </div>
                  <div className="rounded-full border border-border bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.35em] text-muted">
                    {filteredApis.length} APIs
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-[2rem] border border-border bg-card p-8">
                <h3 className="text-xl font-semibold text-foreground">Selected API</h3>
                <p className="mt-3 text-muted text-sm leading-7">
                  Choose an API from the catalog to inspect its live status, available intents, and sample call flow.
                </p>
              </div>
              <div className="rounded-[2rem] border border-border bg-card p-8">
                <h3 className="text-xl font-semibold text-foreground">Hint</h3>
                <p className="mt-3 text-muted text-sm leading-7">
                  The best way to understand AIP is to see how real endpoints map to intent triggers and agent actions.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredApis.map((api) => (
              <ApiCard
                key={api.slug}
                api={api}
                liveStatus={liveStatus[api.slug] ?? "idle"}
                onSelect={() => setSelectedApi(api)}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <IntentPanel api={selectedApi} open={Boolean(selectedApi)} onClose={() => setSelectedApi(null)} />
    </>
  );
}
