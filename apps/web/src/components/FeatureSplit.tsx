import Link from "next/link";

export function FeatureSplit() {
  return (
    <section className="relative border-t border-border bg-gradient-to-b from-background via-card/10 to-background py-24 lg:py-32">
      {/* Background radial glows */}
      <div className="absolute inset-x-0 top-0 -z-10 flex justify-between px-20 opacity-30">
        <div className="h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="h-[400px] w-[400px] rounded-full bg-accent-glow blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Component Header */}
        <div className="mx-auto max-w-3xl text-center mb-16 lg:mb-24">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">The Sovereign Agentic Economy</p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl uppercase leading-none">
            Choose your side of the protocol.
          </h2>
          <p className="mt-4 text-muted text-base sm:text-lg leading-relaxed">
            Jin aligns the incentives of webmasters and developers by providing a unified trust and capability standard.
          </p>
        </div>

        {/* Two Column Grid */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-stretch">
          
          {/* Left Column: Webmasters */}
          <div className="flex flex-col justify-between rounded-[2.5rem] border border-border bg-card/40 p-8 lg:p-12 backdrop-blur-xl transition-all hover:border-emerald-500/20 hover:bg-card/60 relative overflow-hidden group">
            {/* Top border glow effect on hover */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs uppercase tracking-widest text-emerald-400 font-semibold">
                🛡️ Supply Side
              </div>
              
              <h3 className="text-3xl font-black uppercase text-foreground">Webmaster Sovereignty</h3>
              
              <p className="text-muted leading-relaxed text-base">
                Take back your traffic. For years, websites have been forced to fight hostile, brute-force AI scrapers draining their servers. Jin gives you the power back. 
              </p>
              
              <ul className="space-y-3.5 text-sm text-muted">
                <li className="flex items-start gap-3">
                  <svg className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                  <span>
                    <strong>Stop Blind Scraping</strong>: Block aggressive scrapers instantly at the perimeter gateway before they hit your compute.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  <span>
                    <strong>Reduce Server Load</strong>: Short-circuit unauthorized requests at the door with light, high-performance in-memory middleware validation.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>
                    <strong>Control Perimeter Boundaries</strong>: Establish the exact perimeter boundary using <code className="text-emerald-400 font-mono text-xs">@papercargo/jin-cli</code>. If it isn't in your <code className="text-white font-mono text-xs">jin.json</code>, it does not exist to the agent.
                  </span>
                </li>
              </ul>
            </div>

            {/* Visual CLI/Gateway Screen for Webmasters */}
            <div className="mt-8 rounded-2xl border border-white/[0.06] bg-black/60 p-5 font-mono text-xs text-foreground shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3 border-b border-white/[0.04] pb-2 text-[10px] text-muted">
                <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
                <span>active perimeter: express gateway</span>
              </div>
              <div className="space-y-1.5 leading-5">
                <p className="text-muted">$ npx @papercargo/jin-cli shield</p>
                <p className="text-emerald-400">✓ Loaded public keys locally from JWKS endpoint (Cached)</p>
                <p className="text-emerald-400">✓ In-Memory RS256 trust verification engine activated [0ms-hop]</p>
                <p className="text-muted mt-2">// Request incoming logs...</p>
                <p className="text-red-400">[BLOCKED] GET /api/v1/users - Rogue Scraper (No token) ➔ 403 Forbidden</p>
                <p className="text-emerald-400">[PASSED]  POST /api/v1/secure-fetch - verified_intent="fetch_secure_data" ➔ 200 OK</p>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/shield"
                className="inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-emerald-400 hover:text-black active:scale-98"
              >
                Configure Jin Shield
              </Link>
            </div>
          </div>

          {/* Right Column: Developers */}
          <div className="flex flex-col justify-between rounded-[2.5rem] border border-border bg-card/40 p-8 lg:p-12 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-card/60 relative overflow-hidden group">
            {/* Top border glow effect on hover */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-widest text-white/80 font-semibold">
                ⚡ Demand Side
              </div>

              <h3 className="text-3xl font-black uppercase text-foreground">Agentic Determinism</h3>

              <p className="text-muted leading-relaxed text-base">
                Stop writing, testing, and maintaining brittle scrapers. LLMs naturally prefer the path of least compute. By providing a clean intent layer, navigate the web deterministically.
              </p>

              <ul className="space-y-3.5 text-sm text-muted">
                <li className="flex items-start gap-3">
                  <svg className="h-5 w-5 shrink-0 text-white/70 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    <strong>Save Compute & Cost</strong>: Avoid running CPU-heavy browser simulators or headless scrapers. Talk directly to clean protocol endpoints.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="h-5 w-5 shrink-0 text-white/70 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span>
                    <strong>Avoid DOM Parsing</strong>: No more regex extraction, structural layouts breaks, or hallucination-prone HTML conversions. Fetch clean API responses.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="h-5 w-5 shrink-0 text-white/70 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>
                    <strong>Native Millisecond Executions</strong>: Execute structured queries directly with authentic signatures. Achieve data transfer cycles in milliseconds instead of seconds.
                  </span>
                </li>
              </ul>
            </div>

            {/* Visual JSON/Response Mockup for Developers */}
            <div className="mt-8 rounded-2xl border border-white/[0.06] bg-black/60 p-5 font-mono text-xs text-foreground shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3 border-b border-white/[0.04] pb-2 text-[10px] text-muted">
                <span className="h-2 w-2 rounded-full bg-white/60 animate-ping" />
                <span>verified agent execution (latency: 12ms)</span>
              </div>
              <div className="space-y-1 text-xs leading-5">
                <p className="text-muted">➔ POST /api/v1/secure-fetch</p>
                <p className="text-muted">Authorization: Bearer jin_agent_passport_rs256...</p>
                <p className="text-success mt-2">← 200 OK</p>
                <pre className="text-white/80 overflow-x-auto">
                  <code>
                    {"{\n  \"status\": \"success\",\n  \"data\": {\n    \"claims_processed\": true,\n    \"data_payload\": [ ... ]\n  }\n}"}
                  </code>
                </pre>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/build"
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-muted transition-all hover:border-white/20 hover:bg-white/[0.04] hover:text-foreground active:scale-98"
              >
                Wrap Your Agent
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
