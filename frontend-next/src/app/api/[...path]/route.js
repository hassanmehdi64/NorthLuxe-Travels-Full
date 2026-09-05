const defaultApiTarget = "https://north-luxe-backend.vercel.app/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const proxyRequest = async (request, context) => {
  const { path } = await context.params;
  const apiTarget = (process.env.API_PROXY_TARGET || defaultApiTarget).replace(/\/$/, "");
  const incomingUrl = new URL(request.url);
  const upstreamUrl = `${apiTarget}/${path.map(encodeURIComponent).join("/")}${incomingUrl.search}`;

  const headers = new Headers(request.headers);
  ["connection", "content-length", "host", "origin", "referer"].forEach((name) =>
    headers.delete(name),
  );

  const method = request.method.toUpperCase();
  const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });
    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    return new Response(await upstreamResponse.arrayBuffer(), {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Backend proxy request failed", {
      method,
      path: incomingUrl.pathname,
      message: error instanceof Error ? error.message : String(error),
    });
    return Response.json(
      { message: "The backend service is currently unavailable." },
      { status: 502 },
    );
  }
};

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const HEAD = proxyRequest;
export const OPTIONS = proxyRequest;

