"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import type { CommunityApi, AIPIntent } from "@/data/community-apis";
import communityApis from "@/data/community-apis";
import { ResponseRenderer } from "@/components/ResponseRenderer";

// Resolve city coordinates for weather requests
const CITY_COORDINATES: Record<string, { lat: number; lng: number; name: string }> = {
  paris: { lat: 48.8566, lng: 2.3522, name: "Paris, France" },
  seattle: { lat: 47.6062, lng: -122.3321, name: "Seattle, WA, USA" },
  tokyo: { lat: 35.6762, lng: 139.6503, name: "Tokyo, Japan" },
  london: { lat: 51.5074, lng: -0.1278, name: "London, UK" },
  newyork: { lat: 40.7128, lng: -74.0060, name: "New York City, NY, USA" },
  mumbai: { lat: 19.0760, lng: 72.8777, name: "Mumbai, India" },
  pune: { lat: 18.5204, lng: 73.8567, name: "Pune, India" },
  sydney: { lat: -33.8688, lng: 151.2093, name: "Sydney, Australia" },
  cairo: { lat: 30.0444, lng: 31.2357, name: "Cairo, Egypt" },
};

// Resolve country names for geographical lookup
const COUNTRIES = ["india", "france", "germany", "japan", "brazil", "canada", "usa", "spain", "italy", "china", "australia", "egypt"];

const SYNONYMS: Record<string, string[]> = {
  weather: ["temp", "temperature", "forecast", "climate", "rain", "sunny", "wind", "cloudy", "weather"],
  joke: ["laugh", "funny", "humor", "giggle", "pun", "chuckle", "jokes", "joke"],
  space: ["universe", "star", "astronomy", "cosmos", "apod", "nasa", "space", "astrophotography"],
  iss: ["space station", "satellite", "orbit", "astronaut", "iss"],
  country: ["nation", "population", "capital", "geography", "countries", "country"],
  dog: ["puppy", "hound", "canine", "woof", "dogs", "dog"],
  cat: ["kitten", "feline", "meow", "cats", "cat"],
};

function buildQueryString(params: Record<string, unknown>) {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== "" && value !== undefined && value !== null
  );
  const search = new URLSearchParams();
  entries.forEach(([key, value]) => {
    search.append(key, String(value));
  });
  const string = search.toString();
  return string ? `?${string}` : "";
}

const suggestions = [
  "What is the weather in Seattle?",
  "Tell me a programming joke!",
  "Lookup info for Japan",
  "Where is the space station?",
];

