type TableRendererProps = {
  data: any;
};

export function TableRenderer({ data }: TableRendererProps) {
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8">
        <p className="text-muted">No data to display.</p>
      </div>
    );
  }

  // Get all unique keys across all objects
  const allKeys = new Set<string>();
  items.forEach((item) => {
    if (typeof item === "object" && item !== null) {
      Object.keys(item).forEach((key) => allKeys.add(key));
    }
  });
  const keys = Array.from(allKeys).slice(0, 6); // Limit to 6 columns

  const truncate = (value: any, maxLen = 50): string => {
    const str = String(value);
    return str.length > maxLen ? str.substring(0, maxLen) + "…" : str;
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-8">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        {items.length === 1 ? "Result" : `Results (${items.length} items)`}
      </h3>

      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {keys.map((key) => (
                <th
                  key={key}
                  className="border-b border-border bg-white/5 px-3 py-2 text-left text-xs font-semibold text-foreground"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-border/50 hover:bg-white/[0.02]">
                {keys.map((key) => (
                  <td
                    key={`${idx}-${key}`}
                    className="px-3 py-2 text-foreground font-mono text-xs"
                    title={String(item[key])}
                  >
                    {truncate(item[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-border bg-white/[0.03] p-4">
        <p className="text-xs text-muted mb-2">Raw Response</p>
        <pre className="text-xs text-foreground overflow-auto max-h-48 font-mono">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
