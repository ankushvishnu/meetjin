import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";

async function getAppDetails(slug: string) {
  try {
    // Fetch app
    const { data: app, error: appError } = await supabaseAdmin
      .from('apps')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (appError || !app) {
      return null;
    }

    // Fetch intents for this app
    const { data: intents, error: intentsError } = await supabaseAdmin
      .from('intents')
      .select('*')
      .eq('app_id', app.id);

    if (intentsError) {
      console.error('Failed to fetch intents:', intentsError);
    }

    return {
      ...app,
      intents: intents || []
    };
  } catch (err) {
    console.error('Error fetching app details:', err);
    return null;
  }
}

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = await getAppDetails(slug);

  if (!app) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">App not found</h1>
            <p className="text-muted mt-2">The requested application does not exist in the registry.</p>
            <Link href="/registry" className="text-accent mt-4 inline-block hover:underline">
              &larr; Back to Registry
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/30">
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
            <Link href="/registry" className="text-sm text-accent hover:underline mb-4 inline-block">
              &larr; Back to Registry
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-accent/10 flex items-center justify-center text-accent text-2xl font-bold">
                  {app.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-foreground">{app.name}</h1>
                    {app.is_verified && (
                      <span className="text-success" title="Verified Publisher">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-muted mt-1">{app.url}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
                  <div className="text-xs text-muted">Agent Hits</div>
                  <div className="text-lg font-semibold text-foreground">{app.agent_hits}</div>
                </div>
                <div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
                  <div className="text-xs text-muted">Intents</div>
                  <div className="text-lg font-semibold text-foreground">{app.intents.length}</div>
                </div>
                <div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
                  <div className="text-xs text-muted">AIP Version</div>
                  <div className="text-lg font-semibold text-foreground">{app.aip_version}</div>
                </div>
              </div>
            </div>
            
            <p className="text-muted mt-6 max-w-3xl">{app.description}</p>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {app.categories && app.categories.map((cat: string) => (
                <span key={cat} className="text-xs px-3 py-1 rounded-md bg-white/[0.03] text-foreground border border-border">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Intents List */}
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Available Intents</h2>
          
          {app.intents.length === 0 ? (
            <p className="text-muted">No intents listed for this app.</p>
          ) : (
            <div className="space-y-6">
              {app.intents.map((intent: any) => (
                <div key={intent.id} className="glass rounded-xl p-6 border border-border">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">{intent.name}</h3>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.05] text-muted border border-border">
                          {intent.intent_id}
                        </span>
                      </div>
                      <p className="text-sm text-muted mt-1">{intent.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
                        intent.method === 'GET' ? 'bg-success/10 text-success border border-success/20' :
                        intent.method === 'POST' ? 'bg-accent/10 text-accent border border-accent/20' :
                        'bg-warning/10 text-warning border border-warning/20'
                      }`}>
                        {intent.method}
                      </span>
                      <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-card border border-border text-foreground">
                        {intent.endpoint}
                      </span>
                    </div>
                  </div>

                  {/* Triggers */}
                  {intent.triggers && intent.triggers.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-muted mb-2 font-medium uppercase tracking-wider">Natural Language Triggers</div>
                      <div className="flex flex-wrap gap-2">
                        {intent.triggers.map((trigger: string, idx: number) => (
                          <span key={idx} className="text-sm px-3 py-1.5 rounded-lg bg-card text-foreground border border-border flex items-center gap-1.5">
                            <span className="text-muted">&ldquo;</span>
                            {trigger}
                            <span className="text-muted">&rdquo;</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
                    {intent.requires_auth && (
                      <span className="text-xs px-2 py-1 rounded bg-warning/10 text-warning border border-warning/20 flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m3.5-6a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
                        </svg>
                        Requires Auth
                      </span>
                    )}
                    {intent.destructive && (
                      <span className="text-xs px-2 py-1 rounded bg-danger/10 text-danger border border-danger/20 flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Destructive
                      </span>
                    )}
                    {intent.confirmation_required && (
                      <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Requires Confirmation
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
