import assert from "node:assert/strict";
import test from "node:test";

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

const environment = {
  ASSETS: {
    fetch: async () => new Response("Not found", { status: 404 }),
  },
};

const context = {
  waitUntil() {},
  passThroughOnException() {},
};

test("server-renders the finished portfolio surface", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    environment,
    context,
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.match(response.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);

  const html = await response.text();
  assert.match(html, /<title>porQpine Reel Brief/);
  assert.match(html, /Cut the noise\./);
  assert.match(html, /Keep the point\./);
  assert.match(html, /One focused vertical edit for \$10/);
  assert.match(html, /What \$10 does not include/);
  assert.match(html, /Nothing is uploaded or saved/);
  assert.match(html, /Order the \$10 edit/);
  assert.match(
    html,
    /https:\/\/www\.freelancer\.com\/service\/video_editing\/i-will-edit-your-vertical-short-video/,
  );
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
  assert.doesNotMatch(html, /react-loading-skeleton/);
});

test("POST /api/brief returns a deterministic fit response", async () => {
  const worker = await loadWorker();
  const requestBody = {
    footageMinutes: 2.5,
    outputSeconds: 22,
    captions: "none",
    music: "none",
    deadline: "flexible",
    creativeDirection:
      "Lead with the strongest reaction, keep the middle concise, and finish on the name.",
    footageReady: true,
    captionCopyReady: false,
    musicRightsConfirmed: false,
  };

  const response = await worker.fetch(
    new Request("http://localhost/api/brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    }),
    environment,
    context,
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /application\/json/i);
  assert.equal(response.headers.get("cache-control"), "no-store");

  const body = await response.json();
  assert.equal(body.fitStatus, "fits");
  assert.equal(body.scope.priceUsd, 10);
  assert.deepEqual(body.missingInputs, []);
  assert.deepEqual(body.risks, []);
  assert.ok(Array.isArray(body.deliveryChecklist));
  assert.match(body.disclaimer, /not an order/i);
});

test("POST /api/brief rejects malformed JSON", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/api/brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    }),
    environment,
    context,
  );

  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error.code, "INVALID_JSON");
});

test("POST /api/brief enforces media type and body limits", async () => {
  const worker = await loadWorker();
  const unsupported = await worker.fetch(
    new Request("http://localhost/api/brief", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "{}",
    }),
    environment,
    context,
  );
  assert.equal(unsupported.status, 415);

  const oversized = await worker.fetch(
    new Request("http://localhost/api/brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: `"${"x".repeat(12_001)}"`,
    }),
    environment,
    context,
  );
  assert.equal(oversized.status, 413);
  assert.equal(oversized.headers.get("x-content-type-options"), "nosniff");
});
