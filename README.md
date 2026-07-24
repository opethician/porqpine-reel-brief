# porQpine Reel Brief

A polished, single-page scope companion for the porQpine
[vertical short video service](https://www.freelancer.com/service/video_editing/i-will-edit-your-vertical-short-video).
It presents the exact fixed-price package, lets a client plan a simple
hook/core/close timeline, previews the brief in the browser, and checks the
proposed work through a deterministic API.

The product is deliberately narrow. It makes no performance, turnaround, or
acceptance claims.

## Published package represented

The fixed **$10** scope is:

- one `9:16` edit up to `30 seconds`
- up to `5 minutes` of supplied footage
- simple captions
- basic colour and audio cleanup
- suitable free music
- one `1080 × 1920 MP4`
- one revision

Anything beyond those edges is labelled as needing a separate scope
conversation; it is never silently treated as included.

## Product behaviour

The interactive form controls:

- supplied-footage and output duration
- hook/core/close timeline allocation
- caption and music treatment
- preferred delivery window
- creative direction and handoff-readiness checks

The preview summary is client-side and updates as form choices change. Submitting
the form sends a small JSON brief to `POST /api/brief`. The endpoint returns:

- `fitStatus`: `fits`, `needs-review`, or `incomplete`
- the canonical package `scope`
- `missingInputs`
- `risks`
- validation `issues`
- a tailored `deliveryChecklist`
- a normalized `validatedBrief`
- a plain-language disclaimer

The evaluation lives in `lib/brief.mjs` as a pure function. It reads no clock,
network, account, storage, or environment state, so the same input produces the
same response.

## Explicit non-goals

This project has:

- no footage or asset upload
- no login or account access
- no checkout, payment, or order placement
- no database, browser storage, or server-side persistence
- no external API, AI model, analytics, or third-party service calls
- no email, messaging, publishing, or platform automation
- no licence verification

Brief data is evaluated for the response only. The application does not store
it.

## Local development

Prerequisite: Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Production validation:

```bash
npm run build
npm test
npm run lint
npx tsc --noEmit
```

`npm test` runs unit coverage for the package-fit rules and integration coverage
against the built Worker for the page and API route. Run `npm run build` first
because the integration tests import `dist/server/index.js`.

## API example

```http
POST /api/brief
Content-Type: application/json
```

```json
{
  "footageMinutes": 4,
  "outputSeconds": 28,
  "captions": "simple",
  "music": "free-library",
  "deadline": "three-plus-days",
  "creativeDirection": "Open on the result, show the three useful steps, then close on the product name.",
  "footageReady": true,
  "captionCopyReady": true,
  "musicRightsConfirmed": false
}
```

Recognized caption values are `simple`, `none`, and `styled`. Recognized music
values are `free-library`, `none`, `client-provided`, and `paid-licence`.
Recognized deadline values are `flexible`, `three-plus-days`, `48-hours`, and
`24-hours`.

Malformed JSON returns HTTP `400`. A structurally valid JSON payload returns
HTTP `200` with a fit result; incomplete fields are described in the response
rather than treated as a transport error.

## Key files

- `app/page.tsx` — portfolio content and package presentation
- `app/components/ReelBriefPlanner.tsx` — interactive planner and preview
- `app/api/brief/route.ts` — JSON endpoint
- `lib/brief.mjs` — deterministic validation rules
- `app/globals.css` — responsive editorial/cinematic design system
- `tests/brief.test.mjs` — rule-level tests
- `tests/site-render.test.mjs` — rendered page and API integration tests
- `.openai/hosting.json` — confirms no D1 or R2 resources
