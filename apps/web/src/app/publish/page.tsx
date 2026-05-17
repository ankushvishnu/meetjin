import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PublishFlow } from "@/components/PublishFlow";

export const metadata: Metadata = {
  title: "Publish — List your app on the Jin Registry | meetjin",
  description:
    "Register as a publisher and submit your AIP-compliant intent map to the Jin Registry. Make your app discoverable by every AI agent.",
};

export default function PublishPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
              <span className="text-xs font-medium text-accent">For Developers</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Publish to the Registry
            </h1>
            <p className="mt-3 text-muted text-lg max-w-2xl mx-auto">
              Register as a publisher, point us to your <code className="px-1.5 py-0.5 rounded bg-white/[0.05] text-accent font-mono text-sm">jin.json</code>,
              and your app becomes discoverable by every AI agent.
            </p>
          </div>

          {/* Flow */}
          <div className="animate-fade-in-delay-1">
            <PublishFlow />
          </div>

          {/* CLI alternative */}
          <div className="mt-16 text-center animate-fade-in-delay-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted uppercase tracking-widest">prefer the terminal?</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="glass rounded-2xl p-8 border border-border inline-block text-left">
              <div className="text-sm text-muted mb-3">Install and publish in one command:</div>
              <div className="rounded-lg bg-background/60 border border-border px-5 py-3 font-mono text-sm text-accent">
                $ npx @meetjin/cli publish
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
