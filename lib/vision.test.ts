import { test } from "node:test";
import assert from "node:assert/strict";
import {
  imageMime,
  MAX_CAPTURE_BYTES,
  parseReading,
  readCapture,
  readLimitedBody,
} from "./vision";
const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
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
