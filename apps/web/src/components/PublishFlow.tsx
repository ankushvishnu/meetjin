"use client";

import { useState } from "react";

type Step = "email" | "upload" | "done";

export function PublishFlow() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [intentMapUrl, setIntentMapUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [publishResult, setPublishResult] = useState<any>(null);

  const handleRegister = async () => {
    if (!email.trim() || !name.trim()) {
      setError("Name and email are required.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      // We no longer need to register for an API key first.
      // We can move directly to the upload step.
      setStep("upload");
    } catch (err: any) {
      setError(err.message || "Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!intentMapUrl.trim()) {
      setError("Intent map URL is required.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      // First fetch the intent map through our proxy
      const fetchRes = await fetch(`/api/v1/registry/fetch-intent-map?url=${encodeURIComponent(intentMapUrl)}`);
      const intentMap = await fetchRes.json();

      if (!fetchRes.ok) {
        setError(intentMap.error || "Failed to fetch intent map.");
        setIsLoading(false);
        return;
      }

      // Then publish it
      const pubRes = await fetch("/api/v1/publisher/apps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent_map_url: intentMapUrl,
          intent_map: intentMap,
          publisher: { name, email, company, website },
        }),
      });
      const pubData = await pubRes.json();

      if (!pubRes.ok) {
        setError(pubData.error || "Publish failed.");
        setIsLoading(false);
        return;
      }

      setPublishResult(pubData);
      setStep("done");
    } catch (err: any) {
      setError(err.message || "Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-10">
        {[
          { key: "email", label: "Details" },
          { key: "upload", label: "Publish" },
          { key: "done", label: "Done" },
        ].map((s, i) => {
          const steps: Step[] = ["email", "upload", "done"];
          const currentIdx = steps.indexOf(step);
          const isActive = steps.indexOf(s.key as Step) <= currentIdx;
          return (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  isActive
                    ? "bg-accent/10 text-accent border border-accent/30"
                    : "bg-card text-muted border border-border"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs ${isActive ? "text-foreground" : "text-muted"} hidden sm:block`}>
                {s.label}
              </span>
              {i < 2 && <div className={`flex-1 h-px ${isActive ? "bg-accent/30" : "bg-border"}`} />}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-danger/20 bg-danger/[0.03] p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Step 1: Register */}
      {step === "email" && (
        <div className="glass rounded-2xl p-8 border border-border animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-2">Register as a publisher</h2>
          <p className="text-muted text-sm mb-8">
            Create a publisher account to get an API key. This is also available
            via <code className="px-1.5 py-0.5 rounded bg-white/[0.05] text-accent font-mono text-xs">npx @meetjin/cli publish</code>.
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-muted mb-1.5">Publisher Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dev@yourcompany.com"
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your Company"
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-background transition-all hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20 disabled:opacity-50"
            >
              {isLoading ? "Continuing..." : "Continue to Publish"}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Show API Key */}
      {false && (
        <div className="glass rounded-2xl p-8 border border-border animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-2">Your API Key</h2>
          <p className="text-muted text-sm mb-6">
            Save this key securely. You&apos;ll need it for publishing via CLI too.
          </p>

          <div className="rounded-xl bg-card border border-accent/20 p-4 mb-6">
            <div className="text-xs text-muted mb-2">API Key</div>
            <code className="text-sm text-accent font-mono break-all select-all">{apiKey}</code>
          </div>

          <div className="rounded-xl bg-card border border-border p-4 mb-8">
            <div className="text-xs text-muted mb-2">CLI usage</div>
            <code className="text-sm text-foreground font-mono">
              JIN_API_KEY={apiKey.slice(0, 12)}... npx @meetjin/cli publish
            </code>
          </div>

          <button
            onClick={() => setStep("upload")}
            className="w-full rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-background transition-all hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20"
          >
            Continue to Publish
          </button>
        </div>
      )}

      {/* Step 3: Publish */}
      {step === "upload" && (
        <div className="glass rounded-2xl p-8 border border-border animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-2">Publish your intent map</h2>
          <p className="text-muted text-sm mb-8">
            Enter the URL of your <code className="px-1.5 py-0.5 rounded bg-white/[0.05] text-accent font-mono text-xs">/.well-known/jin.json</code> file.
            We&apos;ll fetch, validate, and import it into the registry.
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-muted mb-1.5">Intent Map URL *</label>
              <input
                type="url"
                value={intentMapUrl}
                onChange={(e) => setIntentMapUrl(e.target.value)}
                placeholder="https://yourapp.com/.well-known/jin.json"
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm font-mono focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={handlePublish}
              disabled={isLoading}
              className="w-full rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-background transition-all hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20 disabled:opacity-50"
            >
              {isLoading ? "Publishing..." : "Publish to Registry"}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === "done" && publishResult && (
        <div className="glass rounded-2xl p-8 border border-success/20 bg-success/[0.02] animate-fade-in text-center">
          <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Published!</h2>
          <p className="text-muted text-sm mb-6">
            Your app is now listed on the Jin Registry and discoverable by AI agents.
          </p>
          <div className="rounded-xl bg-card border border-border p-4 mb-6 text-left">
            <div className="text-xs text-muted mb-1">Registry URL</div>
            <a
              href={`/registry/${publishResult.slug || "your-app"}`}
              className="text-sm text-accent font-mono hover:underline"
            >
              meetjin.com/registry/{publishResult.slug || "your-app"}
            </a>
          </div>
          <div className="flex gap-3 justify-center">
            <a
              href={`/registry/${publishResult.slug || "your-app"}`}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-background transition-all hover:bg-accent/90"
            >
              View Listing
            </a>
            <button
              onClick={() => {
                setStep("email");
                setPublishResult(null);
                setApiKey("");
                setIntentMapUrl("");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-card-hover"
            >
              Publish Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
