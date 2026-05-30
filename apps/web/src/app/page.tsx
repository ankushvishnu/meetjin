import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { FeatureSplit } from "@/components/FeatureSplit";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <Hero />
        <FeatureSplit />

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
                  tag: "npx @papercargo/jin-cli init",
                },
                {
                  title: "Describe",
                  detail: "Review and enrich the generated jin.json with natural language triggers and safety flags.",
                  tag: "npx @papercargo/jin-cli validate",
                },
                {
                  title: "Deploy",
                  detail: "Serve the intent map at /.well-known/jin.json and publish to the public registry.",
                  tag: "npx @papercargo/jin-cli publish",
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
