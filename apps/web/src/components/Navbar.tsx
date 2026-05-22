import Link from "next/link";

export function Navbar() {
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

          {/* Navigation */}
          <div className="flex items-center gap-2">
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
        </div>
      </div>
    </nav>
  );
}
