type WeatherRendererProps = {
  data: any;
};

export function WeatherRenderer({ data }: WeatherRendererProps) {
  // Handle different weather API response formats
  const current = data.current_weather || data.current || data;
  const temperature = current?.temperature || current?.temp || "—";
  const weatherCode = current?.weather_code || current?.weather?.[0]?.main || "Unknown";
  const humidity = current?.relative_humidity || current?.humidity || "—";
  const windSpeed = current?.wind_speed || current?.wind?.speed || "—";
  const condition = current?.weather?.[0]?.description || weatherCode;

  // Simple emoji mapping
  const getWeatherEmoji = (code: string | number) => {
    const str = String(code).toLowerCase();
    if (str.includes("clear") || str.includes("sunny") || code === 0) return "☀️";
    if (str.includes("cloud")) return "☁️";
    if (str.includes("rain")) return "🌧️";
    if (str.includes("snow")) return "❄️";
    if (str.includes("storm") || str.includes("thunder")) return "⛈️";
    return "🌤️";
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-8">
      <h3 className="text-lg font-semibold text-foreground mb-6">Weather Report</h3>

      <div className="grid gap-6">
        {/* Main temp card */}
        <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted mb-2">Current Condition</p>
              <div className="text-4xl font-bold text-foreground">
                {temperature}°C
              </div>
              <p className="mt-3 text-foreground font-medium capitalize">
                {String(condition).charAt(0).toUpperCase() +
                  String(condition).slice(1)}
              </p>
            </div>
            <div className="text-6xl">{getWeatherEmoji(weatherCode)}</div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-white/[0.03] p-4">
            <p className="text-xs text-muted mb-2">Humidity</p>
            <p className="text-2xl font-bold text-foreground">{humidity}%</p>
          </div>
          <div className="rounded-xl border border-border bg-white/[0.03] p-4">
            <p className="text-xs text-muted mb-2">Wind Speed</p>
            <p className="text-2xl font-bold text-foreground">
              {windSpeed}
              <span className="text-sm ml-1">m/s</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-white/[0.03] p-4">
        <p className="text-xs text-muted mb-2">Raw Response</p>
        <pre className="text-xs text-foreground overflow-auto max-h-48 font-mono">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
