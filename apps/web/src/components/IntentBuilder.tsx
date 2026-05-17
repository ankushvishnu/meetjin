"use client";

import { useState, useCallback } from "react";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface Intent {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  category: string;
  method: Method;
  endpoint: string;
  requires_auth: boolean;
  destructive: boolean;
  confirmation_required: boolean;
}

const EMPTY_INTENT: Intent = {
  id: "",
  name: "",
  description: "",
  triggers: [""],
  category: "developer",
  method: "GET",
  endpoint: "",
  requires_auth: false,
  destructive: false,
  confirmation_required: false,
};

const CATEGORIES = [
  "commerce", "travel", "productivity", "finance", "healthcare",
  "government", "education", "developer", "media", "social",
  "legal", "communication", "identity", "data", "local",
];

const METHODS: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function IntentBuilder() {
  const [appName, setAppName] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const [appContact, setAppContact] = useState("");
  const [authType, setAuthType] = useState<"none" | "bearer" | "api_key" | "oauth2">("none");
  const [intents, setIntents] = useState<Intent[]>([{ ...EMPTY_INTENT }]);
  const [activeTab, setActiveTab] = useState<"builder" | "json" | "validate">("builder");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const addIntent = () => {
    setIntents([...intents, { ...EMPTY_INTENT }]);
  };

  const removeIntent = (index: number) => {
    if (intents.length <= 1) return;
    setIntents(intents.filter((_, i) => i !== index));
  };

  const updateIntent = (index: number, field: keyof Intent, value: any) => {
    const updated = [...intents];
    updated[index] = { ...updated[index], [field]: value };
    setIntents(updated);
  };

  const addTrigger = (intentIndex: number) => {
    const updated = [...intents];
    updated[intentIndex] = {
      ...updated[intentIndex],
      triggers: [...updated[intentIndex].triggers, ""],
    };
    setIntents(updated);
  };

  const removeTrigger = (intentIndex: number, triggerIndex: number) => {
    const updated = [...intents];
    const triggers = updated[intentIndex].triggers.filter((_, i) => i !== triggerIndex);
    updated[intentIndex] = { ...updated[intentIndex], triggers: triggers.length ? triggers : [""] };
    setIntents(updated);
  };

  const updateTrigger = (intentIndex: number, triggerIndex: number, value: string) => {
    const updated = [...intents];
    const triggers = [...updated[intentIndex].triggers];
    triggers[triggerIndex] = value;
    updated[intentIndex] = { ...updated[intentIndex], triggers };
    setIntents(updated);
  };

  const generateJSON = useCallback(() => {
    const jin = {
      aip_version: "0.1",
      app: {
        name: appName || "My App",
        description: appDescription || "Description of my application",
        url: appUrl || "https://myapp.com",
        ...(appContact ? { contact: appContact } : {}),
      },
      auth: {
        type: authType,
      },
      intents: intents.map((intent) => ({
        id: intent.id || "my_intent",
        name: intent.name || "My Intent",
        description: intent.description || "What this intent does",
        triggers: intent.triggers.filter((t) => t.trim()),
        category: intent.category,
        method: intent.method,
        endpoint: intent.endpoint || "/api/v1/endpoint",
        requires_auth: intent.requires_auth,
        destructive: intent.destructive,
        confirmation_required: intent.confirmation_required,
      })),
      published: new Date().toISOString(),
    };
    return JSON.stringify(jin, null, 2);
  }, [appName, appDescription, appUrl, appContact, authType, intents]);

  const validateJSON = useCallback(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!appName.trim()) errors.push("App name is required.");
    if (!appDescription.trim()) errors.push("App description is required.");
    if (!appUrl.trim()) errors.push("App URL is required.");
    else if (!/^https?:\/\/.+/.test(appUrl)) errors.push("App URL must start with http:// or https://.");

    if (intents.length === 0) errors.push("At least one intent is required.");

    const ids = new Set<string>();
    intents.forEach((intent, i) => {
      const prefix = `Intent ${i + 1}`;
      if (!intent.id.trim()) errors.push(`${prefix}: ID is required.`);
      else if (ids.has(intent.id)) errors.push(`${prefix}: Duplicate intent ID "${intent.id}".`);
      else ids.add(intent.id);

      if (!intent.name.trim()) errors.push(`${prefix}: Name is required.`);
      if (!intent.description.trim()) errors.push(`${prefix}: Description is required.`);
      if (!intent.endpoint.trim()) errors.push(`${prefix}: Endpoint is required.`);

      const validTriggers = intent.triggers.filter((t) => t.trim());
      if (validTriggers.length === 0) errors.push(`${prefix}: At least one trigger is required.`);
      if (validTriggers.length < 2) warnings.push(`${prefix}: Consider adding more triggers for better agent discovery.`);

      if (intent.method === "DELETE" && !intent.destructive) {
        warnings.push(`${prefix}: DELETE endpoints should typically be marked as destructive.`);
      }
      if (intent.destructive && !intent.confirmation_required) {
        warnings.push(`${prefix}: Destructive intents should require confirmation.`);
      }
    });

    const result: ValidationResult = {
      valid: errors.length === 0,
      errors,
      warnings,
    };
    setValidation(result);
    return result;
  }, [appName, appDescription, appUrl, intents]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generateJSON());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJSON = () => {
    const blob = new Blob([generateJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jin.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-card border border-border w-fit">
        {(["builder", "json", "validate"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === "validate") validateJSON();
            }}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-accent/10 text-accent border border-accent/20"
                : "text-muted hover:text-foreground hover:bg-white/[0.04]"
            }`}
          >
            {tab === "builder" ? "Visual Builder" : tab === "json" ? "JSON Preview" : "Validate"}
          </button>
        ))}
      </div>

      {/* Builder Tab */}
      {activeTab === "builder" && (
        <div className="space-y-8">
          {/* App Info */}
          <div className="glass rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <span className="h-7 w-7 rounded-md bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">
                A
              </span>
              Application Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-muted mb-1.5">App Name *</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="My App"
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:border-accent focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1.5">App URL *</label>
                <input
                  type="url"
                  value={appUrl}
                  onChange={(e) => setAppUrl(e.target.value)}
                  placeholder="https://myapp.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:border-accent focus:outline-none transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-muted mb-1.5">Description *</label>
                <textarea
                  value={appDescription}
                  onChange={(e) => setAppDescription(e.target.value)}
                  placeholder="What your app does and how agents should interact with it"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:border-accent focus:outline-none transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1.5">Contact Email</label>
                <input
                  type="email"
                  value={appContact}
                  onChange={(e) => setAppContact(e.target.value)}
                  placeholder="dev@myapp.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:border-accent focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1.5">Auth Type</label>
                <select
                  value={authType}
                  onChange={(e) => setAuthType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:border-accent focus:outline-none transition-colors"
                >
                  <option value="none">None</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="api_key">API Key</option>
                  <option value="oauth2">OAuth 2.0</option>
                </select>
              </div>
            </div>
          </div>

          {/* Intents */}
          {intents.map((intent, idx) => (
            <div key={idx} className="glass rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="h-7 w-7 rounded-md bg-accent/10 flex items-center justify-center text-accent text-xs font-bold font-mono">
                    {idx + 1}
                  </span>
                  Intent
                </h3>
                {intents.length > 1 && (
                  <button
                    onClick={() => removeIntent(idx)}
                    className="text-xs text-danger hover:text-danger/80 transition-colors px-3 py-1.5 rounded-lg border border-danger/20 hover:bg-danger/10"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-sm text-muted mb-1.5">Intent ID *</label>
                  <input
                    type="text"
                    value={intent.id}
                    onChange={(e) => updateIntent(idx, "id", e.target.value)}
                    placeholder="search_products"
                    className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm font-mono focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1.5">Name *</label>
                  <input
                    type="text"
                    value={intent.name}
                    onChange={(e) => updateIntent(idx, "name", e.target.value)}
                    placeholder="Search Products"
                    className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-muted mb-1.5">Description *</label>
                  <textarea
                    value={intent.description}
                    onChange={(e) => updateIntent(idx, "description", e.target.value)}
                    placeholder="Search for products by name, category, or price range"
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:border-accent focus:outline-none transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1.5">Category</label>
                  <select
                    value={intent.category}
                    onChange={(e) => updateIntent(idx, "category", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:border-accent focus:outline-none transition-colors"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-muted mb-1.5">Method</label>
                    <select
                      value={intent.method}
                      onChange={(e) => updateIntent(idx, "method", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm font-mono focus:border-accent focus:outline-none transition-colors"
                    >
                      {METHODS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-muted mb-1.5">Endpoint *</label>
                    <input
                      type="text"
                      value={intent.endpoint}
                      onChange={(e) => updateIntent(idx, "endpoint", e.target.value)}
                      placeholder="/api/v1/products"
                      className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm font-mono focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Triggers */}
              <div className="mb-6">
                <label className="block text-sm text-muted mb-2">Natural Language Triggers *</label>
                <div className="space-y-2">
                  {intent.triggers.map((trigger, tIdx) => (
                    <div key={tIdx} className="flex gap-2">
                      <input
                        type="text"
                        value={trigger}
                        onChange={(e) => updateTrigger(idx, tIdx, e.target.value)}
                        placeholder={`e.g. "find a product", "search items"`}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:border-accent focus:outline-none transition-colors"
                      />
                      {intent.triggers.length > 1 && (
                        <button
                          onClick={() => removeTrigger(idx, tIdx)}
                          className="px-3 rounded-lg border border-border text-muted hover:text-danger hover:border-danger/30 transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addTrigger(idx)}
                  className="mt-2 text-xs text-accent hover:text-accent/80 transition-colors"
                >
                  + Add trigger
                </button>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-6 pt-4 border-t border-border/50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={intent.requires_auth}
                    onChange={(e) => updateIntent(idx, "requires_auth", e.target.checked)}
                    className="rounded border-border accent-accent"
                  />
                  <span className="text-sm text-muted">Requires Auth</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={intent.destructive}
                    onChange={(e) => updateIntent(idx, "destructive", e.target.checked)}
                    className="rounded border-border accent-accent"
                  />
                  <span className="text-sm text-muted">Destructive</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={intent.confirmation_required}
                    onChange={(e) => updateIntent(idx, "confirmation_required", e.target.checked)}
                    className="rounded border-border accent-accent"
                  />
                  <span className="text-sm text-muted">Requires Confirmation</span>
                </label>
              </div>
            </div>
          ))}

          <button
            onClick={addIntent}
            className="w-full rounded-xl border border-dashed border-border py-4 text-sm text-muted hover:text-accent hover:border-accent/30 transition-all"
          >
            + Add Another Intent
          </button>
        </div>
      )}

      {/* JSON Preview Tab */}
      {activeTab === "json" && (
        <div className="glass rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card/80">
            <span className="text-xs text-muted font-mono">jin.json</span>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted hover:text-foreground hover:border-accent/30 transition-all"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
              <button
                onClick={downloadJSON}
                className="text-xs px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-all"
              >
                Download
              </button>
            </div>
          </div>
          <pre className="p-6 text-sm leading-7 overflow-x-auto font-mono text-foreground">
            {generateJSON()}
          </pre>
        </div>
      )}

      {/* Validate Tab */}
      {activeTab === "validate" && validation && (
        <div className="space-y-6">
          {/* Status */}
          <div className={`glass rounded-2xl p-6 border ${
            validation.valid
              ? "border-success/30 bg-success/[0.03]"
              : "border-danger/30 bg-danger/[0.03]"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                validation.valid ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
              }`}>
                {validation.valid ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${validation.valid ? "text-success" : "text-danger"}`}>
                  {validation.valid ? "Valid AIP Document" : "Invalid AIP Document"}
                </h3>
                <p className="text-sm text-muted">
                  {validation.errors.length} error{validation.errors.length !== 1 ? "s" : ""}, {validation.warnings.length} warning{validation.warnings.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Errors */}
          {validation.errors.length > 0 && (
            <div className="glass rounded-2xl p-6 border border-danger/20">
              <h4 className="text-sm font-semibold text-danger mb-4 uppercase tracking-wider">Errors</h4>
              <ul className="space-y-2">
                {validation.errors.map((err, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-danger mt-0.5 flex-shrink-0">✗</span>
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <div className="glass rounded-2xl p-6 border border-warning/20">
              <h4 className="text-sm font-semibold text-warning mb-4 uppercase tracking-wider">Warnings</h4>
              <ul className="space-y-2">
                {validation.warnings.map((warn, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-warning mt-0.5 flex-shrink-0">⚠</span>
                    {warn}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
