type ImageRendererProps = {
  data: any;
};

export function ImageRenderer({ data }: ImageRendererProps) {
  // Extract image URL from various response formats
  const getImageUrl = (): string | null => {
    if (typeof data === "string" && data.includes("http")) return data;
    if (data.url && typeof data.url === "string") return data.url;
    if (data.image && typeof data.image === "string") return data.image;
    if (data.src && typeof data.src === "string") return data.src;
    if (data.image_url && typeof data.image_url === "string")
      return data.image_url;
    if (
      data.image_url?.url &&
      typeof data.image_url.url === "string"
    )
      return data.image_url.url;
    if (data.message && typeof data.message === "string") return data.message;
    if (
      Array.isArray(data) &&
      data[0] &&
      typeof data[0].url === "string"
    )
      return data[0].url;
    return null;
  };

  const imageUrl = getImageUrl();
  const title = data.name || data.title || data.pokemon || "Image";
  const description = data.description || data.explanation || "";

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Image Preview</h3>
      
      <div className="space-y-3">
        {imageUrl ? (
          <div className="rounded-xl border border-border overflow-hidden bg-black/20 flex items-center justify-center p-1">
            <img
              src={imageUrl}
              alt={String(title)}
              className="w-full max-h-48 object-contain rounded-lg bg-black/40 mx-auto"
              onError={(e) => {
                const el = e.currentTarget;
                el.style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-black/20 p-6 text-center">
            <p className="text-muted text-xs">No image URL found in response</p>
          </div>
        )}

        {title && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted mb-0.5">Title</p>
            <p className="text-sm font-semibold text-foreground capitalize">
              {String(title)}
            </p>
          </div>
        )}

        {description && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted mb-1">Description</p>
            <p className="text-foreground text-xs leading-5">{description}</p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-white/[0.03] p-3 mt-3">
          <p className="text-[10px] uppercase tracking-wider text-muted mb-1">Raw Response</p>
          <pre className="text-xs text-foreground overflow-auto max-h-32 font-mono scrollbar-thin">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
