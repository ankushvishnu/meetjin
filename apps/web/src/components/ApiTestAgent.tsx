"use client";

import { useEffect, useState, useMemo } from "react";
import type { CommunityApi, AIPIntent } from "@/data/community-apis";
import apis from "@/data/community-apis";
import { generateAllParameters } from "@/utils/agent-utils";
import { ResponseRenderer } from "@/components/ResponseRenderer";

type ExecutionState = {
  status: "idle" | "loading" | "success" | "error";
  data?: any;
  error?: string;
  responseTimeMs?: number;
  statusCode?: number;
};

function interpolateEndpoint(endpoint: string, values: Record<string, unknown>) {
  return endpoint.replace(/\{([^}]+)\}/g, (_, key) => {
    const value = values[key] ?? "";
    return encodeURIComponent(String(value));
  });
}

function buildQueryString(params: Record<string, unknown>) {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== "" && value !== undefined && value !== null
  );
  const search = new URLSearchParams();
  entries.forEach(([key, value]) => {
    search.append(key, String(value));
  });
  const string = search.toString();
  return string ? `?${string}` : "";
}

export function ApiTestAgent() {
  const [selectedApiSlug, setSelectedApiSlug] = useState<string>(apis[0]?.slug || "");
  const [execution, setExecution] = useState<ExecutionState>({ status: "idle" });

  const selectedApi = useMemo(
    () => apis.find((api) => api.slug === selectedApiSlug),
    [selectedApiSlug]
  );

  const intent = selectedApi?.intents[0];
  const generatedParams = useMemo(
    () => (intent ? generateAllParameters(intent.parameters) : {}),
    [intent]
  );

  const requestInfo = useMemo(() => {
    if (!selectedApi || !intent) return null;

    const pathValues: Record<string, unknown> = {};
    const queryValues: Record<string, unknown> = {};
    const bodyValues: Record<string, unknown> = {};

    const template = intent.endpoint;
    const tokens = Array.from(template.matchAll(/\{([^}]+)\}/g)).map((m) => m[1]);

    if (intent.parameters) {
      Object.entries(intent.parameters).forEach(([key]) => {
        const value = generatedParams[key];
        if (tokens.includes(key)) {
          pathValues[key] = value;
        } else if (intent.method === "GET") {
          queryValues[key] = value;
        } else {
          bodyValues[key] = value;
        }
      });
    }

    const endpoint = interpolateEndpoint(intent.endpoint, pathValues);
    const query = buildQueryString(queryValues);
    const url = `${selectedApi.baseUrl.replace(/\/$/, "")}${endpoint}${query}`;

    const init: RequestInit = {
      method: intent.method,
      headers: {
        Accept: "application/json",
      },
    };

    if (intent.method !== "GET") {
      init.headers = {
        ...init.headers,
        "Content-Type": "application/json",
      };
      init.body = JSON.stringify(bodyValues);
    }

    return { url, init };
  }, [selectedApi, intent, generatedParams]);

  const executeAgent = async () => {
    if (!requestInfo || !selectedApi || !intent) return;

    setExecution({ status: "loading" });

    try {
      const start = performance.now();
      const res = await fetch(requestInfo.url, requestInfo.init);
      const elapsed = Math.round(performance.now() - start);

      const contentType = res.headers.get("content-type") || "";
      let data: any;

      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        setExecution({
          status: "error",
          error: `HTTP ${res.status}: ${res.statusText}`,
          statusCode: res.status,
          responseTimeMs: elapsed,
        });
        return;
      }

      setExecution({
        status: "success",
        data,
        statusCode: res.status,
        responseTimeMs: elapsed,
      });
    } catch (err: any) {
      setExecution({
        status: "error",
        error: err?.message || "Failed to execute request",
      });
    }
  };

  // Removed auto-execution on mount or when API changes
  useEffect(() => {
    // No longer auto-executing
  }, [selectedApiSlug]);

  return (
    <div className="rounded-3xl border border-border bg-card p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          🤖 AI Agent Test Simulator
        </h2>
        <p className="text-muted text-sm">
          Watch an agent discover and interact with any API. The agent reads the
          intent map, generates realistic test data, and displays results visually.
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          Select an API
        </label>
        <select
          value={selectedApiSlug}
          onChange={(e) => setSelectedApiSlug(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground text-sm focus:border-accent focus:outline-none"
        >
          {apis.map((api) => (
            <option key={api.slug} value={api.slug}>
              {api.emoji} {api.name} — {api.description}
            </option>
          ))}
        </select>
      </div>

      {selectedApi && intent && (
        <div className="mb-6 rounded-xl border border-border bg-white/[0.03] p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted mb-1">Intent</p>
              <p className="text-sm font-medium text-foreground">
                {intent.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Endpoint</p>
              <p className="text-xs font-mono text-accent break-all">
                {intent.method} {intent.endpoint}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted mb-1">Generated Parameters</p>
              <pre className="text-xs text-foreground font-mono bg-black/20 rounded p-2 overflow-auto max-h-24">
                {JSON.stringify(generatedParams, null, 2)}
              </pre>
            </div>
          </div>

          <button
            type="button"
            onClick={executeAgent}
            disabled={execution.status === "loading"}
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-background transition-all hover:bg-accent/90 disabled:opacity-60"
          >
            {execution.status === "loading" ? "Executing..." : "Run Agent"}
          </button>
        </div>
      )}

      {selectedApi && intent && execution.status === "success" && execution.data && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success/5 p-4">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="text-sm font-medium text-success">
              Success — {execution.responseTimeMs}ms
            </span>
          </div>
          <ResponseRenderer
            data={execution.data}
            api={selectedApi}
            intentName={intent.name}
          />
        </div>
      )}

      {execution.status === "error" && (
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-danger" />
            <span className="text-sm font-medium text-danger">Error</span>
          </div>
          <p className="text-sm text-foreground">{execution.error}</p>
        </div>
      )}
    </div>
  );
}
