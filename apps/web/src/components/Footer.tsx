import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Protocol</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="https://github.com/meetjin/jin" className="text-sm text-muted hover:text-foreground transition-colors">
                  AIP Specification
                </a>
              </li>
              <li>
                <Link href="/registry" className="text-sm text-muted hover:text-foreground transition-colors">
                  Registry
                </Link>
              </li>
              <li>
                <Link href="/build" className="text-sm text-muted hover:text-foreground transition-colors">
                  Playground
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Developers</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="https://www.npmjs.com/package/@meetjin/cli" className="text-sm text-muted hover:text-foreground transition-colors">
                  npm package
                </a>
              </li>
              <li>
                <Link href="/publish" className="text-sm text-muted hover:text-foreground transition-colors">
                  Publish
                </Link>
              </li>
              <li>
                <a href="https://github.com/meetjin/jin" className="text-sm text-muted hover:text-foreground transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Community</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="https://github.com/meetjin/jin/discussions" className="text-sm text-muted hover:text-foreground transition-colors">
                  Discussions
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <span className="text-sm text-muted">CC0 1.0 License</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 flex items-center justify-between">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Papercargo. Agent Intent Protocol v0.1
          </p>
          <p className="text-xs text-muted">
            meetjin.com
          </p>
        </div>
      </div>
    </footer>
  );
}