export function ApiAgentConsole() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [responseData, setResponseData] = useState<any>(null);
  const [selectedApi, setSelectedApi] = useState<CommunityApi | null>(null);
  const [intentName, setIntentName] = useState("");

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, msg]);
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Localized scroll handler to prevent global viewport scrolling
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, answer, responseData]);

  const handleClear = () => {
    setQuery("");
    setLoading(false);
    setLogs([]);
    setAnswer("");
    setResponseData(null);
    setSelectedApi(null);
    setIntentName("");
  };

  const handleRunAgent = async (promptText: string) => {
    if (!promptText.trim()) return;
    setLoading(true);
    setLogs([]);
    setAnswer("");
    setResponseData(null);
    setSelectedApi(null);
    setIntentName("");

    addLog(`🔍 [Agent] Querying meetjin.com Registry for intents matching: "${promptText}"...`);
    await sleep(1000);

    // Search registry database
    let registryResult = null;
    let targetApp: any = null;
    let targetIntent: any = null;

    try {
      const res = await fetch(`/api/v1/registry/search?q=${encodeURIComponent(promptText)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          // Found a database match!
          registryResult = data.results[0];
          addLog(`📄 [Registry] Found database match: "${registryResult.app.name}" (Slug: ${registryResult.app.slug}, Score: ${registryResult.match_score.toFixed(2)})`);
          await sleep(800);
        }
      }
    } catch (err) {
      console.error("Registry search error:", err);
    }

    // If we found a database match, fetch full app details
    if (registryResult) {
      addLog(`📥 [Agent] Fetching live intent map (jin.json) for "${registryResult.app.name}"...`);
      await sleep(800);
      try {
        const res = await fetch(`/api/v1/registry/apps/${registryResult.app.slug}`);
        if (res.ok) {
          const appDetails = await res.json();
          // Check if there is a matching intent inside
          const matchingIntent = appDetails.intents.find((i: any) => i.id === registryResult.intent.id);
          if (matchingIntent) {
            targetApp = appDetails;
            targetIntent = matchingIntent;
            addLog(`✓ [Agent] Successfully fetched and parsed intent map.`);
            await sleep(600);
          }
        }
      } catch (err) {
        console.error("Fetch app details error:", err);
      }
    }

    // If no DB match was successful, fall back to matching static community catalog
    if (!targetIntent) {
      addLog(`⚠ [Agent] No custom database match found. Searching community-verified registry catalog...`);
      await sleep(1000);
      
      const queryLower = promptText.toLowerCase();
      let bestApi: any = null;
      let bestIntent: any = null;
      let maxMatchCount = 0;

      for (const api of communityApis) {
        for (const intent of api.intents) {
          let matchCount = 0;
          
          // 1. Check exact trigger string matches
          for (const trigger of intent.triggers) {
            if (queryLower.includes(trigger.toLowerCase())) matchCount += 3;
          }
          
          // 2. Check keyword word boundary matches
          const keywords = queryLower.split(/\s+/);
          for (const kw of keywords) {
            if (kw.length > 3) {
              if (intent.name.toLowerCase().includes(kw)) matchCount += 1;
              if (intent.description.toLowerCase().includes(kw)) matchCount += 1;
            }
          }

          // 3. Check semantic keyword synonyms
          Object.entries(SYNONYMS).forEach(([concept, synList]) => {
            if (queryLower.includes(concept) || synList.some(syn => queryLower.includes(syn))) {
              if (
                intent.category.toLowerCase() === concept || 
                intent.name.toLowerCase().includes(concept) ||
                intent.id.toLowerCase().includes(concept)
              ) {
                matchCount += 2;
              }
            }
          });

          if (matchCount > maxMatchCount) {
            maxMatchCount = matchCount;
            bestApi = api;
            bestIntent = intent;
          }
        }
      }

      if (bestIntent && maxMatchCount > 0) {
        targetApp = bestApi;
        targetIntent = bestIntent;
        addLog(`📄 [Registry] Found catalog match: "${targetApp.name}" (Slug: ${targetApp.slug}, Score: ${maxMatchCount})`);
        addLog(`📥 [Agent] Reading intent map triggers and description...`);
        await sleep(800);
      }
    }

    // If still no intent found, stop gracefully and output helpful instructions without defaulting to weather!
    if (!targetIntent) {
      addLog(`❌ [Agent] Could not resolve user intent.`);
      addLog(`   Registry search did not yield any matches for triggers, synonyms, or descriptions.`);
      await sleep(1000);
      setAnswer(`I queried the MeetJin registry but couldn't find any app or intent map matching your request. Try registering a new intent map using the Jin CLI or verify your search terms!`);
      setLoading(false);
      return;
    }

    addLog(`🎯 [AIP] Selected intent: "${targetIntent.id}"`);
    addLog(`   Description: "${targetIntent.description}"`);
    await sleep(800);

    addLog(`⚙ [Agent] Extracting parameters from prompt...`);
    await sleep(800);

    // Extract parameters
    const params: Record<string, any> = {};
    const queryLower = promptText.toLowerCase();

    if (targetIntent.id === "get_current_weather") {
      let matchedCity = "seattle";
      for (const city of Object.keys(CITY_COORDINATES)) {
        if (queryLower.includes(city)) {
          matchedCity = city;
          break;
        }
      }
      const coords = CITY_COORDINATES[matchedCity];
      params.latitude = coords.lat;
      params.longitude = coords.lng;
      params.current_weather = true;
      addLog(`   Matched city: "${coords.name}"`);
    } else if (targetIntent.id === "get_country_by_name") {
      let matchedCountry = "India";
      for (const country of COUNTRIES) {
        if (queryLower.includes(country)) {
          matchedCountry = country.charAt(0).toUpperCase() + country.slice(1);
          break;
        }
      }
      params.name = matchedCountry;
      addLog(`   Matched country: "${matchedCountry}"`);
    } else if (targetIntent.id === "get_joke") {
      let matchedCat = "Programming";
      const cats = ["programming", "misc", "dark", "pun"];
      for (const cat of cats) {
        if (queryLower.includes(cat)) {
          matchedCat = cat.charAt(0).toUpperCase() + cat.slice(1);
          break;
        }
      }
      params.category = matchedCat;
      params["safe-mode"] = true;
      addLog(`   Matched category: "${matchedCat}"`);
    } else if (targetIntent.id === "get_joke_by_category") {
      let matchedCat = "dev";
      const cats = ["dev", "science", "sport", "history"];
      for (const cat of cats) {
        if (queryLower.includes(cat)) {
          matchedCat = cat;
          break;
        }
      }
      params.category = matchedCat;
      addLog(`   Matched category: "${matchedCat}"`);
    } else if (targetIntent.id === "get_number_fact") {
      const numMatch = queryLower.match(/\b\d+\b/);
      params.number = numMatch ? parseInt(numMatch[0]) : 42;
      addLog(`   Matched number: ${params.number}`);
    } else if (targetIntent.id === "get_article_summary" || targetIntent.id === "search_books" || targetIntent.id === "get_book") {
      const words = queryLower.replace(/about|for|find|search|book/g, "").trim().split(/\s+/);
      const searchWord = words.length > 0 && words[0].length > 2 ? words[0] : "earth";
      if (targetIntent.id === "get_article_summary") {
        params.title = searchWord.charAt(0).toUpperCase() + searchWord.slice(1);
        addLog(`   Matched article title: "${params.title}"`);
      } else if (targetIntent.id === "search_books") {
        params.q = searchWord;
        params.limit = 3;
        addLog(`   Matched book query: "${params.q}"`);
      } else {
        params.bibkeys = "ISBN:0451526538";
        params.format = "json";
        addLog(`   Matched bibliographic keys: "${params.bibkeys}"`);
      }
    }

    // Populate any other defaults or examples
    if (targetIntent.parameters) {
      Object.entries(targetIntent.parameters).forEach(([key, spec]: [string, any]) => {
        if (params[key] === undefined) {
          if (spec.example !== undefined) params[key] = spec.example;
          else if (spec.default !== undefined) params[key] = spec.default;
          else if (spec.required) {
            if (spec.type === "number") params[key] = 1;
            else if (spec.type === "boolean") params[key] = true;
            else params[key] = "test";
          }
        }
      });
    }

    addLog(`   Resolved parameters: ${JSON.stringify(params, null, 2)}`);
    await sleep(800);

    // Build final URL and method request
    let endpointPath = targetIntent.endpoint;
    const pathParams: Record<string, any> = {};
    const queryParams: Record<string, any> = {};
    const bodyParams: Record<string, any> = {};

    const templateTokens: string[] = [];
    const matches = endpointPath.match(/\{([^}]+)\}/g);
    if (matches) {
      for (const m of matches) {
        templateTokens.push(m.substring(1, m.length - 1));
      }
    }

    Object.entries(params).forEach(([key, val]) => {
      if (templateTokens.includes(key)) {
        pathParams[key] = val;
      } else if (targetIntent.method === "GET") {
        queryParams[key] = val;
      } else {
        bodyParams[key] = val;
      }
    });

    // Interpolate path parameters
    endpointPath = endpointPath.replace(/\{([^}]+)\}/g, (match: string, key: string) => {
      if (match === "") return ""; // dummy use to satisfy unused local rules
      return encodeURIComponent(String(pathParams[key] ?? ""));
    });

    const queryStr = buildQueryString(queryParams);
    const baseUrl = targetApp.baseUrl || targetApp.url || "https://api.open-meteo.com";
    const requestUrl = `${baseUrl.replace(/\/$/, "")}${endpointPath}${queryStr}`;

    addLog(`🚀 [Agent] Dispatching live API request...`);
    addLog(`   URL: ${requestUrl}`);
    addLog(`   Method: ${targetIntent.method}`);
    if (targetIntent.method !== "GET") {
      addLog(`   Body: ${JSON.stringify(bodyParams, null, 2)}`);
    }
    await sleep(1000);

    // Execute actual API request
    try {
      const start = performance.now();
      const fetchInit: RequestInit = {
        method: targetIntent.method,
        headers: {
          Accept: "application/json",
        }
      };
      if (targetIntent.method !== "GET") {
        fetchInit.headers = {
          ...fetchInit.headers,
          "Content-Type": "application/json",
        };
        fetchInit.body = JSON.stringify(bodyParams);
      }

      // Use a secure base url if the current browser window is secure
      let secureUrl = requestUrl;
      if (typeof window !== "undefined" && window.location.protocol === "https:" && secureUrl.startsWith("http://")) {
        // Fallback replacement for space station or other unsecured endpoints to prevent Mixed Content
        secureUrl = secureUrl.replace("http://", "https://");
      }

      const response = await fetch(secureUrl, fetchInit);
      const duration = Math.round(performance.now() - start);

      addLog(`🟢 [Network] HTTP ${response.status} ${response.statusText} (${duration}ms)`);
      await sleep(600);

      const contentType = response.headers.get("content-type") || "";
      let resData: any;
      if (contentType.includes("application/json")) {
        resData = await response.json();
      } else {
        resData = await response.text();
      }

      if (!response.ok) {
        addLog(`✗ [Agent] Request returned error status.`);
        setAnswer(`The API endpoint returned an error status ${response.status}. Please check details below.`);
        setResponseData(resData);
        setSelectedApi(targetApp);
        setIntentName(targetIntent.name);
        setLoading(false);
        return;
      }

      addLog(`✍ [Agent] Synthesizing conversational output...`);
      await sleep(800);

      let finalAnswer = "API executed successfully! The agent parsed the data and extracted relevant details.";

      if (targetIntent.id === "get_current_weather") {
        const temp = resData.current_weather?.temperature ?? "?";
        const wind = resData.current_weather?.windspeed ?? "?";
        const city = promptText.match(/paris|seattle|tokyo|london|mumbai|pune|sydney|cairo/i)?.[0] || "Paris";
        const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1);
        finalAnswer = `It is currently ${temp}°C in ${capitalizedCity} with a wind speed of ${wind} km/h! The data was pulled live from Open-Meteo weather registry.`;
      } else if (targetIntent.id === "get_joke") {
        if (resData.type === "single") {
          finalAnswer = resData.joke;
        } else {
          finalAnswer = `${resData.setup} ... ${resData.delivery}`;
        }
      } else if (targetIntent.id === "get_random_advice") {
        finalAnswer = resData.slip?.advice || "Always be kind to others!";
      } else if (targetIntent.id === "get_country_by_name") {
        const country = Array.isArray(resData) ? resData[0] : resData;
        if (country) {
          const cap = country.capital?.[0] || "N/A";
          const pop = (country.population / 1000000).toFixed(1);
          finalAnswer = `${country.name?.common} is a beautiful country! Its capital is ${cap}, it has a population of about ${pop} million people, and it is located in the region of ${country.region}.`;
        }
      } else if (targetIntent.id === "get_iss_position") {
        const lat = resData.iss_position?.latitude;
        const lng = resData.iss_position?.longitude;
        finalAnswer = `The International Space Station is currently soaring over coordinates latitude ${lat} and longitude ${lng}!`;
      } else if (targetIntent.id === "get_astronomy_picture") {
        finalAnswer = `Here is NASA's Astronomy Picture of the Day: "${resData.title}". ${resData.explanation?.slice(0, 150)}...`;
      } else if (targetIntent.id === "get_random_joke") {
        finalAnswer = resData.value || "Chuck Norris has counted to infinity. Twice.";
      } else if (targetIntent.id === "get_cat_fact") {
        finalAnswer = resData.fact || "Cats sleep 70% of their lives.";
      } else if (targetIntent.id === "get_random_dog") {
        finalAnswer = "Here is a random dog photo retrieved from Dog CEO API!";
      } else if (targetIntent.id === "get_article_summary") {
        finalAnswer = resData.extract || "Here is the summary from Wikipedia!";
      } else if (targetIntent.id === "get_number_fact") {
        finalAnswer = typeof resData === "string" ? resData : resData.text || "Number 42 is the meaning of life.";
      }

      setAnswer(finalAnswer);
      setResponseData(resData);
      setSelectedApi(targetApp);
      setIntentName(targetIntent.name);
      addLog(`✓ [Agent] Execution completed successfully.`);
    } catch (err: any) {
      console.error(err);
      addLog(`✗ [Network] Request failed: ${err.message}`);
      setAnswer(`Failed to reach the API endpoint due to a network or CORS issue.`);
      setLoading(false);
    }

    setLoading(false);
  };

  return (
    <div className="rounded-[2rem] border border-border bg-card p-6 shadow-[0_35px_80px_rgba(0,0,0,0.22)] flex flex-col h-[520px] w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent">Agent Console</p>
          <p className="text-xs text-muted mt-0.5">Conversational AIP Simulator</p>
        </div>
        <div className="flex items-center gap-2">
          {(logs.length > 0 || answer || responseData) && (
            <button
              onClick={handleClear}
              className="text-[10px] uppercase font-bold tracking-widest text-muted hover:text-foreground border border-border rounded-full px-2.5 py-1 bg-background/50 hover:bg-background transition-colors cursor-pointer flex items-center gap-1"
              title="Reset Console"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Clear
            </button>
          )}
          <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] uppercase font-semibold tracking-widest text-accent border border-accent/20">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
            live
          </span>
        </div>
      </div>

      {/* suggestion chips */}
      {logs.length === 0 && !loading && (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider text-muted mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(s);
                  handleRunAgent(s);
                }}
                className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-background text-muted hover:text-foreground hover:border-accent/30 transition-all cursor-pointer text-left"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Terminal logs or answer display */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1 scrollbar-thin"
      >
        {logs.length > 0 && (
          <div className="rounded-xl border border-border bg-black/60 p-4 font-mono text-[11px] leading-5 text-zinc-300 whitespace-pre-wrap break-all overflow-x-hidden w-full max-w-full">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={`break-all whitespace-pre-wrap ${
                  log.startsWith("✓") || log.includes("🟢")
                    ? "text-success"
                    : log.startsWith("✗") || log.includes("⚠")
                    ? "text-warning"
                    : "text-zinc-300"
                }`}
              >
                {log}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-1.5 mt-1 text-accent">
                <span className="h-1 w-1 bg-accent rounded-full animate-bounce" />
                <span className="h-1 w-1 bg-accent rounded-full animate-bounce delay-75" />
                <span className="h-1 w-1 bg-accent rounded-full animate-bounce delay-150" />
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>
        )}

        {/* Conversational answer bubble */}
        {answer && (
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-[9px] uppercase tracking-wider text-accent font-semibold">
              Agent Output
            </div>
            <p className="text-sm leading-6 text-foreground font-medium pr-10">
              {answer}
            </p>
          </div>
        )}

        {/* Response Data cards */}
        {responseData && selectedApi && (
          <div className="mt-4 border border-border rounded-2xl bg-black/20 p-2">
            <ResponseRenderer
              data={responseData}
              api={selectedApi}
              intentName={intentName}
            />
          </div>
        )}

        {logs.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center text-center h-full text-muted py-8">
            <svg className="h-10 w-10 text-muted/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-muted/60">Simulator Idle</p>
            <p className="text-xs text-muted/50 mt-1 max-w-xs leading-5">
              Enter a natural language request below or click a suggestion to see the agent query the registry and execute API calls.
            </p>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRunAgent(query);
        }}
        className="flex gap-2 border-t border-border pt-4"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask Jin's Agent something..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-xs focus:border-accent focus:outline-none transition-colors font-medium"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2.5 rounded-xl bg-accent text-background text-xs font-bold hover:bg-accent/90 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <span className="h-3 w-3 border-2 border-background border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
