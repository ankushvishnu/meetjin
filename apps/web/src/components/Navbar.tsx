"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"developers" | "webmasters" | null>(null);
  
  const [mobileDevOpen, setMobileDevOpen] = useState(false);
  const [mobileWebmasterOpen, setMobileWebmasterOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = (menu: "developers" | "webmasters") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150); // slight delay to prevent flickering when moving between trigger and panel
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/[0.06]" ref={containerRef}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/assets/logos/logo_2.svg" 
              alt="Jin Logo" 
              className="h-12 w-auto transition-all group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Menu 1: For Developers */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter("developers")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setActiveDropdown(activeDropdown === "developers" ? null : "developers")}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium uppercase tracking-widest transition-all cursor-pointer ${
                  activeDropdown === "developers" ? "text-foreground" : "text-muted hover:text-foreground"
                }`}
                aria-expanded={activeDropdown === "developers"}
              >
                For Developers
                <svg 
                  className={`h-3 w-3 transition-transform duration-300 ${activeDropdown === "developers" ? "rotate-180" : ""}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Developers Dropdown Panel */}
              <div 
                className={`absolute left-0 mt-2 w-96 rounded-2xl border border-white/[0.08] bg-card p-5 shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-200 origin-top-left ${
                  activeDropdown === "developers" 
                    ? "opacity-100 scale-100 translate-y-0 visible" 
                    : "opacity-0 scale-95 -translate-y-1 invisible pointer-events-none"
                }`}
              >
                <div className="mb-4 pb-3 border-b border-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Developer Platform</p>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    Stop writing brittle scrapers. Navigate the web deterministically.
                  </p>
                </div>
                <div className="space-y-4">
                  <Link 
                    href="/explore" 
                    onClick={() => setActiveDropdown(null)}
                    className="flex gap-3 rounded-xl p-2.5 transition-all hover:bg-white/[0.04] group/item"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/[0.06] text-foreground transition-all group-hover/item:border-white/20 group-hover/item:bg-white/10">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider group-hover/item:text-white transition-colors">Explore</p>
                      <p className="text-[11px] text-muted mt-0.5">Browse the registry of 20+ live agentic APIs.</p>
                    </div>
                  </Link>
                  <Link 
                    href="/build" 
                    onClick={() => setActiveDropdown(null)}
                    className="flex gap-3 rounded-xl p-2.5 transition-all hover:bg-white/[0.04] group/item"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/[0.06] text-foreground transition-all group-hover/item:border-white/20 group-hover/item:bg-white/10">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider group-hover/item:text-white transition-colors">Build</p>
                      <p className="text-[11px] text-muted mt-0.5">Documentation for wrapping agents with Jin Identity.</p>
                    </div>
                  </Link>
                  <Link 
                    href="/integrations" 
                    onClick={() => setActiveDropdown(null)}
                    className="flex gap-3 rounded-xl p-2.5 transition-all hover:bg-white/[0.04] group/item"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/[0.06] text-foreground transition-all group-hover/item:border-white/20 group-hover/item:bg-white/10">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider group-hover/item:text-white transition-colors">Integrations</p>
                      <p className="text-[11px] text-muted mt-0.5">Drop-in code snippets for Axios, Python httpx, LangGraph, and CrewAI.</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Menu 2: For Webmasters */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter("webmasters")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setActiveDropdown(activeDropdown === "webmasters" ? null : "webmasters")}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium uppercase tracking-widest transition-all cursor-pointer ${
                  activeDropdown === "webmasters" ? "text-foreground" : "text-muted hover:text-foreground"
                }`}
                aria-expanded={activeDropdown === "webmasters"}
              >
                For Webmasters
                <svg 
                  className={`h-3 w-3 transition-transform duration-300 ${activeDropdown === "webmasters" ? "rotate-180" : ""}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Webmasters Dropdown Panel */}
              <div 
                className={`absolute left-0 mt-2 w-96 rounded-2xl border border-white/[0.08] bg-card p-5 shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-200 origin-top-left ${
                  activeDropdown === "webmasters" 
                    ? "opacity-100 scale-100 translate-y-0 visible" 
                    : "opacity-0 scale-95 -translate-y-1 invisible pointer-events-none"
                }`}
              >
                <div className="mb-4 pb-3 border-b border-white/[0.04]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Webmaster Sovereignty</p>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    Take back your traffic. Control what AI agents see and monetize your data.
                  </p>
                </div>
                <div className="space-y-4">
                  <Link 
                    href="/shield" 
                    onClick={() => setActiveDropdown(null)}
                    className="flex gap-3 rounded-xl p-2.5 transition-all hover:bg-white/[0.04] group/item"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/[0.06] text-foreground transition-all group-hover/item:border-white/20 group-hover/item:bg-white/10">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider group-hover/item:text-white transition-colors flex items-center gap-2">
                        Jin Shield 
                        <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full lowercase tracking-normal normal-case">v0.2.2</span>
                      </p>
                      <p className="text-[11px] text-muted mt-0.5">Zero-latency cryptographic perimeter security to block rogue scrapers.</p>
                    </div>
                  </Link>
                  <Link 
                    href="/build" 
                    onClick={() => setActiveDropdown(null)}
                    className="flex gap-3 rounded-xl p-2.5 transition-all hover:bg-white/[0.04] group/item"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/[0.06] text-foreground transition-all group-hover/item:border-white/20 group-hover/item:bg-white/10">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider group-hover/item:text-white transition-colors">The Intent Map</p>
                      <p className="text-[11px] text-muted mt-0.5">Generate your jin.json and declare your capabilities.</p>
                    </div>
                  </Link>
                  <div className="flex gap-3 rounded-xl p-2.5 opacity-40 cursor-not-allowed select-none">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/[0.06] text-muted">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.214.129a3.393 3.393 0 003.456 0a3.393 3.393 0 00.215-3.338a3.393 3.393 0 00-3.456 0a3.393 3.393 0 00-.214 3.338L12 16.5m0-10.5a3.393 3.393 0 113.393 3.393H12V6z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                        Monetization 
                        <span className="text-[9px] bg-white/10 text-white/60 border border-white/10 px-1.5 py-0.5 rounded-full lowercase tracking-normal">Upcoming</span>
                      </p>
                      <p className="text-[11px] text-muted/80 mt-0.5">The Layer 4 micro-transaction clearinghouse.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/spec"
              className="px-3 py-2 text-xs font-medium uppercase tracking-widest text-muted hover:text-foreground transition-all"
            >
              Spec
            </Link>
            <a
              href="https://github.com/meetjin/jin"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs font-medium uppercase tracking-widest text-muted hover:text-foreground transition-all"
            >
              GitHub
            </a>
            
            <div className="mx-2 h-4 w-px bg-border" />
            <Link
              href="/publish"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-muted"
            >
              Publish your App
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col items-center justify-center gap-1.5 w-10 h-10 rounded-lg border border-border bg-card transition-all hover:bg-card-hover"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={`block h-0.5 w-5 bg-foreground transition-all duration-200 ${
                mobileOpen ? "translate-y-[4px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-foreground transition-all duration-200 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-foreground transition-all duration-200 ${
                mobileOpen ? "-translate-y-[4px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-[80vh] overflow-y-auto border-t border-border" : "max-h-0"
        }`}
      >
        <div className="px-6 py-6 space-y-6 bg-background/95 backdrop-blur-xl">
          
          {/* Mobile Section 1: Developers */}
          <div>
            <button
              onClick={() => setMobileDevOpen(!mobileDevOpen)}
              className="flex w-full items-center justify-between py-2 text-sm font-bold uppercase tracking-wider text-foreground"
            >
              <span>For Developers</span>
              <svg 
                className={`h-4 w-4 text-muted transition-transform duration-200 ${mobileDevOpen ? "rotate-180" : ""}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <div className={`mt-2 pl-3 space-y-3 border-l border-white/[0.06] transition-all overflow-hidden ${mobileDevOpen ? "max-h-60" : "max-h-0 opacity-0"}`}>
              <Link
                href="/explore"
                onClick={() => { setMobileOpen(false); setMobileDevOpen(false); }}
                className="block py-1 text-xs text-muted hover:text-foreground"
              >
                Explore <span className="text-[10px] text-white/40 block mt-0.5 font-normal tracking-normal uppercase">Browse 20+ live agentic APIs</span>
              </Link>
              <Link
                href="/build"
                onClick={() => { setMobileOpen(false); setMobileDevOpen(false); }}
                className="block py-1 text-xs text-muted hover:text-foreground"
              >
                Build <span className="text-[10px] text-white/40 block mt-0.5 font-normal tracking-normal uppercase">Wrap agents with Jin Identity</span>
              </Link>
              <Link
                href="/integrations"
                onClick={() => { setMobileOpen(false); setMobileDevOpen(false); }}
                className="block py-1 text-xs text-muted hover:text-foreground"
              >
                Integrations <span className="text-[10px] text-white/40 block mt-0.5 font-normal tracking-normal uppercase">Drop-in code snippets</span>
              </Link>
            </div>
          </div>

          {/* Mobile Section 2: Webmasters */}
          <div>
            <button
              onClick={() => setMobileWebmasterOpen(!mobileWebmasterOpen)}
              className="flex w-full items-center justify-between py-2 text-sm font-bold uppercase tracking-wider text-foreground"
            >
              <span>For Webmasters</span>
              <svg 
                className={`h-4 w-4 text-muted transition-transform duration-200 ${mobileWebmasterOpen ? "rotate-180" : ""}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <div className={`mt-2 pl-3 space-y-3 border-l border-white/[0.06] transition-all overflow-hidden ${mobileWebmasterOpen ? "max-h-60" : "max-h-0 opacity-0"}`}>
              <Link
                href="/shield"
                onClick={() => { setMobileOpen(false); setMobileWebmasterOpen(false); }}
                className="block py-1 text-xs text-muted hover:text-foreground"
              >
                Jin Shield <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1 py-0.2 rounded border border-emerald-500/10 inline-block ml-1">v0.2.2</span>
                <span className="text-[10px] text-white/40 block mt-0.5 font-normal tracking-normal uppercase">Zero-latency security perimeter</span>
              </Link>
              <Link
                href="/build"
                onClick={() => { setMobileOpen(false); setMobileWebmasterOpen(false); }}
                className="block py-1 text-xs text-muted hover:text-foreground"
              >
                The Intent Map <span className="text-[10px] text-white/40 block mt-0.5 font-normal tracking-normal uppercase">Generate jin.json map</span>
              </Link>
              <div className="py-1 text-xs text-muted/40 cursor-not-allowed select-none">
                Monetization <span className="text-[8px] bg-white/5 text-white/40 px-1 py-0.2 rounded inline-block ml-1">Upcoming</span>
                <span className="text-[10px] text-white/20 block mt-0.5 font-normal tracking-normal uppercase">Layer 4 micro-transactions</span>
              </div>
            </div>
          </div>

          {/* Standard links */}
          <div className="space-y-4 pt-2 border-t border-white/[0.06]">
            <Link
              href="/spec"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium uppercase tracking-widest text-muted hover:text-foreground transition-all"
            >
              Spec
            </Link>
            <a
              href="https://github.com/meetjin/jin"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium uppercase tracking-widest text-muted hover:text-foreground transition-all"
            >
              GitHub
            </a>
          </div>

          {/* Primary CTA */}
          <div className="pt-4 border-t border-white/[0.06]">
            <Link
              href="/publish"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center rounded-full bg-white px-5 py-3 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-muted"
            >
              Publish your App
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
