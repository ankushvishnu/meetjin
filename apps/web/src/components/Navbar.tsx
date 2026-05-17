import Link from "next/link";

export function Navbar() {
  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 border border-accent/20 transition-all group-hover:bg-accent/20 group-hover:border-accent/30">
              <span className="text-accent font-bold text-sm">J</span>
            </div>
            <span className="font-semibold text-lg tracking-tight text-foreground">
              meetjin
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Link
              href="/registry"
              className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors rounded-lg hover:bg-white/[0.04]"
            >
              Registry
            </Link>
            <Link
              href="/build"
              className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors rounded-lg hover:bg-white/[0.04]"
            >
              Build
            </Link>
            <a
              href="https://github.com/meetjin/jin"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors rounded-lg hover:bg-white/[0.04]"
            >
              Spec
            </a>
            <div className="ml-2 h-5 w-px bg-border" />
            <Link
              href="/publish"
              className="ml-2 inline-flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 px-4 py-2 text-sm font-medium text-accent transition-all hover:bg-accent/20 hover:border-accent/30"
            >
              Publish
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
