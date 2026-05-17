"use client";

import { useState } from "react";

interface FetchResult {
  status: "idle" | "loading" | "success" | "error";
  data?: any;
  error?: string;
  url?: string;
}

export function IntentTester() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<FetchResult>({ status: "idle" });

  const fetchIntentMap = async () => {
    if (!url.trim()) return;
    setResult({ status: "loading" });

    try {
      // Normalize URL to include /.well-known/jin.json if not present
      let fetchUrl = url.trim();
      if (!fetchUrl.startsWith("http")) fetchUrl = `https://${fetchUrl}`;
      if (!fetchUrl.includes("jin.json")) {
        fetchUrl = fetchUrl.replace(/\/$/, "") + "/.well-known/jin.json";
      }

      const res = await fetch(`/api/v1/registry/fetch-intent-map?url=${encodeURIComponent(fetchUrl)}`);
      const data = await res.json();

      if (!res.ok) {
        setResult({ status: "error", error: data.error || "Failed to fetch", url: fetchUrl });
        return;
      }

      setResult({ status: "success", data, url: fetchUrl });
    } catch (err: any) {
      setResult({ status: "error", error: err.message || "Network error", url: url });
    }
  };

  return (
    <div className="glass rounded-2xl p-6 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
        <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
        Test a Live Intent Map
      </h3>
      <p className="text-sm text-muted mb-6">
        Enter a domain to fetch and inspect its <code className="px-1.5 py-0.5 rounded bg-white/[0.05] text-accent font-mono text-xs">/.well-known/jin.json</code>
      </p>

      <div className="flex gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchIntentMap()}
          placeholder="example.com"
          className="flex-1 px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm font-mono focus:border-accent focus:outline-none transition-colors"
        />
        <button
          onClick={fetchIntentMap}
          disabled={result.status === "loading"}
          className="px-5 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-medium hover:bg-accent/20 transition-all disabled:opacity-50"
        >
          {result.status === "loading" ? "Fetching..." : "Fetch"}
        </button>
      </div>

      {/* Result */}
      {result.status === "success" && result.data && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="text-sm text-success font-medium">
              Found intent map at {result.url}
            </span>
          </div>

          {/* App info */}
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="text-sm font-semibold text-foreground">{result.data.app?.name}</div>
            <div className="text-xs text-muted mt-1">{result.data.app?.description}</div>
            <div className="text-xs text-accent mt-2 font-mono">AIP v{result.data.aip_version}</div>
          </div>

          {/* Intents */}
          {result.data.intents?.map((intent: any, i: number) => (
            <div key={i} className="rounded-xl bg-card border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    intent.method === "GET" ? "bg-success/10 text-success" :
                    intent.method === "POST" ? "bg-accent/10 text-accent" :
                    "bg-warning/10 text-warning"
                  }`}>
                    {intent.method}
                  </span>
                  <span className="text-sm font-medium text-foreground">{intent.name}</span>
                </div>
                <span className="text-xs font-mono text-muted">{intent.endpoint}</span>
              </div>
              {intent.triggers && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {intent.triggers.map((t: string, j: number) => (
                    <span key={j} className="text-xs px-2 py-1 rounded bg-white/[0.03] text-muted border border-border">
                      &ldquo;{t}&rdquo;
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {result.status === "error" && (
        <div className="mt-6 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-danger" />
          <span className="text-sm text-danger">{result.error}</span>
        </div>
      )}
    </div>
  );
}
