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

export const dynamic = 'force-dynamic';


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
          <RegistrySearch initialApps={apps} />
        </div>
      </main>
      <Footer />
    </>
  );
}
