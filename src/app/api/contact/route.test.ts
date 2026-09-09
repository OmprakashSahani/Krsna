import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const deliveryEnv = {
  RESEND_API_KEY: "test-api-key",
  CONTACT_TO_EMAIL: "owner@example.test",
  CONTACT_FROM_EMAIL: "Portfolio <notes@example.test>",
};
const fetchMock = vi.fn<typeof fetch>();
let unexpectedFetchCalls = 0;

beforeEach(() => {
  unexpectedFetchCalls = 0;
  fetchMock.mockReset().mockImplementation(async () => {
    unexpectedFetchCalls += 1;
    throw new Error("Unexpected fetch: configure a response in this test");
  });
  vi.stubGlobal("fetch", fetchMock);
  for (const [name, value] of Object.entries(deliveryEnv)) vi.stubEnv(name, value);
});

afterEach(() => {
  try {
    // The handler catches fetch errors, so also fail outside its catch block.
    expect(unexpectedFetchCalls).toBe(0);
  } finally {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  }
});

function request(payload: unknown = { message: "Hello" }, headers: Record<string, string> = {}) {
  return new Request("https://portfolio.example.test/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(payload),
  });
}

async function expectFailure(input: Request, status: number, error: string) {
  const response = await POST(input);
  expect(response.status).toBe(status);
  expect(await response.json()).toEqual({ error });
  expect(fetchMock).not.toHaveBeenCalled();
}

async function expectSuccess(input: Request) {
  fetchMock.mockResolvedValueOnce(Response.json({ id: "test-delivery-id" }));
  const response = await POST(input);
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
  expect(fetchMock).toHaveBeenCalledTimes(1);
}

function sentPayload() {
  return JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
}

describe("POST /api/contact", () => {
  it.each([null, "text/plain"])("rejects content type %s", async (contentType) => {
    const input = request();
    if (contentType === null) input.headers.delete("Content-Type");
    else input.headers.set("Content-Type", contentType);
    await expectFailure(input, 415, "invalid_request");
  });

  it.each(["{", undefined])("rejects malformed or absent body %s", async (body) => {
    await expectFailure(new Request("https://portfolio.example.test/api/contact", {
      method: "POST", headers: { "Content-Type": "application/json" }, body,
    }), 400, "invalid_request");
  });

  it.each([
    ["null", null],
    ["array", []],
    ["missing message", {}],
    ["non-string message", { message: 123 }],
    ["unexpected field", { message: "Hello", extra: true }],
    ["client-supplied recipient", { message: "Hello", to: "attacker@example.test" }],
    ["empty message", { message: "" }],
    ["whitespace message", { message: " \n\t " }],
    ["3001-character message", { message: "a".repeat(3001) }],
  ])("rejects %s", async (_description, payload) => {
    await expectFailure(request(payload), 400, "invalid_message");
  });

  it("accepts a 3000-character message", async () => {
    await expectSuccess(request({ message: "a".repeat(3000) }));
  });

  it.each(["not-an-email", 123, null])("rejects invalid email %s", async (email) => {
    await expectFailure(request({ message: "Hello", email }), 400, "invalid_email");
  });

  describe.each(Object.keys(deliveryEnv))("required environment variable %s", (name) => {
    it.each([undefined, "", " \t "])("returns unavailable for %s", async (value) => {
      vi.stubEnv(name, value);
      await expectFailure(request(), 503, "unavailable");
    });
  });

  it("sends to the configured recipient with the configured sender and API key", async () => {
    await expectSuccess(request({ message: " Hello ", email: " visitor@example.test " }));
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(options?.method).toBe("POST");
    const headers = new Headers(options?.headers);
    expect(headers.get("Authorization")).toBe(`Bearer ${deliveryEnv.RESEND_API_KEY}`);
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(sentPayload()).toEqual({
      from: deliveryEnv.CONTACT_FROM_EMAIL,
      to: [deliveryEnv.CONTACT_TO_EMAIL],
      subject: "New portfolio note",
      text: "Message:\nHello\n\nReply email:\nvisitor@example.test",
      reply_to: "visitor@example.test",
    });
  });

  it.each([undefined, "", " \t "])("omits reply_to for anonymous email %s", async (email) => {
    await expectSuccess(request({ message: "Hello", ...(email === undefined ? {} : { email }) }));
    expect(sentPayload()).not.toHaveProperty("reply_to");
    expect(sentPayload().to).toEqual([deliveryEnv.CONTACT_TO_EMAIL]);
  });

  it.each([429, 500])("maps upstream HTTP %i to 502", async (status) => {
    fetchMock.mockResolvedValueOnce(new Response("upstream failure", { status }));
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "send_failed" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("maps a rejected fetch to 502", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Simulated network failure"));
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "send_failed" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([{}, { id: "" }, { id: 123 }, null])("rejects upstream success without a valid id: %j", async (body) => {
    fetchMock.mockResolvedValueOnce(Response.json(body));
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "send_failed" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["Origin", "https://other.example.test"],
    ["Sec-Fetch-Site", "cross-site"],
  ])("rejects cross-origin header %s before fetch", async (name, value) => {
    await expectFailure(request({ message: "Hello" }, { [name]: value }), 403, "invalid_request");
  });

  it("rejects Content-Length above 20000 bytes", async () => {
    await expectFailure(request({ message: "Hello" }, { "Content-Length": "20001" }), 413, "invalid_request");
  });

  it.each([undefined, "1"])("checks actual UTF-8 body bytes with Content-Length %s", async (length) => {
    const input = request({ message: "é".repeat(10000) });
    if (length !== undefined) input.headers.set("Content-Length", length);
    await expectFailure(input, 413, "invalid_request");
  });

  it("accepts a valid body of exactly 20000 bytes", async () => {
    const body = JSON.stringify({ message: "Hello" }).padEnd(20000, " ");
    await expectSuccess(new Request("https://portfolio.example.test/api/contact", {
      method: "POST", headers: { "Content-Type": "application/json", "Content-Length": "20000" }, body,
    }));
  });

  it("counts body bytes across multiple stream chunks", async () => {
    const body = JSON.stringify({ message: "Hello" }).padEnd(20001, " ");
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(body.slice(0, 12000)));
        controller.enqueue(encoder.encode(body.slice(12000)));
        controller.close();
      },
    });
    const init: RequestInit & { duplex: "half" } = {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: stream, duplex: "half",
    };
    await expectFailure(new Request("https://portfolio.example.test/api/contact", init), 413, "invalid_request");
  });
});
