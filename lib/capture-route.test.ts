import { test } from "node:test";
import assert from "node:assert/strict";
import { captureOriginAllowed } from "./capture-origin";
import { POST } from "../app/api/capture/route";

const deployment = "https://quote-manager-rosy.vercel.app";
function request(target: string, origin?: string, body?: Uint8Array) {
  return new Request(`${target}/api/capture`, {
    method: "POST",
    headers: origin ? { origin } : {},
    body: body ? Uint8Array.from(body) : undefined,
  });
}

test("capture access requires an exact approved same-origin request", () => {
  for (const origin of [deployment, "http://localhost:43123", "http://127.0.0.1:43124", "http://[::1]:43123"]) {
    assert.equal(captureOriginAllowed(request(origin, origin)), true);
  }
  for (const origin of ["https://another.vercel.app", `${deployment}.evil.test`, "http://quote-manager-rosy.vercel.app", "https://quote-manager-rosy.vercel.app:444"]) {
    assert.equal(captureOriginAllowed(request(origin, origin)), false);
  }
  for (const origin of [undefined, "null", "https://evil.test", `${deployment}/`]) {
    assert.equal(captureOriginAllowed(request(deployment, origin)), false);
  }
  const forwarded = request("https://evil.test", deployment);
  forwarded.headers.set("x-forwarded-host", "quote-manager-rosy.vercel.app");
  assert.equal(captureOriginAllowed(forwarded), false);
});

test("deployed route reports origin, configuration and body errors without provider calls", async (t) => {
  const originalKey = process.env.OPENAI_API_KEY;
  t.after(() => {
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  });
  const fetchMock = t.mock.method(globalThis, "fetch", async () => { throw new Error("Provider must not be called"); });
  const logs: unknown[][] = [];
  t.mock.method(console, "info", (...args: unknown[]) => logs.push(args));

  process.env.OPENAI_API_KEY = "test-secret-never-log";
  const forbidden = await POST(request("https://unapproved.vercel.app", "https://unapproved.vercel.app"));
  assert.equal(forbidden.status, 403);
  const empty = await POST(request(deployment, deployment));
  assert.equal(empty.status, 400);
  const body = await empty.json();
  assert.equal(body.requestId, empty.headers.get("x-request-id"));
  assert.equal(empty.headers.get("cache-control"), "no-store");

  delete process.env.OPENAI_API_KEY;
  assert.equal((await POST(request(deployment, deployment))).status, 503);
  assert.equal(fetchMock.mock.callCount(), 0);
  assert.match(JSON.stringify(logs), /origin_rejected/);
  assert.match(JSON.stringify(logs), /key_missing/);
  assert.ok(!JSON.stringify(logs).includes("test-secret-never-log"));
});

test("provider failure is correlated and a following capture can succeed", async (t) => {
  const originalKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test-secret-never-log";
  t.after(() => {
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  });
  const logs: unknown[][] = [];
  t.mock.method(console, "info", (...args: unknown[]) => logs.push(args));
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    if (++calls === 1) return new Response("private provider details", { status: 401 });
    return Response.json({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify({ message: "1 lona 2x1", warnings: [] }) }] }] });
  });
  const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const failure = await POST(request(deployment, deployment, png));
  assert.equal(failure.status, 502);
  const error = await failure.json();
  assert.match(JSON.stringify(logs), /provider_authorization/);
  assert.ok(JSON.stringify(logs).includes(error.requestId));
  assert.ok(!JSON.stringify(logs).includes("private provider details"));
  const success = await POST(request(deployment, deployment, png));
  assert.equal(success.status, 200);
  assert.equal((await success.json()).message, "1 lona 2x1");
});
