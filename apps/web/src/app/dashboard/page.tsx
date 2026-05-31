"use client";

import { useState, useEffect } from "react";
import { supabasePublic } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

type Role = "agent_builder" | "webmaster";

interface UserProfile {
  id: string;
  email: string;
  user_type: Role;
  created_at: string;
}

interface JinKey {
  id: string;
  key_string: string;
  status: "active" | "revoked";
  created_at: string;
}

interface Shield {
  id: string;
  domain: string;
  status: "online" | "offline";
  last_ping: string;
  created_at: string;
}

export default function DashboardPortal() {
  // Session & User Profile State
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Authentication State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("agent_builder");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Agent Builder Dashboard State
  const [keys, setKeys] = useState<JinKey[]>([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keyError, setKeyError] = useState("");

  // Webmaster Dashboard State
  const [shields, setShields] = useState<Shield[]>([]);
  const [shieldsLoading, setShieldsLoading] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [shieldError, setShieldError] = useState("");
  const [copiedText, setCopiedText] = useState(false);

  // 1. Synchronize Auth Session on Mount
  useEffect(() => {
    supabasePublic.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabasePublic.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setAuthLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch Profile from Custom Users Table
  const fetchProfile = async (userId: string) => {
    try {
      setAuthLoading(true);
      const { data, error } = await supabasePublic
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data as UserProfile);
        if (data.user_type === "agent_builder") {
          fetchKeys(userId);
        } else {
          fetchShields(userId);
        }
      } else {
        // If trigger has a slight race delay, retry after 1 second
        setTimeout(() => fetchProfile(userId), 1000);
      }
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      setAuthError("Failed to synchronize user workspace profile.");
    } finally {
      setAuthLoading(false);
    }
  };

  // 3. Fetch Developer API Keys
  const fetchKeys = async (userId: string) => {
    try {
      setKeysLoading(true);
      const { data, error } = await supabasePublic
        .from("jin_keys")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setKeys(data || []);
    } catch (err: any) {
      console.error("Error fetching API keys:", err);
      setKeyError("Could not retrieve key registry.");
    } finally {
      setKeysLoading(false);
    }
  };

  // 4. Fetch Webmaster Shield Instances
  const fetchShields = async (userId: string) => {
    try {
      setShieldsLoading(true);
      const { data, error } = await supabasePublic
        .from("shields")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setShields(data || []);
    } catch (err: any) {
      console.error("Error fetching shields:", err);
      setShieldError("Could not retrieve shield perimeters.");
    } finally {
      setShieldsLoading(false);
    }
  };

  // 5. Handle Authentication (Email & Password Sign In / Sign Up)
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    if (!email.trim() || !password.trim()) {
      setAuthError("Please fill out all credentials fields.");
      setAuthLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data, error } = await supabasePublic.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_type: selectedRole,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          setAuthSuccess("Registration successful! Synchronizing workspace...");
          fetchProfile(data.user.id);
        }
      } else {
        // Sign In Flow
        const { error } = await supabasePublic.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication attempt failed.");
      setAuthLoading(false);
    }
  };

  // 6. Handle Sign Out
  const handleSignOut = async () => {
    await supabasePublic.auth.signOut();
    setSession(null);
    setProfile(null);
    setKeys([]);
    setShields([]);
    setGeneratedKey(null);
  };

  // 7. Generate a new "jin_live_" API Key
  const generateNewKey = async () => {
    if (!profile) return;
    setKeysLoading(true);
    setKeyError("");
    setGeneratedKey(null);

    try {
      // Cryptographically secure token string generation
      const bytes = new Uint8Array(20);
      window.crypto.getRandomValues(bytes);
      const hexKey = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const keyString = `jin_live_${hexKey}`;

      const { data, error } = await supabasePublic
        .from("jin_keys")
        .insert({
          user_id: profile.id,
          key_string: keyString,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;

      setGeneratedKey(keyString);
      setKeys((prev) => [data as JinKey, ...prev]);
    } catch (err: any) {
      setKeyError(err.message || "Failed to generate a new live token.");
    } finally {
      setKeysLoading(false);
    }
  };

  // 8. Revoke an API Key
  const revokeKey = async (keyId: string) => {
    setKeyError("");
    try {
      const { error } = await supabasePublic
        .from("jin_keys")
        .update({ status: "revoked" })
        .eq("id", keyId);

      if (error) throw error;

      setKeys((prev) =>
        prev.map((k) => (k.id === keyId ? { ...k, status: "revoked" } : k))
      );
    } catch (err: any) {
      setKeyError(err.message || "Failed to revoke token.");
    }
  };

  // 9. Add domain shield instance
  const addShieldDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newDomain.trim()) return;
    setShieldError("");

    // Domain validation regex
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(newDomain.trim())) {
      setShieldError("Please specify a valid domain name (e.g. blog.mysite.com).");
      return;
    }

    try {
      const { data, error } = await supabasePublic
        .from("shields")
        .insert({
          user_id: profile.id,
          domain: newDomain.trim().toLowerCase(),
          status: "online",
          last_ping: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setShields((prev) => [data as Shield, ...prev]);
      setNewDomain("");
    } catch (err: any) {
      setShieldError(err.message || "Failed to link shield perimeter.");
    }
  };

  // 10. Copy CLI block to clipboard
  const copyCliCode = () => {
    navigator.clipboard.writeText("npx @papercargo/jin-cli shield");
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background py-16 px-6 lg:px-8 bg-grid">
        <div className="mx-auto max-w-7xl">
          
          {/* A. AUTHENTICATION PANEL (IF NOT LOGGED IN) */}
          {!session && (
            <div className="max-w-md mx-auto my-12 animate-fade-in">
              
              {/* Monochromatic Branding Logo Accent */}
              <div className="text-center mb-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white mb-4 glow-accent">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-gradient">
                  Jin Portal & Identity
                </h1>
                <p className="mt-2 text-sm text-muted">
                  Securing client capabilities across the agentic web.
                </p>
              </div>

              {/* Glassmorphic Form Card */}
              <div className="glass rounded-[2rem] p-8 border border-white/[0.08] relative overflow-hidden">
                
                {/* Subtle monochromatic glows */}
                <div className="absolute -top-32 -right-32 h-64 w-64 bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 h-64 w-64 bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />

                {/* Tab selectors */}
                <div className="flex border-b border-white/[0.06] mb-8 gap-4">
                  <button
                    onClick={() => { setIsSignUp(false); setAuthError(""); setAuthSuccess(""); }}
                    className={`pb-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer ${
                      !isSignUp ? "text-white border-white" : "text-muted hover:text-foreground border-transparent"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setIsSignUp(true); setAuthError(""); setAuthSuccess(""); }}
                    className={`pb-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer ${
                      isSignUp ? "text-white border-white" : "text-muted hover:text-foreground border-transparent"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {authError && (
                  <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
                    {authError}
                  </div>
                )}

                {authSuccess && (
                  <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-emerald-400">
                    {authSuccess}
                  </div>
                )}

                <form onSubmit={handleAuth} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/[0.08] text-foreground text-sm focus:border-accent focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/[0.08] text-foreground text-sm focus:border-accent focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  {/* Role selection only on SignUp */}
                  {isSignUp && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Choose Your Role</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setSelectedRole("agent_builder")}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all cursor-pointer ${
                            selectedRole === "agent_builder"
                              ? "bg-white/5 border-white text-white"
                              : "bg-black/40 border-white/[0.06] text-muted hover:text-foreground hover:border-white/10"
                          }`}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          <span className="text-xs font-bold uppercase tracking-wider">Agent Builder</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedRole("webmaster")}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all cursor-pointer ${
                            selectedRole === "webmaster"
                              ? "bg-white/5 border-white text-white"
                              : "bg-black/40 border-white/[0.06] text-muted hover:text-foreground hover:border-white/10"
                          }`}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="text-xs font-bold uppercase tracking-wider">Webmaster</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full rounded-xl bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-white/90 hover:shadow-lg hover:shadow-white/[0.05] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {authLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Authenticating...
                      </>
                    ) : isSignUp ? (
                      "Sign Up & Create Workspace"
                    ) : (
                      "Sign In to Workspace"
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* B. PROFILE SYNCHRONIZATION LOADER (IF LOGGED IN BUT FETCHING PROFILE) */}
          {session && !profile && (
            <div className="flex flex-col items-center justify-center my-32 space-y-4 animate-pulse">
              <svg className="animate-spin h-10 w-10 text-foreground" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-xs font-bold uppercase tracking-widest text-muted">Synchronizing Vault Workspace Profile...</p>
            </div>
          )}

          {/* C. ACTIVE DUAL-SIDED DASHBOARDS */}
          {session && profile && (
            <div className="space-y-12 animate-fade-in">
              
              {/* Profile Bar Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/[0.06]">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-white/5 text-foreground border border-white/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                      {profile.user_type === "agent_builder" ? "Agent Builder Mode" : "Webmaster Mode"}
                    </span>
                    <span className="text-xs text-muted font-mono">{profile.email}</span>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground mt-2">
                    {profile.user_type === "agent_builder" ? "Cryptographic Credential Console" : "Domain Shield Authority"}
                  </h1>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="px-5 py-2.5 rounded-xl border border-white/[0.08] hover:bg-white/[0.04] text-xs font-bold uppercase tracking-widest text-muted hover:text-foreground transition-all cursor-pointer self-start md:self-auto"
                >
                  Disconnect Profile
                </button>
              </div>

              {/* ─────────────────────────────────── */}
              {/* 1. AGENT BUILDER WORKSPACE         */}
              {/* ─────────────────────────────────── */}
              {profile.user_type === "agent_builder" && (
                <div className="grid gap-8 lg:grid-cols-3">
                  
                  {/* Left Column: API Key Generation Controls */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="glass rounded-[2rem] p-8 border border-white/[0.08] relative overflow-hidden">
                      <div className="absolute -top-32 -left-32 h-64 w-64 bg-white/[0.02] rounded-full blur-[80px]" />
                      <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2.5">
                        <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Issue Token
                      </h2>
                      <p className="text-xs text-muted leading-relaxed mb-6">
                        Mint a raw `jin_live_` API key. Connect this key to external intent verifiers to authorize decentralized RS256 JWT minting.
                      </p>

                      {keyError && (
                        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
                          {keyError}
                        </div>
                      )}

                      <button
                        onClick={generateNewKey}
                        disabled={keysLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-white/90 hover:shadow-lg hover:shadow-white/[0.05] cursor-pointer"
                      >
                        {keysLoading ? "Generating..." : "Generate Live Key"}
                      </button>

                      {/* Display newly generated key prominently for copying */}
                      {generatedKey && (
                        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 space-y-3 animate-fade-in">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-foreground block">Copy Newly Generated Key:</span>
                          <div className="flex items-center justify-between gap-2 bg-black/60 border border-white/[0.08] rounded-lg px-3 py-2">
                            <span className="text-xs font-mono text-foreground break-all select-all">{generatedKey}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(generatedKey);
                                setCopiedText(true);
                                setTimeout(() => setCopiedText(false), 1500);
                              }}
                              className="text-muted hover:text-white transition-colors p-1"
                              title="Copy Key"
                            >
                              {copiedText ? (
                                <span className="text-[10px] font-bold text-foreground">Copied!</span>
                              ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-muted leading-tight block">⚠️ Note: Keep this key confidential. We cannot show it again once this window session ends.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Columns: Existing Tokens Log */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="glass rounded-[2rem] p-8 border border-white/[0.08]">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                          <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Key Registry
                        </h2>
                        <span className="text-xs text-muted">{keys.length} Key{keys.length !== 1 && "s"}</span>
                      </div>

                      {keysLoading && keys.length === 0 ? (
                        <div className="text-center py-12 text-xs text-muted">Retrieving cryptographic tokens...</div>
                      ) : keys.length === 0 ? (
                        <div className="text-center py-12 rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.01]">
                          <svg className="mx-auto h-8 w-8 text-muted/60 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">No API keys registered</p>
                          <p className="text-xs text-muted/80 max-w-sm mx-auto">Generate your first cryptographic live key to begin signing intent JWTs.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {keys.map((key) => (
                            <div
                              key={key.id}
                              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border transition-all ${
                                key.status === "active"
                                  ? "bg-white/[0.02] border-white/[0.06] hover:border-white/20"
                                  : "bg-white/[0.01] border-white/[0.04] opacity-70"
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2.5">
                                  <span className="font-mono text-xs text-foreground select-all break-all sm:break-normal">
                                    {key.key_string.slice(0, 15)}...{key.key_string.slice(-6)}
                                  </span>
                                  
                                  {key.status === "active" ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-foreground uppercase tracking-widest border border-white/10">
                                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                      Active
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold text-red-400 uppercase tracking-widest border border-red-500/20">
                                      Revoked
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-muted">
                                  Issued: {new Date(key.created_at).toLocaleString()}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(key.key_string);
                                    setCopiedText(true);
                                    setTimeout(() => setCopiedText(false), 1500);
                                  }}
                                  className="p-2 rounded-lg border border-white/[0.08] hover:bg-white/[0.04] text-muted hover:text-foreground transition-all"
                                  title="Copy Raw Key"
                                >
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                  </svg>
                                </button>
                                
                                {key.status === "active" && (
                                  <button
                                    onClick={() => revokeKey(key.id)}
                                    className="px-4 py-2 rounded-lg bg-red-950/20 border border-red-500/20 hover:border-red-500/40 text-xs font-bold text-red-400 uppercase tracking-wider hover:bg-red-950/30 transition-all cursor-pointer"
                                  >
                                    Revoke
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────── */}
              {/* 2. WEBMASTER WORKSPACE             */}
              {/* ─────────────────────────────────── */}
              {profile.user_type === "webmaster" && (
                <div className="grid gap-8 lg:grid-cols-3">
                  
                  {/* Left Column: Shield Domain Controls */}
                  <div className="lg:col-span-1 space-y-6">
                    
                    {/* Metrics/Revenue Block Widget */}
                    <div className="glass rounded-[2rem] p-8 border border-white/[0.08] relative overflow-hidden bg-gradient-to-br from-card to-background">
                      <div className="absolute -top-32 -left-32 h-64 w-64 bg-white/[0.02] rounded-full blur-[80px]" />
                      <div className="absolute -bottom-32 -right-32 h-64 w-64 bg-white/[0.02] rounded-full blur-[80px]" />
                      
                      <span className="text-[10px] font-bold uppercase tracking-widest text-foreground block mb-1">Clearance Treasury</span>
                      <h2 className="text-sm text-muted font-medium mb-6">Revenue Earned</h2>
                      
                      <div className="space-y-1">
                        <span className="text-4xl font-bold tracking-tight text-foreground font-mono text-gradient">$0.00</span>
                        <span className="text-[10px] text-muted block mt-2">Layer 4 Micro-transaction settlement vault.</span>
                      </div>
                      
                      {/* Premium background grid mesh svg */}
                      <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
                        <svg width="180" height="180" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-muted"/>
                          <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1" className="text-muted"/>
                        </svg>
                      </div>
                    </div>

                    {/* Add Domain Shield Form */}
                    <div className="glass rounded-[2rem] p-8 border border-white/[0.08]">
                      <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2.5">
                        <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Link Perimeter
                      </h2>
                      <p className="text-xs text-muted leading-relaxed mb-6">
                        Activate cryptographic perimeter defense for your target domain to block unauthorized scrapers and monetize active agent lookups.
                      </p>

                      {shieldError && (
                        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
                          {shieldError}
                        </div>
                      )}

                      <form onSubmit={addShieldDomain} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Shield Domain</label>
                          <input
                            type="text"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                            placeholder="subdomain.myblog.com"
                            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/[0.08] text-foreground text-sm font-mono focus:border-accent focus:outline-none transition-colors"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full rounded-xl bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-white/90 hover:shadow-lg hover:shadow-white/[0.05] cursor-pointer"
                        >
                          Activate Shield
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Right Columns: Active Shields & CLI Block */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Copy CLI Terminal Card */}
                    <div className="glass rounded-[2rem] p-8 border border-white/[0.08] bg-[#030206]">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Deployment Instruction</span>
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Boot Local Shield Perimeter</h3>
                      <p className="text-xs text-muted leading-relaxed mb-6">
                        Deploy the local shield server proxy in front of your intent routes using the Jin NPM CLI utility.
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/80 border border-white/[0.06] rounded-2xl p-5 font-mono text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-foreground font-bold">$</span>
                          <span className="text-foreground select-all font-mono">npx @papercargo/jin-cli shield</span>
                        </div>
                        <button
                          onClick={copyCliCode}
                          className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 hover:border-white/20 text-[10px] font-bold text-foreground uppercase tracking-widest hover:bg-white/[0.08] transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          {copiedText ? (
                            "Copied!"
                          ) : (
                            <>
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              Copy Command
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Shields Domain List */}
                    <div className="glass rounded-[2rem] p-8 border border-white/[0.08]">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                          <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12a3 3 0 11-6 0 3 3 0 016 0zm0 0c0 1.657 1.007 3 2.25 3S13.5 13.657 13.5 12m-4.5 0C9 10.343 10.007 9 11.25 9S13.5 10.343 13.5 12m0 0a3 3 0 116 0 3 3 0 01-6 0z" />
                          </svg>
                          Shield Perimeter Node Network
                        </h2>
                        <span className="text-xs text-muted">{shields.length} Active Node{shields.length !== 1 && "s"}</span>
                      </div>

                      {shieldsLoading && shields.length === 0 ? (
                        <div className="text-center py-12 text-xs text-muted">Retrieving perimeter shield servers...</div>
                      ) : shields.length === 0 ? (
                        <div className="text-center py-12 rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.01]">
                          <svg className="mx-auto h-8 w-8 text-muted/60 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                          </svg>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">No Shield Domain Connected</p>
                          <p className="text-xs text-muted/80 max-w-sm mx-auto">Link a target domain to initialize a cryptographic active protection node.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {shields.map((shield) => (
                            <div
                              key={shield.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/20"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2.5">
                                  <span className="font-mono text-xs font-bold text-foreground select-all break-all sm:break-normal">
                                    {shield.domain}
                                  </span>
                                  
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-foreground uppercase tracking-widest border border-white/10">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                    Active Perimeter
                                  </span>
                                </div>
                                <div className="text-[10px] text-muted flex items-center gap-2">
                                  <span>Added: {new Date(shield.created_at).toLocaleDateString()}</span>
                                  <span>•</span>
                                  <span>Last Ping: {new Date(shield.last_ping).toLocaleTimeString()}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5">
                                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/10 px-2.5 py-1 rounded">
                                  Online Node
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
