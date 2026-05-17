import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { IntentBuilder } from "@/components/IntentBuilder";
import { IntentTester } from "@/components/IntentTester";

export const metadata: Metadata = {
  title: "Build — AIP Playground | meetjin",
  description:
    "Visually build, validate, and test AIP intent maps. Generate jin.json files for your application without writing a line of JSON.",
};

export default function BuildPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
              <span className="text-xs font-medium text-accent">Playground</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Build your intent map
            </h1>
            <p className="mt-3 text-muted text-lg max-w-2xl">
              Use the visual builder to create a valid <code className="px-1.5 py-0.5 rounded bg-white/[0.05] text-accent font-mono text-sm">jin.json</code>,
              or test a live intent map from any domain.
            </p>
          </div>

          {/* Tester */}
          <div className="mb-12 animate-fade-in-delay-1">
            <IntentTester />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-12">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted uppercase tracking-widest">or build from scratch</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Builder */}
          <div className="animate-fade-in-delay-2">
            <IntentBuilder />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
