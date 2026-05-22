"use client";

import { useEffect, useMemo, useState } from "react";
import type { CommunityApi, AIPIntent } from "@/data/community-apis";
import { ParamForm } from "@/components/ParamForm";

type IntentPanelProps = {
  api: CommunityApi | null;
  open: boolean;
  onClose: () => void;
};

type ResponseState = {
  status: "idle" | "loading" | "success" | "error";
  data?: any;
  statusCode?: number;
  responseTimeMs?: number;
  error?: string;
  curlCommand?: string;
};

function interpolateEndpoint(endpoint: string, values: Record<string, unknown>) {
  return endpoint.replace(/\{([^}]+)\}/g, (_, key) => {
    const value = values[key] ?? "";
    return encodeURIComponent(String(value));
  });
}

function buildQueryString(params: Record<string, unknown>) {
  const entries = Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null);
  const search = new URLSearchParams();
  entries.forEach(([key, value]) => {
    search.append(key, String(value));
  });
  const string = search.toString();
  return string ? `?${string}` : "";
}

function buildCurlCommand(url: string, method: string, init: RequestInit) {
  const parts = [`curl -X ${method} "${url}"`];
  if (init.headers) {
    const headers = init.headers as Record<string, string>;
    for (const [key, value] of Object.entries(headers)) {
      parts.push(`-H '${key}: ${value}'`);
    }
  }
  if (init.body) {
    parts.push(`-d '${String(init.body)}'`);
  }
  return parts.join(" ");
}

function makeIntentMap(api: CommunityApi) {
  return {
    aip_version: "0.1",
    app: {
      name: api.name,
      description: api.description,
      url: api.intentMapUrl.replace(/\/\.well-known\/jin\.json$/, ""),
    },
    auth: { type: "none" },
    intents: api.intents,
    published: new Date().toISOString(),
  };
}

