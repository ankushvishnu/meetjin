"use client";

import { useState } from "react";
import Link from "next/link";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/assets/logos/logo_2.svg" 
              alt="Jin Logo" 
              className="h-12 w-auto transition-all group-hover:scale-110"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/registry"
              className="px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-muted hover:text-foreground transition-all"
            >
              Registry
            </Link>
            <Link
              href="/explore"
              className="px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-muted hover:text-foreground transition-all"
            >
              Explore
            </Link>
            <Link
              href="/build"
              className="px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-muted hover:text-foreground transition-all"
            >
              Build
            </Link>
            <Link
              href="/integrations"
              className="px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-muted hover:text-foreground transition-all"
            >
              Integrations
            </Link>
            <Link
              href="/spec"
              className="px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-muted hover:text-foreground transition-all"
            >
              Spec
            </Link>
            <div className="mx-2 h-4 w-px bg-border" />
            <Link
              href="/publish"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-muted"
            >
              Publish
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
          mobileOpen ? "max-h-80 border-t border-border" : "max-h-0"
        }`}
      >
        <div className="px-6 py-4 space-y-1 bg-background/95 backdrop-blur-xl">
          {[
            { href: "/registry", label: "Registry" },
            { href: "/explore", label: "Explore" },
            { href: "/build", label: "Build" },
            { href: "/integrations", label: "Integrations" },
            { href: "/spec", label: "Spec" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-3 text-sm font-medium uppercase tracking-widest text-muted hover:text-foreground transition-all rounded-lg hover:bg-white/[0.04]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              href="/publish"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center rounded-full bg-white px-5 py-3 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-muted"
            >
              Publish
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
