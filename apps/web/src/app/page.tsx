import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <section className="relative overflow-hidden bg-grid">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[700px] w-[700px] rounded-full bg-white/5 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_35%)]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 pt-28 pb-32 lg:px-8 lg:pt-32 lg:pb-36">
            <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="max-w-2xl space-y-8">
                <div className="inline-flex items-center gap-3 rounded-full border border-border bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.36em] text-muted">
                  <span className="inline-flex h-2 w-2 rounded-full bg-white/80 animate-pulse" />
                  AIP v0.1 — Open Draft
                </div>
                <div className="space-y-6">
                  <p className="text-sm uppercase tracking-[0.4em] text-muted">Agent Intent Protocol</p>
                  <h1 className="text-4xl font-black uppercase tracking-tight leading-[0.94] text-foreground sm:text-6xl lg:text-7xl">
                    Let agents understand your app.
                  </h1>
                  <p className="max-w-xl text-xl leading-9 text-muted">
                    Publish a machine-readable intent map at <span className="text-foreground font-semibold">/.well-known/jin.json</span> and make your application discoverable by every AI agent.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href="/registry"
                    className="inline-flex items-center justify-center rounded-full bg-foreground px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all hover:bg-white/90"
                  >
                    Browse registry
                  </Link>
                  <Link
                    href="/spec"
                    className="inline-flex items-center justify-center rounded-full border border-white/10 px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted transition-all hover:border-white/20 hover:text-foreground"
                  >
                    Read the spec
                  </Link>
                </div>
              </div>

              <div className="relative rounded-[2rem] border border-border bg-card/80 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-3 w-3 rounded-full bg-danger/50" />
                  <div className="h-3 w-3 rounded-full bg-warning/50" />
                  <div className="h-3 w-3 rounded-full bg-success/50" />
                  <span className="ml-auto text-xs uppercase tracking-[0.3em] text-muted">jin.json</span>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-7 text-foreground">
                  <code>
                    <span className="text-muted">{"{"}</span>
                    <br />
                    <span className="text-accent">  "aip_version"</span><span className="text-muted">: </span><span className="text-success">"0.1"</span><span className="text-muted">,</span>
                    <br />
                    <span className="text-accent">  "app"</span><span className="text-muted">: {"{"}</span>
                    <br />
                    <span className="text-accent">    "name"</span><span className="text-muted">: </span><span className="text-success">"Your App"</span><span className="text-muted">,</span>
                    <br />
                    <span className="text-accent">    "description"</span><span className="text-muted">: </span><span className="text-success">"What your app does"</span>
                    <br />
                    <span className="text-muted">  {"}"}</span><span className="text-muted">,</span>
                    <br />
                    <span className="text-accent">  "intents"</span><span className="text-muted">: [</span>
                    <br />
                    <span className="text-muted">    {"{"}</span>
                    <br />
                    <span className="text-accent">      "id"</span><span className="text-muted">: </span><span className="text-success">"book_session"</span><span className="text-muted">,</span>
                    <br />
                    <span className="text-accent">      "method"</span><span className="text-muted">: </span><span className="text-success">"POST"</span><span className="text-muted">,</span>
                    <br />
                    <span className="text-accent">      "endpoint"</span><span className="text-muted">: </span><span className="text-success">"/api/v1/bookings"</span>
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

        <section className="border-t border-border bg-card/30">
          <div className="mx-auto max-w-7xl space-y-16 px-6 py-24 lg:px-8 lg:py-32">
            <div className="space-y-4 text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-muted">How it works</p>
              <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                From discovery to publish in three steps.
              </h2>
              <p className="mx-auto max-w-2xl text-lg leading-8 text-muted">
                Jin reduces agent integration to a simple, repeatable workflow for any app or API.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {[
                {
                  title: "Discover",
                  detail: "Scan your codebase and detect routes, APIs, and OpenAPI specs with the CLI.",
                  tag: "npx @meetjin/cli init",
                },
                {
                  title: "Describe",
                  detail: "Review and enrich the generated jin.json with natural language triggers and safety flags.",
                  tag: "npx @meetjin/cli validate",
                },
                {
                  title: "Deploy",
                  detail: "Serve the intent map at /.well-known/jin.json and publish to the public registry.",
                  tag: "npx @meetjin/cli publish",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-[2rem] border border-border bg-card p-8 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-card-hover">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-sm font-semibold uppercase tracking-[0.3em] text-muted">
                    {item.title.slice(0, 1)}
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">{item.title}</h3>
                  <p className="text-muted leading-7 mb-6">{item.detail}</p>
                  <div className="rounded-3xl border border-border bg-background/70 px-4 py-3 font-mono text-sm text-accent">
                    $ {item.tag}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Commerce", label: "Retail, payments, orders" },
                { title: "Travel", label: "Bookings, itineraries, search" },
                { title: "Developer", label: "APIs, webhooks, tools" },
                { title: "Healthcare", label: "Appointments, records, coverage" },
                { title: "Government", label: "Forms, filings, status" },
                { title: "Media", label: "Search, playback, ads" },
              ].map((item) => (
                <div key={item.title} className="rounded-[2rem] border border-border bg-card p-8 text-center transition-all hover:border-accent/20 hover:bg-card-hover">
                  <span className="text-sm uppercase tracking-[0.35em] text-muted">{item.title}</span>
                  <p className="mt-5 text-2xl font-semibold text-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-card/30">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-muted">Join the movement</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Design the agentic web with Jin.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">
              Add a discoverable intent layer to your app, collaborate on the protocol, and make your product accessible to every modern agent.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/publish"
                className="inline-flex items-center justify-center rounded-full bg-foreground px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all hover:bg-white/90"
              >
                Publish your app
              </Link>
              <Link
                href="/spec"
                className="inline-flex items-center justify-center rounded-full border border-white/10 px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted transition-all hover:border-white/20 hover:text-foreground"
              >
                View the spec
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
