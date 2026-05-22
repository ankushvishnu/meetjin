import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const func = searchParams.get("function") || "GLOBAL_QUOTE";
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol parameter is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      console.error("ALPHA_VANTAGE_API_KEY is not configured in .env.local");
      return NextResponse.json(
        { error: "Server API Key not configured" },
        { status: 500 }
      );
    }

    const targetUrl = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&apikey=${apiKey}`;

    const response = await fetch(targetUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Alpha Vantage API returned status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // If the API limit is reached, Alpha Vantage returns a 200 OK with an Information/Note field
    if (data.Information || data.Note) {
       console.warn("Alpha Vantage API Limit/Note:", data.Information || data.Note);
    }

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Alpha Vantage Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal server error connecting to Alpha Vantage" },
      { status: 500 }
    );
  }
}
