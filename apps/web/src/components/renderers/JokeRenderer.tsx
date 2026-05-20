type JokeRendererProps = {
  data: any;
};

export function JokeRenderer({ data }: JokeRendererProps) {
  // Extract joke from various response formats
  const getJokeText = (): { setup?: string; punchline?: string; joke?: string } => {
    if (data.setup && data.punchline) {
      return { setup: data.setup, punchline: data.punchline };
    }
    if (data.joke && typeof data.joke === "string") {
      return { joke: data.joke };
    }
    if (data.value && typeof data.value === "string") {
      return { joke: data.value };
    }
    if (data.slip && typeof data.slip === "string") {
      return { joke: data.slip };
    }
    if (typeof data === "string") {
      return { joke: data };
    }
    return {};
  };

  const jokeData = getJokeText();

  return (
    <div className="rounded-3xl border border-border bg-card p-8">
      <h3 className="text-lg font-semibold text-foreground mb-6">😄 Joke</h3>

      <div className="space-y-6">
        {jokeData.setup && jokeData.punchline ? (
          <>
            <div className="rounded-2xl border border-border bg-accent/5 p-6">
              <p className="text-sm text-muted mb-2">Setup</p>
              <p className="text-lg text-foreground font-medium">
                {jokeData.setup}
              </p>
            </div>

            <div className="rounded-2xl border border-success/20 bg-success/5 p-6">
              <p className="text-sm text-muted mb-2">Punchline</p>
              <p className="text-lg text-foreground font-bold">
                {jokeData.punchline}
              </p>
            </div>
          </>
        ) : jokeData.joke ? (
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6">
            <p className="text-lg text-foreground leading-relaxed">
              {jokeData.joke}
            </p>
          </div>
        ) : null}

        <div className="rounded-xl border border-border bg-white/[0.03] p-4">
          <p className="text-xs text-muted mb-2">Raw Response</p>
          <pre className="text-xs text-foreground overflow-auto max-h-48 font-mono">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
