import type { AIPParameter } from "@/data/community-apis";

/**
 * Generate realistic test data for a parameter based on its type, name, and hints.
 * This simulates how an AI agent would infer and populate parameter values.
 */
export function generateRealisticValue(
  param: AIPParameter,
  paramKey: string
): unknown {
  // Prioritize explicit default or example
  if (param.default !== undefined) {
    return param.default;
  }

  if (param.example !== undefined) {
    return param.example;
  }

  // Type-based generation
  if (param.type === "boolean") {
    return true;
  }

  if (param.type === "enum" && param.enum && param.enum.length > 0) {
    return param.enum[0];
  }

  if (param.type === "number") {
    // Heuristics for common numeric parameters
    const lower = paramKey.toLowerCase();
    if (lower.includes("latitude")) return 51.5074; // London
    if (lower.includes("longitude")) return -0.1278;
    if (lower.includes("page")) return 1;
    if (lower.includes("limit")) return 10;
    if (lower.includes("id")) return 1;
    if (lower.includes("width")) return 200;
    if (lower.includes("height")) return 300;
    return 42;
  }

  if (param.type === "string") {
    // Heuristics for common string parameters
    const lower = paramKey.toLowerCase();
    if (lower.includes("name")) {
      // Try to match context from nearby keys
      if (paramKey.includes("pokemon") || paramKey === "name") return "pikachu";
      if (paramKey.includes("meal") || paramKey === "s") return "chicken";
      if (paramKey.includes("country")) return "India";
      if (paramKey.includes("book") || paramKey === "q") return "Harry Potter";
      if (paramKey.includes("article") || paramKey === "title") return "Pune";
      return "test";
    }
    if (lower.includes("category")) return "Any";
    if (lower.includes("query") || lower.includes("q")) return "search";
    if (lower.includes("api_key") || lower.includes("apikey")) return "DEMO_KEY";
    if (lower.includes("message")) return "Hello, world!";
    if (lower.includes("title")) return "Test Post";
    if (lower.includes("body")) return "This is a test post.";
    if (lower.includes("field")) return "name,capital,population";
    if (lower.includes("format")) return "json";
    if (lower.includes("bibkey")) return "ISBN:0451526538";
    if (lower.includes("ip")) return "";
    return "default";
  }

  return "";
}

/**
 * Generate realistic parameter values for all parameters in an intent.
 */
export function generateAllParameters(
  parameters?: Record<string, AIPParameter>
): Record<string, unknown> {
  if (!parameters) return {};

  const values: Record<string, unknown> = {};
  Object.entries(parameters).forEach(([key, param]) => {
    values[key] = generateRealisticValue(param, key);
  });
  return values;
}
