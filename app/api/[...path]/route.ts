import { request as httpsRequest } from "node:https";
import { request as httpRequest } from "node:http";
import { NextRequest } from "next/server";

import { API_ORIGIN } from "@/lib/api-origin";

export const runtime = "nodejs";

const hopByHopHeaders = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

async function proxy(request: NextRequest, path: string[]) {
  const target = new URL(`/api/${path.join("/")}`, `${API_ORIGIN}/`);
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");

  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : Buffer.from(await request.arrayBuffer());

  return new Promise<Response>((resolve, reject) => {
    const client = target.protocol === "https:" ? httpsRequest : httpRequest;
    const upstreamRequest = client(
      target,
      {
        method: request.method,
        headers: Object.fromEntries(headers),
        rejectUnauthorized: process.env.NODE_ENV === "production",
      },
      (upstreamResponse) => {
        const responseHeaders = new Headers();

        for (const [key, value] of Object.entries(upstreamResponse.headers)) {
          if (value && !hopByHopHeaders.has(key)) {
            responseHeaders.set(key, Array.isArray(value) ? value.join(", ") : value);
          }
        }

        const chunks: Buffer[] = [];
        upstreamResponse.on("data", (chunk: Buffer) => chunks.push(chunk));
        upstreamResponse.on("end", () => {
          resolve(
            new Response(Buffer.concat(chunks), {
              status: upstreamResponse.statusCode || 502,
              headers: responseHeaders,
            })
          );
        });
      }
    );

    upstreamRequest.on("error", reject);
    if (body) upstreamRequest.write(body);
    upstreamRequest.end();
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await context.params).path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await context.params).path);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await context.params).path);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await context.params).path);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await context.params).path);
}
