import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AIP Specification — Agent Intent Protocol | meetjin',
  description:
    'Read the Agent Intent Protocol specification. A lightweight, open standard that gives any web application a machine-readable intent layer.',
};

export default function SpecPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background text-foreground selection:bg-white selection:text-black">
      <div className="mx-auto max-w-4xl px-6 py-24 lg:px-8">
        
        {/* Hero Section */}
        <div className="mb-24">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase mb-6 leading-none">
            The Agent <br />
            <span className="text-muted">Intent Protocol</span>
          </h1>
          <p className="text-xl text-muted max-w-2xl leading-relaxed">
            A lightweight, open standard that gives any web application a machine-readable intent layer. 
            AIP is to agents what sitemaps are to search engines.
          </p>
        </div>

        {/* The Problem Section */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-muted">01</span>
            <h2 className="text-3xl font-bold uppercase tracking-tight">The Integration Gap</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-border bg-card rounded-2xl">
              <h3 className="text-lg font-bold mb-4 uppercase tracking-tight">No Intent Surface</h3>
              <p className="text-muted leading-relaxed">
                Agents are forced to scrape HTML and guess UI states. A simple action becomes a fragile sequence of simulated clicks.
              </p>
            </div>
            <div className="p-8 border border-border bg-card rounded-2xl">
              <h3 className="text-lg font-bold mb-4 uppercase tracking-tight">Discovery Void</h3>
              <p className="text-muted leading-relaxed">
                APIs exist, but there is no standard way for an agent to discover what they do or how to authenticate without custom engineering.
              </p>
            </div>
            <div className="p-8 border border-border bg-card rounded-2xl">
              <h3 className="text-lg font-bold mb-4 uppercase tracking-tight">Trust Deficit</h3>
              <p className="text-muted leading-relaxed">
                Agents have no way to verify if an endpoint is legitimate or safe, making every integration a leap of faith.
              </p>
            </div>
          </div>
        </section>

        {/* The Solution Section */}
        <section className="mb-32">
          <div className="flex items-baseline gap-4 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-muted">02</span>
            <h2 className="text-3xl font-bold uppercase tracking-tight">How Jin Works</h2>
          </div>

          <div className="space-y-12">
            <div className="group relative p-8 border border-border bg-card rounded-3xl transition-all hover:border-white/20">
              <div className="flex flex-col md:flex-row gap-12">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">1. Automated Discovery</h3>
                  <p className="text-muted leading-relaxed mb-6">
                    The <code className="bg-white/10 px-2 py-1 rounded text-white">@meetjin/cli</code> scans your codebase, detecting Next.js, Express, and OpenAPI specs to extract your app's intent surface.
                  </p>
                  <div className="font-mono text-xs p-4 bg-black border border-border rounded-lg text-muted">
                    $ npx jin init <br />
                    <span className="text-white">✓ Found 12 routes</span><br />
                    <span className="text-white">✓ Generated jin.json</span>
                  </div>
                </div>
                <div className="flex-1 bg-black border border-border rounded-2xl p-6 font-mono text-xs text-muted overflow-hidden">
                  <div className="flex gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-[#16c88d]" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <pre>
                    {`{
  "aip_version": "0.1",
  "app": { "name": "Spotter" },
  "intents": [
    {
      "id": "book_trainer",
      "method": "POST",
      "endpoint": "/api/v1/bookings"
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="group relative p-8 border border-border bg-card rounded-3xl transition-all hover:border-white/20">
              <div className="flex flex-col md:flex-row gap-12">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">2. The Intent Map</h3>
                  <p className="text-muted leading-relaxed mb-6">
                    Your app serves a <code className="bg-white/10 px-2 py-1 rounded text-white">jin.json</code> at <code className="bg-white/10 px-2 py-1 rounded text-white">/.well-known/jin.json</code>. This is the source of truth for any agent.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-muted">
                      <div className="w-1 h-1 rounded-full bg-white" />
                      <span>Natural language triggers for matching</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted">
                      <div className="w-1 h-1 rounded-full bg-white" />
                      <span>Strict parameter schemas</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted">
                      <div className="w-1 h-1 rounded-full bg-white" />
                      <span>Safety flags (destructive/confirmation)</span>
                    </li>
                  </ul>
                </div>
                <div className="flex-1 bg-black border border-border rounded-2xl p-6 font-mono text-xs text-muted overflow-hidden">
                  <div className="flex gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-[#16c88d]" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <pre>
                    {`"intents": [
  {
    "id": "cancel_booking",
    "triggers": ["cancel my session"],
    "destructive": true,
    "confirmation_required": true
  }
]`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Collaboration Section */}
        <section className="mb-24">
          <div className="flex items-baseline gap-4 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-muted">03</span>
            <h2 className="text-3xl font-bold uppercase tracking-tight">Collaborate</h2>
          </div>
          
          <div className="p-12 border border-border bg-white text-black rounded-3xl text-center">
            <h3 className="text-4xl font-black uppercase tracking-tighter mb-6">
              Build the Legible Web
            </h3>
            <p className="text-lg mb-10 max-w-xl mx-auto opacity-80">
              Jin is an open-source project and a public-domain protocol. Help us build the infrastructure for the agentic era.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="https://github.com/meetjin/jin" 
                target="_blank" 
                className="px-8 py-4 bg-black text-white font-bold uppercase tracking-widest text-xs rounded-full hover:bg-muted transition-all"
              >
                GitHub Repository
              </Link>
              <Link 
                href="/build" 
                className="px-8 py-4 border border-black text-black font-bold uppercase tracking-widest text-xs rounded-full hover:bg-black hover:text-white transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>

      </div>
      </main>
      <Footer />
    </>
  );
}
