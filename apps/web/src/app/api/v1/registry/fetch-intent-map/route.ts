import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'url parameter is required' }, { status: 400 })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MeetJin-Registry/0.1 (intent-map-fetch)',
      },
    })

    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json(
        { error: `Remote server returned ${res.status}` },
        { status: 502 }
      )
    }

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('json')) {
      return NextResponse.json(
        { error: 'Response is not JSON. Expected application/json content type.' },
        { status: 502 }
      )
    }

    const data = await res.json()

    // Basic AIP validation
    if (!data.aip_version) {
      return NextResponse.json(
        { error: 'Not a valid AIP document. Missing aip_version field.' },
        { status: 422 }
      )
    }

    return NextResponse.json(data)
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timed out (8s)' }, { status: 504 })
    }
    return NextResponse.json(
      { error: `Failed to fetch: ${err.message}` },
      { status: 502 }
    )
  }
}
