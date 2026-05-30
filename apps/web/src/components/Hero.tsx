import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-grid">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[700px] w-[700px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_35%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-28 pb-32 lg:px-8 lg:pt-32 lg:pb-36">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-2xl space-y-8 animate-fade-in">
            {/* Version Pill */}
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.36em] text-muted">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              AIP v0.2.2 — Live Update
            </div>
            
            {/* Copywriting Headlines */}
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.4em] text-muted">Agent Intent Protocol</p>
              <h1 className="text-4xl font-black uppercase tracking-tight leading-[0.94] text-foreground sm:text-6xl lg:text-7xl">
                The open infrastructure standard for the agentic web.
              </h1>
              <p className="max-w-xl text-xl leading-9 text-muted">
                A dual-sided protocol for machine-readable routing (<span className="text-foreground font-semibold">jin.json</span>) and zero-latency perimeter security.
              </p>
            </div>

            {/* Side-by-Side CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/build"
                className="inline-flex items-center justify-center rounded-full bg-foreground px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all hover:bg-white/90 shadow-lg shadow-white/5 active:scale-98"
              >
                Build an Agent
              </Link>
              <Link
                href="/shield"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.02] px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted transition-all hover:border-white/25 hover:bg-white/[0.05] hover:text-foreground active:scale-98"
              >
                Protect Your Site
              </Link>
            </div>
          </div>

          {/* Interactive jin.json card mockup */}
          <div className="relative rounded-[2rem] border border-border bg-card/80 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.25)] backdrop-blur-2xl animate-fade-in-delay-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-3 w-3 rounded-full bg-danger/50" />
              <div className="h-3 w-3 rounded-full bg-warning/50" />
              <div className="h-3 w-3 rounded-full bg-success/50" />
              <span className="ml-auto text-xs uppercase tracking-[0.3em] text-muted">/.well-known/jin.json</span>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-7 text-foreground">
              <code>
                <span className="text-muted">{"{"}</span>
                <br />
                <span className="text-accent">  "aip_version"</span><span className="text-muted">: </span><span className="text-success">"0.2.2"</span><span className="text-muted">,</span>
                <br />
                <span className="text-accent">  "app"</span><span className="text-muted">: {"{"}</span>
                <br />
                <span className="text-accent">    "name"</span><span className="text-muted">: </span><span className="text-success">"Sovereign API Gateway"</span><span className="text-muted">,</span>
                <br />
                <span className="text-accent">    "description"</span><span className="text-muted">: </span><span className="text-success">"Self-governing endpoints with cryptographic validation"</span>
                <br />
                <span className="text-muted">  {"}"}</span><span className="text-muted">,</span>
                <br />
                <span className="text-accent">  "security"</span><span className="text-muted">: {"{"}</span>
                <br />
                <span className="text-accent">    "shield"</span><span className="text-muted">: </span><span className="text-success">"enabled"</span><span className="text-muted">,</span>
                <br />
                <span className="text-accent">    "provider"</span><span className="text-muted">: </span><span className="text-success">"asymmetric-rs256"</span>
                <br />
                <span className="text-muted">  {"}"}</span><span className="text-muted">,</span>
                <br />
                <span className="text-accent">  "intents"</span><span className="text-muted">: [</span>
                <br />
                <span className="text-muted">    {"{"}</span>
                <br />
                <span className="text-accent">      "id"</span><span className="text-muted">: </span><span className="text-success">"fetch_secure_data"</span><span className="text-muted">,</span>
                <br />
                <span className="text-accent">      "method"</span><span className="text-muted">: </span><span className="text-success">"POST"</span><span className="text-muted">,</span>
                <br />
                <span className="text-accent">      "endpoint"</span><span className="text-muted">: </span><span className="text-success">"/api/v1/secure-fetch"</span>
                <br />
                <span className="text-muted">    {"}"}</span>
                <br />
                <span className="text-muted">  ]</span>
                <br />
                <span className="text-muted">{"}"}</span>
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
