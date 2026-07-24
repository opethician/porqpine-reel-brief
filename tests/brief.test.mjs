import assert from "node:assert/strict";
import test from "node:test";

import { PACKAGE_SCOPE, evaluateBrief } from "../lib/brief.mjs";

const validBrief = {
  footageMinutes: 4.5,
  outputSeconds: 30,
  captions: "simple",
  music: "free-library",
  deadline: "three-plus-days",
  creativeDirection:
    "Open on the finished result, show three concise steps, and close on the product.",
  footageReady: true,
  captionCopyReady: true,
  musicRightsConfirmed: false,
};

test("accepts a complete brief at the package limits", () => {
  const result = evaluateBrief(validBrief);

  assert.equal(result.fitStatus, "fits");
  assert.equal(result.fitLabel, "Fits the $10 package");
  assert.deepEqual(result.missingInputs, []);
  assert.deepEqual(result.risks, []);
  assert.equal(result.scope.priceUsd, 10);
  assert.equal(result.scope.maxOutputSeconds, 30);
  assert.equal(result.scope.maxSuppliedFootageMinutes, 5);
  assert.equal(result.scope.delivery, "1080 × 1920 MP4");
  assert.equal(result.scope.revisions, 1);
  assert.equal(result.deliveryChecklist.length, 7);
});

test("returns missing inputs for an incomplete brief", () => {
  const result = evaluateBrief({
    footageMinutes: "",
    outputSeconds: 0,
    captions: "simple",
    music: "free-library",
    deadline: "",
    creativeDirection: "Short",
    footageReady: false,
    captionCopyReady: false,
  });

  assert.equal(result.fitStatus, "incomplete");
  assert.ok(result.missingInputs.includes("Supplied footage length"));
  assert.ok(result.missingInputs.includes("Target output duration"));
  assert.ok(result.missingInputs.includes("Preferred delivery window"));
  assert.ok(
    result.missingInputs.includes("A short edit direction or intended message"),
  );
  assert.ok(
    result.missingInputs.includes(
      "Confirmation that supplied footage is ready",
    ),
  );
  assert.ok(result.missingInputs.includes("Caption copy or transcript"));
});

test("flags every requested dimension that sits outside the package", () => {
  const result = evaluateBrief({
    ...validBrief,
    footageMinutes: 7,
    outputSeconds: 42,
    captions: "styled",
    music: "paid-licence",
    deadline: "24-hours",
    captionCopyReady: false,
  });

  assert.equal(result.fitStatus, "needs-review");
  assert.equal(result.missingInputs.length, 0);
  assert.equal(result.risks.length, 5);
  assert.match(result.risks[0], /7 minutes/);
  assert.match(result.risks[1], /42-second/);
  assert.ok(result.risks.some((risk) => /Styled or animated/.test(risk)));
  assert.ok(result.risks.some((risk) => /paid music licence/.test(risk)));
  assert.ok(result.risks.some((risk) => /Rush turnaround/.test(risk)));
});

test("requires a rights confirmation for client-provided audio", () => {
  const result = evaluateBrief({
    ...validBrief,
    music: "client-provided",
    musicRightsConfirmed: false,
  });

  assert.equal(result.fitStatus, "incomplete");
  assert.ok(
    result.missingInputs.includes(
      "Confirmation of rights for client-provided music",
    ),
  );
  assert.ok(result.risks.some((risk) => /usage-rights/.test(risk)));
});

test("is deterministic and does not mutate the fixed package scope", () => {
  const first = evaluateBrief(validBrief);
  const second = evaluateBrief(structuredClone(validBrief));

  assert.deepEqual(first, second);
  assert.equal(Object.isFrozen(PACKAGE_SCOPE), true);
});

test("handles non-object input without throwing", () => {
  const result = evaluateBrief(null);

  assert.equal(result.fitStatus, "incomplete");
  assert.ok(result.missingInputs.length >= 6);
  assert.equal(result.validatedBrief.footageMinutes, null);
});