export function IntentPanel({ api, open, onClose }: IntentPanelProps) {
  const [activeIntentIndex, setActiveIntentIndex] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [response, setResponse] = useState<ResponseState>({ status: "idle" });
  const [showRaw, setShowRaw] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const intent = api?.intents[activeIntentIndex] ?? null;

  useEffect(() => {
    if (api) {
      setActiveIntentIndex(0);
      setFormValues({});
      setResponse({ status: "idle" });
      setShowRaw(false);
      setCopySuccess(false);
    }
  }, [api]);

  useEffect(() => {
    if (!intent) return;
    const initialValues: Record<string, unknown> = {};
    if (intent.parameters) {
      Object.entries(intent.parameters).forEach(([key, param]) => {
        if (param.default !== undefined) {
          initialValues[key] = param.default;
        } else if (param.type === "boolean") {
          initialValues[key] = false;
        } else {
          initialValues[key] = "";
        }
      });
    }
    setFormValues(initialValues);
    setResponse({ status: "idle" });
    setCopySuccess(false);
  }, [intent]);

  const requestInfo = useMemo(() => {
    if (!api || !intent) return null;

    const pathValues: Record<string, unknown> = {};
    const queryValues: Record<string, unknown> = {};
    const bodyValues: Record<string, unknown> = {};

    const template = intent.endpoint;
    const tokens = Array.from(template.matchAll(/\{([^}]+)\}/g)).map((m) => m[1]);

    if (intent.parameters) {
      Object.entries(intent.parameters).forEach(([key, param]) => {
        const value = formValues[key] ?? param.default ?? "";
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
    const url = `${api.baseUrl.replace(/\/$/, "")}${endpoint}${query}`;
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
  }, [api, intent, formValues]);

  const execute = async () => {
    if (!requestInfo || !intent) return;

    setResponse({ status: "loading" });

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
        setResponse({
          status: "error",
          error: "API may be temporarily unavailable.",
          curlCommand: buildCurlCommand(requestInfo.url, requestInfo.init.method ?? "GET", requestInfo.init),
          statusCode: res.status,
          responseTimeMs: elapsed,
          data,
        });
        return;
      }

      setResponse({
        status: "success",
        data,
        statusCode: res.status,
        responseTimeMs: elapsed,
      });
    } catch (err: any) {
      setResponse({
        status: "error",
        error:
          err?.message?.includes("CORS") || err?.message?.includes("Failed to fetch")
            ? "This API blocks browser requests. Copy the curl command below to test in terminal."
            : "This API could not be reached.",
        curlCommand: buildCurlCommand(requestInfo.url, requestInfo.init.method ?? "GET", requestInfo.init),
      });
    }
  };

  const rawIntentMap = api ? makeIntentMap(api) : null;

  if (!api) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto border-l border-border bg-background p-6 shadow-2xl transition-transform duration-300 lg:w-[720px] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-accent">Live API Playground</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">{api.name}</h2>
            <p className="mt-2 text-sm text-muted max-w-2xl">{api.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-card px-3 py-2 text-sm text-muted hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center gap-3">
              {api.intents.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveIntentIndex(idx);
                    setCopySuccess(false);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    idx === activeIntentIndex
                      ? "bg-accent text-background"
                      : "border border-border bg-background text-muted hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {intent && (
            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.04] px-3 py-1 text-xs font-semibold text-foreground">
                    {intent.method}
                  </div>
                  <p className="mt-4 text-sm text-muted">{intent.description}</p>
                </div>
                <div className="rounded-full border border-border bg-background px-3 py-2 text-xs text-muted">
                  {intent.endpoint}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Parameters</h3>
                <ParamForm
                  parameters={intent.parameters}
                  values={formValues}
                  onChange={(name, value) => {
                    setFormValues((prev) => ({ ...prev, [name]: value }));
                    setCopySuccess(false);
                  }}
                />
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted">
                  {requestInfo ? (
                    <>
                      URL: <span className="font-mono break-all">{requestInfo.url}</span>
                    </>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={execute}
                  disabled={response.status === "loading"}
                  className="inline-flex items-center justify-center rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-background transition-all hover:bg-accent/90 disabled:opacity-60"
                >
                  {response.status === "loading" ? "Executing..." : "Execute"}
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {response.status === "success" && (
                  <div className="rounded-3xl border border-success/20 bg-success/5 p-4 text-sm text-foreground">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-semibold text-success">Success</span>
                      {response.statusCode && <span>HTTP {response.statusCode}</span>}
                      {response.responseTimeMs !== undefined && <span>{response.responseTimeMs} ms</span>}
                    </div>
                  </div>
                )}

                {response.status === "error" && (
                  <div className="rounded-3xl border border-danger/20 bg-danger/5 p-4 text-sm text-foreground">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-semibold text-danger">Error</span>
                      <span>{response.error}</span>
                    </div>
                  </div>
                )}

                {(response.status === "success" || response.status === "error") && (
                  <div className="rounded-3xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Response</p>
                        <p className="text-xs text-muted">Raw response from the API.</p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          const text = response.data ? JSON.stringify(response.data, null, 2) : "";
                          await navigator.clipboard.writeText(text);
                          setCopySuccess(true);
                          window.setTimeout(() => setCopySuccess(false), 1200);
                        }}
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted hover:bg-white/5"
                      >
                        {copySuccess ? "Copied" : "Copy JSON"}
                      </button>
                    </div>
                    <pre className="max-h-72 overflow-auto rounded-2xl bg-black/20 p-4 text-xs text-foreground font-mono whitespace-pre-wrap break-words">
                      {response.data ? JSON.stringify(response.data, null, 2) : "No response body."}
                    </pre>
                  </div>
                )}

                {response.curlCommand && (
                  <div className="rounded-3xl border border-border bg-card p-4">
                    <p className="text-sm font-semibold text-foreground mb-2">CURL fallback</p>
                    <pre className="overflow-auto rounded-2xl bg-background p-4 text-xs text-foreground font-mono break-words">
                      {response.curlCommand}
                    </pre>
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-3xl border border-border bg-card p-4">
                <button
                  type="button"
                  onClick={() => setShowRaw((previous) => !previous)}
                  className="text-sm font-medium text-accent"
                >
                  {showRaw ? "Hide jin.json" : "View jin.json"}
                </button>
                {showRaw && rawIntentMap && (
                  <pre className="mt-4 overflow-auto rounded-2xl bg-black/20 p-4 text-xs text-foreground font-mono whitespace-pre-wrap">
                    {JSON.stringify(rawIntentMap, null, 2)}
                  </pre>
                )}
              </div>

              <a
                href="/spec"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all hover:bg-card-hover"
              >
                Publish your own →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
