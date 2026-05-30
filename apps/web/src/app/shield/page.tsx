import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FrameworkTabs } from "@/components/FrameworkTabs";

export const metadata: Metadata = {
  title: "Jin Shield — Zero-Latency Scraper Protection | meetjin",
  description:
    "Active cryptographic gateway boundary protecting your endpoints against rogue scrapers. Zero-hop, in-memory asymmetric RS256 verification adapters for 12 major backend frameworks.",
};

const FRAMEWORK_BADGES = [
  { name: "Express", status: "✅ Supported", note: "Verb & route matcher extraction" },
  { name: "Next.js", status: "✅ Supported", note: "App & Pages Router dynamic middleware" },
  { name: "FastAPI", status: "✅ Supported", note: "Typed path variables & dependencies" },
  { name: "Hono", status: "✅ Supported", note: "Edge-native asymmetric JWT verification" },
  { name: "Fastify", status: "✅ Supported", note: "Explicit route declaration block scan" },
  { name: "NestJS", status: "✅ Supported", note: "Class prefix + Guard decorator matching" },
  { name: "tRPC", status: "✅ Supported", note: "Recursive nested dot-notation router crawl" },
  { name: "Django REST", status: "✅ Supported", note: "ViewSet router extraction & path variables" },
  { name: "Flask", status: "✅ Supported", note: "Supports methods lists & verb shortcuts" },
  { name: "Laravel", status: "✅ Supported", note: "Direct web/api PHP routes extraction" },
  { name: "Ruby on Rails", status: "✅ Supported", note: "Direct endpoints & resource macro normalizer" },
  { name: "OpenAPI Spec", status: "✅ Supported", note: "Recursive spec finder for legacy APIs" },
];

