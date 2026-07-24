"use client";

import { type FormEvent, useMemo, useState } from "react";

type CaptionChoice = "simple" | "none" | "styled";
type MusicChoice =
  | "free-library"
  | "none"
  | "client-provided"
  | "paid-licence";
type DeadlineChoice =
  | "flexible"
  | "three-plus-days"
  | "48-hours"
  | "24-hours";

type BriefState = {
  footageMinutes: number;
  outputSeconds: number;
  hookSeconds: number;
  closeSeconds: number;
  captions: CaptionChoice;
  music: MusicChoice;
  deadline: DeadlineChoice;
  creativeDirection: string;
  footageReady: boolean;
  captionCopyReady: boolean;
  musicRightsConfirmed: boolean;
};

type AssessmentResult = {
  fitStatus: "fits" | "needs-review" | "incomplete";
  fitLabel: string;
  scope: {
    priceUsd: number;
    edits: number;
    aspectRatio: string;
    maxOutputSeconds: number;
    maxSuppliedFootageMinutes: number;
    captions: string;
    finishing: string;
    music: string;
    delivery: string;
    revisions: number;
  };
  missingInputs: string[];
  risks: string[];
  issues: string[];
  deliveryChecklist: string[];
  disclaimer: string;
};

const initialBrief: BriefState = {
  footageMinutes: 3,
  outputSeconds: 24,
  hookSeconds: 3,
  closeSeconds: 3,
  captions: "simple",
  music: "free-library",
  deadline: "three-plus-days",
  creativeDirection: "",
  footageReady: false,
  captionCopyReady: false,
  musicRightsConfirmed: false,
};

const captionLabels: Record<CaptionChoice, string> = {
  simple: "Simple captions",
  none: "No captions",
  styled: "Styled / animated",
};

const musicLabels: Record<MusicChoice, string> = {
  "free-library": "Suitable free music",
  none: "No music",
  "client-provided": "I will provide audio",
  "paid-licence": "Paid/licensed track",
};

const deadlineLabels: Record<DeadlineChoice, string> = {
  flexible: "Flexible",
  "three-plus-days": "3+ days",
  "48-hours": "Within 48 hours",
  "24-hours": "Within 24 hours",
};

function ChoiceCard<T extends string>({
  name,
  value,
  checked,
  title,
  detail,
  onChange,
}: {
  name: string;
  value: T;
  checked: boolean;
  title: string;
  detail: string;
  onChange: (value: T) => void;
}) {
  return (
    <label className="choice-card" data-selected={checked ? "true" : "false"}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
      />
      <span className="choice-indicator" aria-hidden="true" />
      <span>
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
    </label>
  );
}

