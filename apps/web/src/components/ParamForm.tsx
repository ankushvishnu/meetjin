import type { AIPParameter } from "@/data/community-apis";

type ParamFormProps = {
  parameters?: Record<string, AIPParameter>;
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
};

export function ParamForm({ parameters, values, onChange }: ParamFormProps) {
  if (!parameters || Object.keys(parameters).length === 0) {
    return <p className="text-sm text-muted">This intent has no configurable parameters.</p>;
  }

  return (
    <div className="space-y-4">
      {Object.entries(parameters).map(([key, param]) => {
        const currentValue = values[key] ?? param.default ?? "";
        const required = param.required ? "*" : "";
        const inputId = `param-${key}`;

        return (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor={inputId} className="text-sm font-medium text-foreground">
                {key} {required}
              </label>
              {param.type === "enum" && param.enum ? (
                <span className="text-xs text-muted">select</span>
              ) : (
                <span className="text-xs text-muted">{param.type}</span>
              )}
            </div>
            {param.type === "enum" && param.enum ? (
              <select
                id={inputId}
                value={String(currentValue)}
                onChange={(event) => onChange(key, event.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
              >
                {param.enum.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : param.type === "boolean" ? (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                <input
                  id={inputId}
                  type="checkbox"
                  checked={Boolean(currentValue)}
                  onChange={(event) => onChange(key, event.target.checked)}
                  className="h-4 w-4 rounded border border-border text-accent focus:ring-accent"
                />
                <span className="text-sm text-foreground">Enable</span>
              </div>
            ) : (
              <input
                id={inputId}
                type={param.type === "number" ? "number" : "text"}
                value={String(currentValue)}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (param.type === "number") {
                    onChange(key, raw === "" ? "" : Number(raw));
                  } else {
                    onChange(key, raw);
                  }
                }}
                placeholder={param.example ? String(param.example) : "Enter a value"}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
              />
            )}
            <p className="text-xs text-muted">{param.description}</p>
          </div>
        );
      })}
    </div>
  );
}
