import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ action: string; ticker: string }> }
) {
  try {
    const { action, ticker } = await params;
    const searchParams = request.nextUrl.searchParams;

    let targetUrl = "";

    // 1. Map the agent action to the correct Yahoo Finance endpoint
    switch (action) {
      case "quote":
        targetUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}`;
        break;
      case "historical":
        const interval = searchParams.get("interval") || "1d";
        const range = searchParams.get("range") || "1mo";
        targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=${interval}&range=${range}`;
        break;
      case "info":
        targetUrl = `https://query1.finance.yahoo.com/v11/finance/quoteSummary/${ticker}?modules=assetProfile,summaryProfile`;
        break;
      default:
        return NextResponse.json(
          { error: `Unknown yfinance action: ${action}` },
          { status: 400 }
        );
    }

    // 2. Fetch the data from Yahoo Finance securely on the server
    const response = await fetch(targetUrl, {
      headers: {
        // Send a generic user agent to bypass some strict Yahoo checks
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      // In case Yahoo rate-limits our server IP
      if (response.status === 429) {
        return NextResponse.json(
          { error: "Yahoo Finance API is rate limiting our server. Please try again later." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `Yahoo API returned status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 3. Return the exact JSON payload to the client.
    // CORS headers are automatically handled by Next.js API routes or can be explicitly set
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("YFinance Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal server error connecting to YFinance" },
      { status: 500 }
    );
  }
}