export function ReelBriefPlanner() {
  const [brief, setBrief] = useState(initialBrief);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [requestError, setRequestError] = useState("");

  const bodySeconds = Math.max(
    1,
    brief.outputSeconds - brief.hookSeconds - brief.closeSeconds,
  );

  const preview = useMemo(() => {
    const missing =
      brief.creativeDirection.trim().length < 10 ||
      !brief.footageReady ||
      (brief.captions === "simple" && !brief.captionCopyReady) ||
      (brief.music === "client-provided" && !brief.musicRightsConfirmed);
    const outside =
      brief.footageMinutes > 5 ||
      brief.outputSeconds > 30 ||
      brief.captions === "styled" ||
      brief.music === "client-provided" ||
      brief.music === "paid-licence" ||
      brief.deadline === "24-hours" ||
      brief.deadline === "48-hours";

    if (missing) {
      return {
        label: "Needs details",
        tone: "incomplete",
        note: "Complete the handoff details before checking the package.",
      };
    }

    if (outside) {
      return {
        label: "Likely needs review",
        tone: "review",
        note: "At least one choice sits outside the fixed package.",
      };
    }

    return {
      label: "Likely fits",
      tone: "fit",
      note: "Your current selections sit inside the published limits.",
    };
  }, [brief]);

  function updateOutput(nextOutput: number) {
    setBrief((current) => {
      const closeSeconds = Math.min(
        current.closeSeconds,
        Math.max(1, nextOutput - 2),
      );
      const hookSeconds = Math.min(
        current.hookSeconds,
        Math.max(1, nextOutput - closeSeconds - 1),
      );

      return {
        ...current,
        outputSeconds: nextOutput,
        hookSeconds,
        closeSeconds,
      };
    });
    setAssessment(null);
  }

  async function checkBrief(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsChecking(true);
    setRequestError("");

    try {
      const response = await fetch("/api/brief", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(brief),
      });

      if (!response.ok) {
        throw new Error("The scope checker could not read this brief.");
      }

      setAssessment((await response.json()) as AssessmentResult);
    } catch {
      setRequestError(
        "The scope checker is unavailable right now. Your form entries remain in this page only.",
      );
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <form className="brief-workspace" onSubmit={checkBrief}>
      <div className="brief-form">
        <div className="form-step">
          <div className="form-step-heading">
            <span>01</span>
            <div>
              <h3>Set the boundaries</h3>
              <p>Use the sliders to describe the material and finished cut.</p>
            </div>
          </div>

          <div className="range-grid">
            <label className="range-field">
              <span>
                Supplied footage
                <output>{brief.footageMinutes} min</output>
              </span>
              <input
                type="range"
                min="0.5"
                max="8"
                step="0.5"
                value={brief.footageMinutes}
                onChange={(event) => {
                  setBrief((current) => ({
                    ...current,
                    footageMinutes: Number(event.target.value),
                  }));
                  setAssessment(null);
                }}
              />
              <small>Package limit: up to 5 minutes supplied</small>
            </label>

            <label className="range-field">
              <span>
                Finished duration
                <output>{brief.outputSeconds} sec</output>
              </span>
              <input
                type="range"
                min="10"
                max="45"
                step="1"
                value={brief.outputSeconds}
                onChange={(event) => updateOutput(Number(event.target.value))}
              />
              <small>Package limit: up to 30 seconds finished</small>
            </label>
          </div>
        </div>

        <div className="form-step">
          <div className="form-step-heading">
            <span>02</span>
            <div>
              <h3>Map the timeline</h3>
              <p>Reserve time for the hook and close; the middle fills itself.</p>
            </div>
          </div>

          <div className="timeline-controls">
            <label className="compact-range">
              <span>Hook</span>
              <input
                type="range"
                min="1"
                max={Math.max(1, brief.outputSeconds - brief.closeSeconds - 1)}
                value={brief.hookSeconds}
                onChange={(event) => {
                  setBrief((current) => ({
                    ...current,
                    hookSeconds: Number(event.target.value),
                  }));
                  setAssessment(null);
                }}
              />
              <output>{brief.hookSeconds}s</output>
            </label>
            <label className="compact-range">
              <span>Close</span>
              <input
                type="range"
                min="1"
                max={Math.max(1, brief.outputSeconds - brief.hookSeconds - 1)}
                value={brief.closeSeconds}
                onChange={(event) => {
                  setBrief((current) => ({
                    ...current,
                    closeSeconds: Number(event.target.value),
                  }));
                  setAssessment(null);
                }}
              />
              <output>{brief.closeSeconds}s</output>
            </label>
          </div>

          <div
            className="cut-timeline"
            role="img"
            aria-label={`Planned timeline: ${brief.hookSeconds} seconds hook, ${bodySeconds} seconds core, ${brief.closeSeconds} seconds close`}
          >
            <div
              className="timeline-segment timeline-hook"
              style={{
                flexBasis: `${(brief.hookSeconds / brief.outputSeconds) * 100}%`,
              }}
            >
              <span>Hook</span>
              <strong>{brief.hookSeconds}s</strong>
            </div>
            <div
              className="timeline-segment timeline-body"
              style={{
                flexBasis: `${(bodySeconds / brief.outputSeconds) * 100}%`,
              }}
            >
              <span>Core</span>
              <strong>{bodySeconds}s</strong>
            </div>
            <div
              className="timeline-segment timeline-close"
              style={{
                flexBasis: `${(brief.closeSeconds / brief.outputSeconds) * 100}%`,
              }}
            >
              <span>Close</span>
              <strong>{brief.closeSeconds}s</strong>
            </div>
          </div>
        </div>

        <fieldset className="form-step">
          <legend className="form-step-heading">
            <span>03</span>
            <span>
              <strong>Choose the finish</strong>
              <small>Simple treatment is included; complex work is flagged.</small>
            </span>
          </legend>

          <div className="choice-group">
            <span className="group-label">Captions</span>
            <div className="choice-grid choice-grid-three">
              <ChoiceCard
                name="captions"
                value="simple"
                checked={brief.captions === "simple"}
                title="Simple"
                detail="Included"
                onChange={(captions) => {
                  setBrief((current) => ({ ...current, captions }));
                  setAssessment(null);
                }}
              />
              <ChoiceCard
                name="captions"
                value="none"
                checked={brief.captions === "none"}
                title="None"
                detail="Opt out"
                onChange={(captions) => {
                  setBrief((current) => ({ ...current, captions }));
                  setAssessment(null);
                }}
              />
              <ChoiceCard
                name="captions"
                value="styled"
                checked={brief.captions === "styled"}
                title="Styled"
                detail="Needs review"
                onChange={(captions) => {
                  setBrief((current) => ({ ...current, captions }));
                  setAssessment(null);
                }}
              />
            </div>
          </div>

          <div className="choice-group">
            <span className="group-label">Music</span>
            <div className="choice-grid">
              <ChoiceCard
                name="music"
                value="free-library"
                checked={brief.music === "free-library"}
                title="Suitable free music"
                detail="Included"
                onChange={(music) => {
                  setBrief((current) => ({ ...current, music }));
                  setAssessment(null);
                }}
              />
              <ChoiceCard
                name="music"
                value="none"
                checked={brief.music === "none"}
                title="No music"
                detail="Dialogue / natural sound"
                onChange={(music) => {
                  setBrief((current) => ({ ...current, music }));
                  setAssessment(null);
                }}
              />
              <ChoiceCard
                name="music"
                value="client-provided"
                checked={brief.music === "client-provided"}
                title="My own audio"
                detail="Rights check needed"
                onChange={(music) => {
                  setBrief((current) => ({ ...current, music }));
                  setAssessment(null);
                }}
              />
              <ChoiceCard
                name="music"
                value="paid-licence"
                checked={brief.music === "paid-licence"}
                title="Paid track"
                detail="Outside scope"
                onChange={(music) => {
                  setBrief((current) => ({ ...current, music }));
                  setAssessment(null);
                }}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="form-step">
          <legend className="form-step-heading">
            <span>04</span>
            <span>
              <strong>Set the handoff</strong>
              <small>Deadline choices are requests until explicitly confirmed.</small>
            </span>
          </legend>

          <div className="choice-group">
            <span className="group-label">Preferred delivery window</span>
            <div className="choice-grid">
              <ChoiceCard
                name="deadline"
                value="flexible"
                checked={brief.deadline === "flexible"}
                title="Flexible"
                detail="Confirm together"
                onChange={(deadline) => {
                  setBrief((current) => ({ ...current, deadline }));
                  setAssessment(null);
                }}
              />
              <ChoiceCard
                name="deadline"
                value="three-plus-days"
                checked={brief.deadline === "three-plus-days"}
                title="3+ days"
                detail="Proposed window"
                onChange={(deadline) => {
                  setBrief((current) => ({ ...current, deadline }));
                  setAssessment(null);
                }}
              />
              <ChoiceCard
                name="deadline"
                value="48-hours"
                checked={brief.deadline === "48-hours"}
                title="48 hours"
                detail="Rush review"
                onChange={(deadline) => {
                  setBrief((current) => ({ ...current, deadline }));
                  setAssessment(null);
                }}
              />
              <ChoiceCard
                name="deadline"
                value="24-hours"
                checked={brief.deadline === "24-hours"}
                title="24 hours"
                detail="Rush review"
                onChange={(deadline) => {
                  setBrief((current) => ({ ...current, deadline }));
                  setAssessment(null);
                }}
              />
            </div>
          </div>

          <label className="text-field">
            <span>
              What should the edit say?
              <small>{brief.creativeDirection.trim().length}/240</small>
            </span>
            <textarea
              value={brief.creativeDirection}
              maxLength={240}
              rows={4}
              placeholder="Example: Open on the result, show the three quickest steps, then close on the product name."
              onChange={(event) => {
                setBrief((current) => ({
                  ...current,
                  creativeDirection: event.target.value,
                }));
                setAssessment(null);
              }}
              aria-describedby="direction-help"
            />
            <small id="direction-help">
              Add the key message, intended audience, and any must-keep moment.
            </small>
          </label>

          <div className="check-list">
            <label>
              <input
                type="checkbox"
                checked={brief.footageReady}
                onChange={(event) => {
                  setBrief((current) => ({
                    ...current,
                    footageReady: event.target.checked,
                  }));
                  setAssessment(null);
                }}
              />
              <span>
                <strong>Supplied footage is ready</strong>
                <small>No upload happens here.</small>
              </span>
            </label>

            {brief.captions === "simple" && (
              <label>
                <input
                  type="checkbox"
                  checked={brief.captionCopyReady}
                  onChange={(event) => {
                    setBrief((current) => ({
                      ...current,
                      captionCopyReady: event.target.checked,
                    }));
                    setAssessment(null);
                  }}
                />
                <span>
                  <strong>Caption copy or transcript is ready</strong>
                  <small>Final wording reduces avoidable revisions.</small>
                </span>
              </label>
            )}

            {brief.music === "client-provided" && (
              <label>
                <input
                  type="checkbox"
                  checked={brief.musicRightsConfirmed}
                  onChange={(event) => {
                    setBrief((current) => ({
                      ...current,
                      musicRightsConfirmed: event.target.checked,
                    }));
                    setAssessment(null);
                  }}
                />
                <span>
                  <strong>I can confirm usage rights for this audio</strong>
                  <small>The checker does not verify licences.</small>
                </span>
              </label>
            )}
          </div>
        </fieldset>

        <button className="button button-submit" type="submit" disabled={isChecking}>
          {isChecking ? "Checking the brief…" : "Check package fit"}
          <span aria-hidden="true">{isChecking ? "•••" : "→"}</span>
        </button>

        {requestError && (
          <p className="request-error" role="alert">
            {requestError}
          </p>
        )}
      </div>

      <aside className="brief-summary" aria-labelledby="preview-title">
        <div className="summary-topline">
          <p className="eyebrow">Live preview</p>
          <span className="summary-price">$10</span>
        </div>
        <h3 id="preview-title">Your reel, at a glance.</h3>

        <div className="preview-format">
          <div className="mini-frame" aria-hidden="true">
            <span>9:16</span>
            <i />
            <strong>{brief.outputSeconds}s</strong>
          </div>
          <div>
            <span>Output</span>
            <strong>1080 × 1920 MP4</strong>
            <small>One vertical master</small>
          </div>
        </div>

        <dl className="summary-list">
          <div>
            <dt>Supplied footage</dt>
            <dd>{brief.footageMinutes} minutes</dd>
          </div>
          <div>
            <dt>Cut map</dt>
            <dd>
              {brief.hookSeconds}s / {bodySeconds}s / {brief.closeSeconds}s
            </dd>
          </div>
          <div>
            <dt>Captions</dt>
            <dd>{captionLabels[brief.captions]}</dd>
          </div>
          <div>
            <dt>Music</dt>
            <dd>{musicLabels[brief.music]}</dd>
          </div>
          <div>
            <dt>Window</dt>
            <dd>{deadlineLabels[brief.deadline]}</dd>
          </div>
          <div>
            <dt>Revision</dt>
            <dd>One round</dd>
          </div>
        </dl>

        <div className="preview-fit" data-tone={preview.tone}>
          <span aria-hidden="true" />
          <div>
            <strong>{preview.label}</strong>
            <p>{preview.note}</p>
          </div>
        </div>

        <p className="preview-disclaimer">
          Planning preview only. No files, login, checkout, order, or project
          data are stored here.
        </p>

        <div className="assessment-region" aria-live="polite" aria-atomic="true">
          {assessment && (
            <section
              className="assessment-card"
              data-status={assessment.fitStatus}
              aria-labelledby="assessment-title"
            >
              <p>Scope result</p>
              <h4 id="assessment-title">{assessment.fitLabel}</h4>

              {assessment.missingInputs.length > 0 && (
                <div>
                  <h5>Still needed</h5>
                  <ul>
                    {assessment.missingInputs.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {assessment.risks.length > 0 && (
                <div>
                  <h5>Scope flags</h5>
                  <ul>
                    {assessment.risks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h5>Delivery checklist</h5>
                <ol>
                  {assessment.deliveryChecklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </div>

              <small>{assessment.disclaimer}</small>
            </section>
          )}
        </div>
      </aside>
    </form>
  );
}
