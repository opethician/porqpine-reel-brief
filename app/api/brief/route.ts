import { evaluateBrief } from "../../../lib/brief.mjs";

const MAX_BODY_BYTES = 12_000;

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: Request) {
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  ) {
    return json(
      {
        error: {
          code: "UNSUPPORTED_MEDIA_TYPE",
          message: "Send the brief as application/json.",
        },
      },
      415,
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json(
      {
        error: {
          code: "PAYLOAD_TOO_LARGE",
          message: "Keep the brief under 12 KB and do not include files.",
        },
      },
      413,
    );
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return json(
      {
        error: {
          code: "PAYLOAD_TOO_LARGE",
          message: "Keep the brief under 12 KB and do not include files.",
        },
      },
      413,
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(raw);
  } catch {
    return json(
      {
        error: {
          code: "INVALID_JSON",
          message: "Send the brief as a valid JSON object.",
        },
      },
      400,
    );
  }

  return json(evaluateBrief(payload));
}
