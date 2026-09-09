const MAX_MESSAGE_LENGTH = 3000;
const MAX_BODY_BYTES = 20000;

function failure(status: number, error = "send_failed") {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return failure(415, "invalid_request");
  }
  const origin = request.headers.get("origin");
  const requestUrl = new URL(request.url);
  // Next.js can normalize the URL host to its internal hostname; Host retains the browser's destination.
  const requestOrigin = `${requestUrl.protocol}//${request.headers.get("host") ?? requestUrl.host}`;
  if ((origin && origin !== requestOrigin) || request.headers.get("sec-fetch-site") === "cross-site") {
    return failure(403, "invalid_request");
  }
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) return failure(413, "invalid_request");

  let payload: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return failure(400, "invalid_request");
    const decoder = new TextDecoder();
    let body = "";
    let bytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_BODY_BYTES) {
          await reader.cancel();
          return failure(413, "invalid_request");
        }
        body += decoder.decode(value, { stream: true });
      }
      payload = JSON.parse(body + decoder.decode());
    } finally {
      reader.releaseLock();
    }
  } catch {
    return failure(400, "invalid_request");
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)
    || Object.keys(payload).some((key) => key !== "message")
    || !("message" in payload) || typeof payload.message !== "string"
    || !payload.message.trim() || payload.message.length > MAX_MESSAGE_LENGTH) {
    return failure(400, "invalid_message");
  }

  // These values are server-only. Delivery stays unavailable until all three are configured.
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  if (!apiKey || !to || !from) return failure(503, "unavailable");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: "A private note from the portfolio", text: payload.message.trim() }),
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    if (!response.ok) return failure(502);
    const result = await response.json();
    if (typeof result?.id !== "string" || !result.id) return failure(502);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return failure(502);
  }
}
