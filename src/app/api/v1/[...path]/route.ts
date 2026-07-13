/**
 * Next.js catch-all API proxy for FastAPI backend.
 *
 * Forwards all requests matching /api/v1/* to the Python FastAPI server,
 * preserving method, headers, and body. This avoids CORS issues in production
 * and keeps the API base URL consistent regardless of environment.
 *
 * Environment variable:
 *   FASTAPI_URL  (default: http://localhost:8000)
 */

import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL ?? 'http://localhost:8000';

async function handler(
  req: NextRequest,
  context: { params: { path: string[] } },
) {
  const path = context.params.path.join('/');
  const targetUrl = `${FASTAPI_URL}/api/v1/${path}${req.nextUrl.search}`;

  // Copy all relevant request headers
  const forwardHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    // Skip Next.js internal headers
    if (!['host', 'connection'].includes(key.toLowerCase())) {
      forwardHeaders[key] = value;
    }
  });

  const isBodyMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      ...(isBodyMethod ? { body: await req.text() } : {}),
      // Prevent Node from buffering the response stream
      // @ts-expect-error — duplex is valid in Node 18+ fetch
      duplex: 'half',
    });

    // Forward the upstream response body and status
    const data = await upstream.text();
    const contentType = upstream.headers.get('content-type') ?? 'application/json';

    return new NextResponse(data, {
      status: upstream.status,
      headers: {
        'Content-Type': contentType,
        'X-Proxied-From': 'FinHealth-FastAPI',
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Proxy error';
    return NextResponse.json(
      { detail: `API proxy error: ${msg}` },
      { status: 502 },
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
