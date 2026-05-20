export type ResponseType =
  | "weather"
  | "image"
  | "joke"
  | "table"
  | "json";

/**
 * Detect the type of API response to determine which renderer to use.
 */
export function detectResponseType(
  data: any,
  intentName: string
): ResponseType {
  if (!data) return "json";

  const intentLower = (intentName || "").toLowerCase();

  // Image detection
  if (
    typeof data === "object" &&
    (data.url ||
      data.image ||
      data.src ||
      data.image_url ||
      data.message?.includes("http") ||
      data.status === "success" ||
      data.hdurl ||
      data.url_small)
  ) {
    // Check for image-like patterns
    if (
      (typeof data.url === "string" && (data.url.includes("image") || data.url.includes("jpg") || data.url.includes("png"))) ||
      data.media?.includes("image") ||
      intentLower.includes("image") ||
      intentLower.includes("dog") ||
      intentLower.includes("cat") ||
      intentLower.includes("pokemon") ||
      intentLower.includes("apod") ||
      intentLower.includes("nasa")
    ) {
      return "image";
    }
  }

  // Weather detection
  if (
    intentLower.includes("weather") ||
    intentLower.includes("forecast") ||
    (typeof data === "object" &&
      (data.current_weather ||
        data.temperature ||
        data.temp ||
        data.wind_speed ||
        data.humidity ||
        data.weather_code ||
        data.current))
  ) {
    return "weather";
  }

  // Joke detection
  if (
    intentLower.includes("joke") ||
    (typeof data === "object" &&
      (data.joke ||
        data.setup ||
        data.punchline ||
        data.value?.includes("joke")))
  ) {
    return "joke";
  }

  // Table detection: array of objects
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    return "table";
  }

  // Default to JSON
  return "json";
}
