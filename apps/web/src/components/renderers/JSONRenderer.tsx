type JSONRendererProps = {
  data: any;
  title?: string;
};

export function JSONRenderer({ data, title = "Response" }: JSONRendererProps) {
  const json = JSON.stringify(data, null, 2);
  const lines = json.split("\n").length;

  return (
    <div className="rounded-3xl border border-border bg-card p-8">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>

      <div className="rounded-2xl border border-border bg-black/20 p-4 overflow-x-auto">
        <pre className="text-xs text-foreground font-mono whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
          {json}
        </pre>
      </div>

      <p className="mt-3 text-xs text-muted">{lines} lines</p>
    </div>
  );
}
