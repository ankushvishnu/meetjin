import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-grid">
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[600px] w-[600px] rounded-full bg-accent/[0.04] blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-24 lg:px-8 lg:pt-40 lg:pb-32">
            <div className="max-w-3xl animate-fade-in">
              {/* Badge */}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-medium text-accent">
                  AIP v0.1 — Open Draft
                </span>
              </div>

              <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl leading-[1.1]">
                Make the web{" "}
                <span className="text-gradient">legible</span>
                <br />
                to AI agents.
              </h1>

              <p className="mt-8 text-lg leading-8 text-muted max-w-2xl">
                The Agent Intent Protocol is a lightweight, open standard that gives any
                web application a machine-readable intent layer. One JSON file. One
                well-known URL. Every agent can find you.
              </p>

              <div className="mt-10 flex items-center gap-4">
                <Link
                  href="/registry"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-background transition-all hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20"
                >
                  Browse Registry
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a
                  href="https://github.com/meetjin/jin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-card-hover hover:border-white/10"
                >
                  Read the Spec
                </a>
              </div>
            </div>

            {/* Code preview */}
            <div className="mt-20 animate-fade-in-delay-2">
              <div className="rounded-2xl border border-border bg-card overflow-hidden glow-border">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-card/80">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-danger/50" />
                    <div className="h-3 w-3 rounded-full bg-warning/50" />
                    <div className="h-3 w-3 rounded-full bg-success/50" />
                  </div>
                  <span className="ml-2 text-xs text-muted font-mono">
                    yourdomain.com/.well-known/jin.json
                  </span>
                </div>
                <pre className="p-6 text-sm leading-7 overflow-x-auto font-mono">
                  <code>
                    <span className="text-muted">{"{"}</span>{"\n"}
                    <span className="text-accent">  &quot;aip_version&quot;</span><span className="text-muted">:</span> <span className="text-success">&quot;0.1&quot;</span><span className="text-muted">,</span>{"\n"}
                    <span className="text-accent">  &quot;app&quot;</span><span className="text-muted">: {"{"}</span>{"\n"}
                    <span className="text-accent">    &quot;name&quot;</span><span className="text-muted">:</span> <span className="text-success">&quot;Your App&quot;</span><span className="text-muted">,</span>{"\n"}
                    <span className="text-accent">    &quot;description&quot;</span><span className="text-muted">:</span> <span className="text-success">&quot;What your app does&quot;</span>{"\n"}
                    <span className="text-muted">  {"}"}</span><span className="text-muted">,</span>{"\n"}
                    <span className="text-accent">  &quot;intents&quot;</span><span className="text-muted">: [</span>{"\n"}
                    <span className="text-muted">    {"{"}</span>{"\n"}
                    <span className="text-accent">      &quot;id&quot;</span><span className="text-muted">:</span> <span className="text-success">&quot;search_products&quot;</span><span className="text-muted">,</span>{"\n"}
                    <span className="text-accent">      &quot;triggers&quot;</span><span className="text-muted">:</span> <span className="text-muted">[</span><span className="text-success">&quot;find a product&quot;</span><span className="text-muted">, </span><span className="text-success">&quot;search items&quot;</span><span className="text-muted">],</span>{"\n"}
                    <span className="text-accent">      &quot;method&quot;</span><span className="text-muted">:</span> <span className="text-success">&quot;GET&quot;</span><span className="text-muted">,</span>{"\n"}
                    <span className="text-accent">      &quot;endpoint&quot;</span><span className="text-muted">:</span> <span className="text-success">&quot;/api/v1/products&quot;</span>{"\n"}
                    <span className="text-muted">    {"}"}</span>{"\n"}
                    <span className="text-muted">  ]</span>{"\n"}
                    <span className="text-muted">{"}"}</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border bg-card/30">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Three steps to agent-ready
              </h2>
              <p className="mt-4 text-muted text-lg">
                Add AIP to any app in under an hour. No rewrite required.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Generate",
                  description: "Run npx @meetjin/cli init to scan your codebase and generate a jin.json scaffold automatically.",
                  code: "npx @meetjin/cli init",
                },
                {
                  step: "02",
                  title: "Validate",
                  description: "Review your intents, add natural language triggers, and validate against the AIP spec.",
                  code: "npx @meetjin/cli validate",
                },
                {
                  step: "03",
                  title: "Publish",
                  description: "Deploy to /.well-known/jin.json and list your app on the registry for all agents to discover.",
                  code: "npx @meetjin/cli publish",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-accent/20 hover:bg-card-hover"
                >
                  <div className="mb-4 inline-flex items-center justify-center h-10 w-10 rounded-lg bg-accent/10 text-accent text-sm font-bold font-mono">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted text-sm leading-6 mb-6">
                    {item.description}
                  </p>
                  <div className="rounded-lg bg-background/60 border border-border px-4 py-2.5 font-mono text-sm text-accent">
                    $ {item.code}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories preview */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Every domain. One standard.
              </h2>
              <p className="mt-4 text-muted text-lg">
                From travel to government, AIP categories organize the agentic web.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "Commerce", icon: "🛒" },
                { label: "Travel", icon: "✈️" },
                { label: "Productivity", icon: "📋" },
                { label: "Finance", icon: "💰" },
                { label: "Healthcare", icon: "🏥" },
                { label: "Government", icon: "🏛️" },
                { label: "Education", icon: "🎓" },
                { label: "Developer", icon: "⚡" },
                { label: "Media", icon: "🎬" },
                { label: "Social", icon: "🌐" },
                { label: "Legal", icon: "⚖️" },
                { label: "Communication", icon: "💬" },
                { label: "Identity", icon: "🔑" },
                { label: "Data", icon: "📊" },
                { label: "Local", icon: "📍" },
              ].map((cat) => (
                <Link
                  key={cat.label}
                  href={`/registry?category=${cat.label.toLowerCase()}`}
                  className="inline-flex items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-3 text-sm transition-all hover:border-accent/20 hover:bg-card-hover"
                >
                  <span>{cat.icon}</span>
                  <span className="text-foreground font-medium">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-card/30">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              The agentic web needs a foundation.
            </h2>
            <p className="mt-4 text-muted text-lg max-w-2xl mx-auto">
              AIP is open (CC0), simple (one JSON file), and incremental (add to any existing app).
              Join the registry and make your app discoverable by every AI agent.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/publish"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-background transition-all hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20"
              >
                Publish Your App
              </Link>
              <Link
                href="/registry"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-card-hover hover:border-white/10"
              >
                Explore Registry
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
