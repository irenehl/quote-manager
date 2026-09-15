import { test } from "node:test";
import assert from "node:assert/strict";
import {
  imageMime,
  MAX_CAPTURE_BYTES,
  parseReading,
  readCapture,
  readLimitedBody,
  VisionError,
} from "./vision";
const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
test("429 distinguishes exhausted quota from temporary rate limits without leaking provider messages", async () => {
  for (const code of ["credit_balance_exhausted", "organization_spend_limit_exceeded", "project_spend_limit_exceeded", "organization_usage_limit_exceeded", "slow_down"]) {
    await assert.rejects(() => readCapture(png, {
      apiKey: "test",
      fetcher: async () => Response.json({ error: { code } }, { status: 429 }),
    }), (error: unknown) => {
      assert.ok(error instanceof VisionError);
      assert.equal(error.code, code === "slow_down" ? "provider_rate_limit" : `provider_${code}`);
      return true;
    });
  }
  for (const [providerCode, expectedCode] of [
    ["insufficient_quota", "provider_insufficient_quota"],
    ["rate_limit_exceeded", "provider_rate_limit"],
    ["unknown_code", "provider_rate_or_quota"],
  ]) {
    for (const field of ["code", "type"]) {
      let calls = 0;
      await assert.rejects(
        () => readCapture(png, {
          apiKey: "test",
          fetcher: async () => {
            calls++;
            return Response.json({ error: { [field]: providerCode, message: "private provider details" } }, { status: 429 });
          },
        }),
        (error: unknown) => {
          assert.ok(error instanceof VisionError);
          assert.equal(error.code, expectedCode);
          assert.equal(error.status, 429);
          assert.ok(!error.message.includes("private provider details"));
          return true;
        },
      );
      assert.equal(calls, 1);
    }
  }
});
test("image signature and payload size are validated", async () => {
  assert.equal(imageMime(png), "image/png");
  assert.throws(() => imageMime(Buffer.from("<svg/>")));
  await assert.rejects(
    () =>
      readCapture(new Uint8Array(MAX_CAPTURE_BYTES + 1), { apiKey: "test" }),
    /4 MB/,
  );
  await assert.rejects(
    () =>
      readLimitedBody(
        new Request("http://localhost", {
          method: "POST",
          body: new Uint8Array(MAX_CAPTURE_BYTES + 1),
        }),
      ),
    /4 MB/,
  );
  assert.deepEqual(
    await readLimitedBody(
      new Request("http://localhost", { method: "POST", body: png }),
    ),
    Buffer.from(png),
  );
});
test("no API key means no provider request", async () => {
  let called = false;
  await assert.rejects(
    () =>
      readCapture(png, {
        apiKey: "",
        fetcher: async () => {
          called = true;
          return new Response();
        },
      }),
    /configurada/,
  );
  assert.equal(called, false);
});
test("provider request stays bounded and has no quote tools; result is untrusted text", async () => {
  const fetcher: typeof fetch = async (url, init) => {
    assert.equal(url, "https://api.openai.com/v1/responses");
    const body = JSON.parse(init!.body as string);
    assert.equal(body.store, false);
    assert.equal(body.max_output_tokens, 2200);
    assert.equal(body.tools, undefined);
    assert.equal(body.input[0].content[1].detail, "high");
    assert.equal(body.text.format.strict, true);
    return Response.json({
      status: "completed",
      output: [
        {
          type: "message",
          content: [
            {
              type: "output_text",
              text: JSON.stringify({
                message: "3 lonas 2x1",
                warnings: ["Nombre no visible."],
              }),
            },
          ],
        },
      ],
    });
  };
  assert.deepEqual(await readCapture(png, { apiKey: "test", fetcher }), {
    message: "3 lonas 2x1",
    warnings: ["Nombre no visible."],
  });
});
test("quota errors, refusals, incomplete and malformed outputs are not successful readings", async () => {
  for (const body of [
    { status: "incomplete" },
    {
      status: "completed",
      output: [
        { type: "message", content: [{ type: "refusal", refusal: "no" }] },
      ],
    },
    {
      status: "completed",
      output: [
        {
          type: "message",
          content: [{ type: "output_text", text: "invalid JSON" }],
        },
      ],
    },
  ])
    await assert.rejects(() =>
      readCapture(png, {
        apiKey: "test",
        fetcher: async () => Response.json(body),
      }),
    );
  await assert.rejects(
    () =>
      readCapture(png, {
        apiKey: "test",
        fetcher: async () =>
          new Response("private upstream error", { status: 429 }),
      }),
    /cuota/,
  );
  await assert.rejects(
    () =>
      readCapture(png, {
        apiKey: "test",
        fetcher: async () => new Response("secret", { status: 401 }),
      }),
    /configuración/,
  );
});
test("empty, oversized and incorrectly typed readings are rejected", () => {
  for (const value of [
    { message: "", warnings: [] },
    { message: "x".repeat(5001), warnings: [] },
    { message: "ok", warnings: [42] },
    { message: "ok", warnings: Array(13).fill("x") },
  ])
    assert.throws(() => parseReading(value));
});
