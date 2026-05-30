"use client";

import { useState } from "react";

const FRAMEWORKS = [
  {
    id: "express",
    name: "Express (Node.js)",
    lang: "javascript",
    code: `const express = require('express');
const { jinShield } = require('@papercargo/jin-shield-express');

const app = express();

// Activate the trust perimeter boundary
app.use(jinShield({
  jwksUri: 'https://meetjin.com/.well-known/jwks.json',
  ruleFallback: 'block' // short-circuits scrapers with 403 Forbidden
}));

app.post('/api/v1/secure-fetch', (req, res) => {
  res.json({ 
    status: 'success', 
    data: 'Verified Express payload accessed in 12ms!' 
  });
});`
  },
  {
    id: "fastapi",
    name: "FastAPI (Python)",
    lang: "python",
    code: `from fastapi import FastAPI, Depends
from jin_shield_fastapi import JinShield, verified_intent

app = FastAPI()

# Zero-latency asymmetric public key validation
shield = JinShield(
    jwks_uri="https://meetjin.com/.well-known/jwks.json",
    fallback_policy="block"
)

@app.post("/api/v1/secure-fetch")
async def secure_endpoint(
    agent = Depends(verified_intent("fetch_secure_data"))
):
    return {
        "status": "success", 
        "data": "Verified FastAPI payload accessed in 12ms!"
    }`
  },
  {
    id: "nextjs",
    name: "Next.js (App Router)",
    lang: "typescript",
    code: `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJinPassport } from '@papercargo/jin-shield-next';

export async function middleware(request: NextRequest) {
  // In-memory zero-hop RS256 signature verification
  const isVerified = await verifyJinPassport(request, {
    intentId: "fetch_secure_data",
    fallbackPolicy: "block"
  });
  
  if (!isVerified) {
    return new NextResponse('Read jin.json or leave.', { status: 403 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/api/v1/secure-fetch',
};`
  },
  {
    id: "hono",
    name: "Hono (Edge/TS)",
    lang: "typescript",
    code: `import { Hono } from 'hono';
import { jinShield } from '@papercargo/jin-shield-hono';

const app = new Hono();

// Edge-native asymmetric JWT validator
app.use('/api/*', jinShield({
  jwksUri: 'https://meetjin.com/.well-known/jwks.json',
  ruleFallback: 'block'
}));

app.post('/api/v1/secure-fetch', (c) => {
  return c.json({ 
    status: 'success', 
    data: 'Verified Hono edge payload accessed in 12ms!' 
  });
});`
  }
];

export function FrameworkTabs() {
  const [activeTab, setActiveTab] = useState("express");

  const currentFramework = FRAMEWORKS.find((fw) => fw.id === activeTab) || FRAMEWORKS[0];

  return (
    <div className="rounded-[2rem] border border-border bg-card/60 p-6 backdrop-blur-xl">
      {/* Tab Selectors */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/[0.04] pb-4">
        {FRAMEWORKS.map((fw) => (
          <button
            key={fw.id}
            onClick={() => setActiveTab(fw.id)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === fw.id
                ? "bg-white text-black font-extrabold shadow-lg shadow-white/5"
                : "text-muted hover:text-foreground hover:bg-white/5"
            }`}
          >
            {fw.name}
          </button>
        ))}
      </div>

      {/* Code Display Screen */}
      <div className="relative rounded-xl border border-white/[0.06] bg-black/80 p-5 font-mono text-xs text-foreground shadow-2xl overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 mb-4 border-b border-white/[0.04] pb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/40" />
          <span className="ml-auto text-[10px] text-white/30 uppercase tracking-widest">
            {currentFramework.id}.{currentFramework.lang === "python" ? "py" : "ts"}
          </span>
        </div>

        {/* Code Content */}
        <pre className="overflow-x-auto whitespace-pre leading-6 text-white/90 text-[11px] sm:text-xs">
          <code>{currentFramework.code}</code>
        </pre>
      </div>
    </div>
  );
}
