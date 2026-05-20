import type { CommunityApi } from "@/data/community-apis";

type ApiCardProps = {
  api: CommunityApi;
  liveStatus: "idle" | "loading" | "ok" | "error";
  onSelect: () => void;
};

export function ApiCard({ api, liveStatus, onSelect }: ApiCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex h-full flex-col rounded-3xl border border-border bg-card p-6 text-left transition-all hover:border-accent/20 hover:bg-card-hover"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-3xl">{api.emoji}</span>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{api.name}</h3>
              <p className="text-sm text-muted">{api.description}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`h-3.5 w-3.5 rounded-full ${
              liveStatus === "ok"
                ? "bg-success"
                : liveStatus === "loading"
                ? "bg-warning"
                : liveStatus === "error"
                ? "bg-danger"
                : "bg-muted"
            }`}
            aria-label={liveStatus === "ok" ? "Live" : liveStatus === "loading" ? "Checking" : liveStatus === "error" ? "Offline" : "Unknown"}
          />
          <span className="text-xs text-muted">Live status</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full border border-border bg-white/[0.04] px-3 py-1 text-xs font-medium text-foreground">
          {api.category}
        </span>
        <span className="inline-flex items-center rounded-full border border-border bg-white/[0.04] px-3 py-1 text-xs text-muted">
          {api.intents.length} intents
        </span>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${api.requiresAuth ? "border border-danger bg-danger/10 text-danger" : "border border-success bg-success/10 text-success"}`}>
          {api.requiresAuth ? "Auth required" : "No auth"}
        </span>
      </div>

      <div className="mt-auto pt-6">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors group-hover:text-accent/90">
          Test live
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      </div>
    </button>
  );
}