export default function ShieldPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background text-foreground relative overflow-hidden">
        {/* Glow backdrop circles */}
        <div className="absolute top-0 inset-x-0 -z-10 flex justify-center opacity-30">
          <div className="h-[600px] w-[800px] rounded-full bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.06),_transparent_45%)]" />
        </div>

        <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8 lg:py-20">
          {/* Header */}
          <div className="mb-16 animate-fade-in text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Security Gateway</span>
            </div>
            
            <h1 className="text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[0.95]">
              Universal Scraper Protection.
            </h1>
            <p className="mt-4 text-muted text-lg sm:text-xl leading-relaxed">
              Activate the <span className="text-foreground font-semibold">Jin Shield</span> cryptographic trust perimeter. Intercept incoming traffic, verify agent credentials locally, and short-circuit non-compliant scrapers in milliseconds.
            </p>
          </div>

          {/* ASCII / CSS Request-Pipeline Visual Diagram */}
          <div className="mb-20 animate-fade-in-delay-1">
            <div className="rounded-[2rem] border border-border bg-card/30 p-8 md:p-12 text-center backdrop-blur-2xl relative overflow-hidden">
              <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-muted mb-8">The "Take It or Leave It" Boundary</h3>
              
              <div className="flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto font-mono text-xs">
                {/* Incoming */}
                <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center text-muted">
                  [ Incoming HTTP Request ]
                </div>
                
                {/* Arrow */}
                <svg className="h-6 w-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>

                {/* Gateway Screen */}
                <div className="w-full max-w-md rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-6 py-5 text-center text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.05)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-grid opacity-10" />
                  <div className="relative space-y-1">
                    <p className="font-extrabold uppercase tracking-widest text-[10px] text-emerald-300">🛡️ Universal Jin Shield Gateway</p>
                    <p className="text-[11px] text-emerald-400/80">Cross-references signature public keys locally in-memory [0ms-hop]</p>
                  </div>
                </div>

                {/* Splitting Arrows */}
                <div className="flex w-full items-center justify-between max-w-lg px-8">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Signature Valid</span>
                    <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] text-red-400 font-bold">✗ Unverified / Scraper</span>
                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                {/* Destinations */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 w-full max-w-lg">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                    <p className="text-emerald-400 font-extrabold uppercase tracking-wider text-[10px]">Verified Jin Agent</p>
                    <p className="text-[11px] text-emerald-300/80 mt-1">200 OK — Millisecond execution access granted.</p>
                  </div>
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
                    <p className="text-red-400 font-extrabold uppercase tracking-wider text-[10px]">Rogue Scraper Blocked</p>
                    <p className="text-[11px] text-red-300/80 mt-1">403 Forbidden — Short-circuited immediately.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features Block */}
          <div className="mb-20 space-y-8 animate-fade-in-delay-2">
            <h2 className="text-2xl font-bold uppercase tracking-wide text-foreground border-b border-white/[0.06] pb-3">
              Perimeter Security Capabilities
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              {[
                {
                  title: "Zero-Latency Verification",
                  desc: "Resolves rotated public keys once upon server boot and caches them. All signatures are verified locally in-memory via asymmetric RS256, eliminating per-request network hops entirely.",
                },
                {
                  title: "Exact Intent Routing",
                  desc: "Decodes agent identity tokens and asserts that the verified intent_id claim matches the exact route path and HTTP method declared in your local jin.json specification map.",
                },
                {
                  title: "12 Native Adapters",
                  desc: "Out-of-the-box support for popular frameworks spanning Node.js, Python, PHP, and Ruby. Automatically configured during CLI static initialization scans.",
                },
                {
                  title: "Strict Fallback Boundary",
                  desc: "Short-circuits unauthorized agent hits or hostile crawlers with a standard HTTP 403 Forbidden, pointing them directly to the server's protocol map ('take it or leave it').",
                },
              ].map((feature) => (
                <div key={feature.title} className="rounded-2xl border border-border bg-card/20 p-6 hover:border-white/[0.1] hover:bg-card/40 transition-all">
                  <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Setup Guide */}
          <div className="mb-20 space-y-8 animate-fade-in-delay-3">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold uppercase tracking-wide text-foreground border-b border-white/[0.06] pb-3">
                Wire Up Your perimeter in 2 Steps
              </h2>
              <p className="text-muted text-sm leading-relaxed max-w-2xl">
                Activate the security shield using the unified CLI utility. It scans your controllers, hooks up your specifications, and generates drop-in middlewares.
              </p>
            </div>

            {/* CLI Command Step */}
            <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
                  1
                </span>
                <span className="text-sm font-bold uppercase tracking-widest text-foreground">
                  Run the CLI Shield Initializer
                </span>
              </div>
              <p className="text-muted text-sm pl-10 max-w-2xl">
                Open your terminal at the root of your repository and activate the universal security perimeter scaffold:
              </p>
              <div className="pl-10">
                <div className="rounded-xl border border-white/[0.06] bg-black/60 px-5 py-4 font-mono text-sm text-emerald-400 flex items-center justify-between">
                  <span>$ npx @papercargo/jin-cli shield</span>
                  <span className="text-[10px] text-white/30 uppercase tracking-wider select-none font-sans font-bold">Active CLI Scaffold</span>
                </div>
              </div>
            </div>

            {/* Interactive Code Snippets Step */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
                  2
                </span>
                <span className="text-sm font-bold uppercase tracking-widest text-foreground">
                  Drop the Generated Middleware Adapter In
                </span>
              </div>
              <p className="text-muted text-sm pl-10 max-w-2xl">
                Select your backend environment below to inspect the corresponding framework-specific integration guide:
              </p>
              <div className="pl-10">
                <FrameworkTabs />
              </div>
            </div>
          </div>

          {/* Framework Adapter Grid */}
          <div className="space-y-8 animate-fade-in-delay-3">
            <h2 className="text-2xl font-bold uppercase tracking-wide text-foreground border-b border-white/[0.06] pb-3">
              12 Supported Framework Adapters
            </h2>

            <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
              {FRAMEWORK_BADGES.map((fw) => (
                <div key={fw.name} className="rounded-2xl border border-white/[0.04] bg-card p-5 hover:border-emerald-500/25 hover:bg-card-hover transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">{fw.name}</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-full">
                      {fw.status.split(" ")[1]}
                    </span>
                  </div>
                  <p className="text-muted text-[11px] mt-2 leading-relaxed">{fw.note}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
