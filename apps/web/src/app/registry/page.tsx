import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RegistrySearch } from "@/components/RegistrySearch";
import { supabaseAdmin } from "@/lib/supabase";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registry — Discover Agent-Ready Apps | meetjin",
  description:
    "Browse the Jin Registry to discover applications with AIP-compliant intent maps. Find agent-enabled tools, services, and APIs.",
};

async function getApps() {
  try {
    const { data, error } = await supabaseAdmin
      .from('apps')
      .select('id, name, slug, description, url, logo_url, categories, total_intents, agent_hits, is_verified, is_community')
      .eq('is_active', true)
      .order('agent_hits', { ascending: false });

    if (error) {
      console.error('Failed to fetch apps from Supabase:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching apps:', err);
    return [];
  }
}

export default async function RegistryPage() {
  const apps = await getApps();

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Intent Registry
              </h1>
              <p className="mt-2 text-muted text-lg">
                Discover agent-enabled applications and their capabilities.
              </p>
            </div>

            <RegistrySearch initialApps={apps} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
