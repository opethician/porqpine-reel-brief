export const PACKAGE_SCOPE = Object.freeze({
  priceUsd: 10,
  edits: 1,
  aspectRatio: "9:16",
  maxOutputSeconds: 30,
  maxSuppliedFootageMinutes: 5,
  captions: "Simple captions",
  finishing: "Basic colour and audio cleanup",
  music: "Suitable free music",
  delivery: "1080 × 1920 MP4",
  revisions: 1,
});

const CAPTION_OPTIONS = new Set(["simple", "none", "styled"]);
const MUSIC_OPTIONS = new Set([
  "free-library",
  "none",
  "client-provided",
  "paid-licence",
]);
const DEADLINE_OPTIONS = new Set([
  "flexible",
  "three-plus-days",
  "48-hours",
  "24-hours",
]);
const MAX_CREATIVE_DIRECTION_LENGTH = 240;

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readPositiveNumber(value) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function readChoice(value, allowed) {
  return typeof value === "string" && allowed.has(value) ? value : null;
}

function unique(items) {
  return [...new Set(items)];
}

/**
 * Evaluate a proposed reel brief against the fixed package.
 *
 * The function is intentionally pure: it reads no clock, storage, network,
 * account, or environment state, so the same input always returns the same
 * result.
 */
export function evaluateBrief(rawInput) {
  const input = isRecord(rawInput) ? rawInput : {};
  const missingInputs = [];
  const risks = [];
  const issues = [];
  let needsReview = false;

  const footageMinutes = readPositiveNumber(input.footageMinutes);
  if (footageMinutes === null) {
    missingInputs.push("Supplied footage length");
    issues.push("Enter a footage length greater than zero.");
  } else if (footageMinutes > PACKAGE_SCOPE.maxSuppliedFootageMinutes) {
    needsReview = true;
    risks.push(
      `Supplied footage is ${footageMinutes} minutes; the package limit is ${PACKAGE_SCOPE.maxSuppliedFootageMinutes} minutes.`,
    );
  }

  const outputSeconds = readPositiveNumber(input.outputSeconds);
  if (outputSeconds === null) {
    missingInputs.push("Target output duration");
    issues.push("Enter a target duration greater than zero.");
  } else if (outputSeconds > PACKAGE_SCOPE.maxOutputSeconds) {
    needsReview = true;
    risks.push(
      `The requested ${outputSeconds}-second output exceeds the ${PACKAGE_SCOPE.maxOutputSeconds}-second package limit.`,
    );
  }

  const captions = readChoice(input.captions, CAPTION_OPTIONS);
  if (captions === null) {
    missingInputs.push("Caption choice");
    issues.push("Choose simple captions, no captions, or styled captions.");
  } else if (captions === "styled") {
    needsReview = true;
    risks.push(
      "Styled or animated captions are outside the simple-caption package.",
    );
  }

  const music = readChoice(input.music, MUSIC_OPTIONS);
  if (music === null) {
    missingInputs.push("Music choice");
    issues.push(
      "Choose suitable free music, no music, client-provided music, or a paid-licence request.",
    );
  } else if (music === "client-provided") {
    needsReview = true;
    risks.push(
      "Client-provided music needs a separate usage-rights confirmation.",
    );
    if (input.musicRightsConfirmed !== true) {
      missingInputs.push("Confirmation of rights for client-provided music");
    }
  } else if (music === "paid-licence") {
    needsReview = true;
    risks.push(
      "Purchasing or procuring a paid music licence is outside this package.",
    );
  }

  const deadline = readChoice(input.deadline, DEADLINE_OPTIONS);
  if (deadline === null) {
    missingInputs.push("Preferred delivery window");
    issues.push("Choose a delivery window.");
  } else if (deadline === "24-hours" || deadline === "48-hours") {
    needsReview = true;
    risks.push(
      "Rush turnaround is not included and must be confirmed before work starts.",
    );
  }

  const creativeDirection =
    typeof input.creativeDirection === "string"
      ? input.creativeDirection.trim()
      : "";
  if (creativeDirection.length < 10) {
    missingInputs.push("A short edit direction or intended message");
    issues.push("Add at least 10 characters describing what the edit should say.");
  } else if (creativeDirection.length > MAX_CREATIVE_DIRECTION_LENGTH) {
    missingInputs.push("A shorter edit direction");
    issues.push(
      `Keep the edit direction within ${MAX_CREATIVE_DIRECTION_LENGTH} characters.`,
    );
  }

  if (input.footageReady !== true) {
    missingInputs.push("Confirmation that supplied footage is ready");
  }

  if (captions === "simple" && input.captionCopyReady !== true) {
    missingInputs.push("Caption copy or transcript");
  }

  const normalizedMissingInputs = unique(missingInputs);
  const normalizedRisks = unique(risks);
  const normalizedIssues = unique(issues);

  const fitStatus =
    normalizedMissingInputs.length > 0
      ? "incomplete"
      : needsReview
        ? "needs-review"
        : "fits";

  const fitLabel = {
    incomplete: "More details needed",
    "needs-review": "Needs a scope conversation",
    fits: "Fits the $10 package",
  }[fitStatus];

  const deliveryChecklist = [
    `One supplied-footage folder totalling no more than ${PACKAGE_SCOPE.maxSuppliedFootageMinutes} minutes`,
    "A concise edit direction, key message, and must-keep moments",
    captions === "simple"
      ? "Final caption copy or a checked transcript"
      : "Written confirmation that captions are not required",
    music === "client-provided"
      ? "The chosen audio file plus confirmation of usage rights"
      : music === "none"
        ? "Written confirmation that no music is required"
        : "Music mood or reference direction",
    "Any optional logo, brand colours, or visual reference in a separate handoff",
    "A confirmed delivery date before editing begins",
    "One consolidated feedback list for the included revision",
  ];

  return {
    fitStatus,
    fitLabel,
    scope: PACKAGE_SCOPE,
    missingInputs: normalizedMissingInputs,
    risks: normalizedRisks,
    issues: normalizedIssues,
    deliveryChecklist,
    validatedBrief: {
      footageMinutes,
      outputSeconds,
      captions,
      music,
      deadline,
      creativeDirection,
      footageReady: input.footageReady === true,
      captionCopyReady: input.captionCopyReady === true,
      musicRightsConfirmed: input.musicRightsConfirmed === true,
    },
    disclaimer:
      "This result checks package fit only. It is not an order, quote, delivery promise, or acceptance of work.",
  };
}
