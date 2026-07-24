import { ReelBriefPlanner } from "./components/ReelBriefPlanner";
import { REEL_SERVICE_URL } from "@/lib/service";

const scopeItems = [
  ["01", "One edit", "A single focused 9:16 vertical video."],
  ["02", "Up to 30 seconds", "One finished cut, kept inside the package limit."],
  ["03", "Up to 5 min supplied", "Your raw footage is the source material."],
  ["04", "Simple captions", "Clean, readable on-screen caption treatment."],
  ["05", "Basic cleanup", "Foundational colour and audio tidying."],
  ["06", "Suitable free music", "A fitting free-music option when requested."],
  ["07", "1080 × 1920 MP4", "A platform-ready vertical master file."],
  ["08", "One revision", "One feedback round on the delivered draft."],
] as const;

const process = [
  {
    step: "01",
    title: "Frame the point",
    body: "Share the purpose, audience, must-keep moment, caption copy, and any reference direction.",
  },
  {
    step: "02",
    title: "Shape the cut",
    body: "A short hook, clear middle, and clean close give the edit a useful rhythm before work starts.",
  },
  {
    step: "03",
    title: "Finish the master",
    body: "The agreed cut receives simple captions, basic colour/audio cleanup, and suitable free music if selected.",
  },
  {
    step: "04",
    title: "Use the revision",
    body: "Review the 1080 × 1920 MP4 and consolidate requested changes into the included feedback round.",
  },
] as const;

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="porQpine Reel Brief home">
          <span className="wordmark-mark" aria-hidden="true">
            pQ
          </span>
          <span>
            porQpine
            <small>Reel Brief</small>
          </span>
        </a>
        <nav className="site-nav" aria-label="Primary navigation">
          <a href="#scope">Scope</a>
          <a href="#brief-planner">Plan your edit</a>
        </nav>
        <a
          className="price-pill"
          href={REEL_SERVICE_URL}
          target="_blank"
          rel="noreferrer"
        >
          <span>Order for</span>
          <strong>$10</strong>
        </a>
      </header>

      <main id="main-content">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              Vertical edit / <span>01 package</span>
            </p>
            <h1 id="hero-title">
              Cut the noise.
              <span>Keep the point.</span>
            </h1>
            <p className="hero-intro">
              One focused vertical edit for $10. Plan the cut, check your brief
              against the fixed package, and leave with a cleaner handoff.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#brief-planner">
                Build the brief
                <span aria-hidden="true">↘</span>
              </a>
              <a
                className="button button-secondary"
                href={REEL_SERVICE_URL}
                target="_blank"
                rel="noreferrer"
              >
                Order the $10 edit
                <span aria-hidden="true">↗</span>
              </a>
            </div>
            <p className="service-note">
              Independent planning companion for the linked Freelancer service.
              It does not place an order or promise a delivery date.
            </p>
          </div>

          <div className="hero-stage" aria-label="Abstract vertical video cut preview">
            <div className="stage-orbit stage-orbit-one" aria-hidden="true" />
            <div className="stage-orbit stage-orbit-two" aria-hidden="true" />
            <div className="reel-card">
              <div className="reel-topline">
                <span>9:16 / CUT 01</span>
                <span>00:30 MAX</span>
              </div>
              <div className="reel-frame">
                <div className="frame-number" aria-hidden="true">
                  09
                </div>
                <div className="caption-stack">
                  <span>Say one thing.</span>
                  <strong>Make it land.</strong>
                </div>
                <div className="reel-play" aria-hidden="true">
                  <span>▶</span>
                </div>
                <div className="reel-wave" aria-hidden="true">
                  {Array.from({ length: 19 }, (_, index) => (
                    <i key={index} />
                  ))}
                </div>
              </div>
              <div className="reel-footer">
                <span>1080 × 1920</span>
                <span>MP4</span>
              </div>
            </div>
            <div className="floating-note note-price">
              <span>Package</span>
              <strong>$10</strong>
            </div>
            <div className="floating-note note-revision">
              <span>Feedback</span>
              <strong>01 round</strong>
            </div>
          </div>
        </section>

        <section className="marquee" aria-label="Package summary">
          <div className="marquee-track">
            <span>One edit</span>
            <i aria-hidden="true">✦</i>
            <span>Up to 30 seconds</span>
            <i aria-hidden="true">✦</i>
            <span>9:16 vertical</span>
            <i aria-hidden="true">✦</i>
            <span>One revision</span>
            <i aria-hidden="true">✦</i>
          </div>
        </section>

        <section className="scope-section" id="scope" aria-labelledby="scope-title">
          <div className="section-heading">
            <p className="eyebrow">The fixed package</p>
            <h2 id="scope-title">
              Clear edges make
              <span>better edits.</span>
            </h2>
            <p>
              This is the complete $10 scope. The checker below helps surface
              anything that needs a separate conversation before work begins.
            </p>
          </div>
          <div className="scope-grid">
            {scopeItems.map(([number, title, body]) => (
              <article className="scope-card" key={number}>
                <span className="scope-number">{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="planner-section"
          id="brief-planner"
          aria-labelledby="planner-title"
        >
          <div className="planner-heading">
            <p className="eyebrow">Interactive scope check</p>
            <h2 id="planner-title">
              Map the cut.
              <span>Check the fit.</span>
            </h2>
            <p>
              Nothing is uploaded or saved. Your answers are assessed only to
              return a scope result and delivery checklist.
            </p>
          </div>
          <ReelBriefPlanner />
        </section>

        <section className="process-section" aria-labelledby="process-title">
          <div className="section-heading process-heading">
            <p className="eyebrow">A practical handoff</p>
            <h2 id="process-title">
              From raw footage
              <span>to one clean master.</span>
            </h2>
          </div>
          <div className="process-list">
            {process.map((item) => (
              <article key={item.step}>
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="exclusions-section" aria-labelledby="exclusions-title">
          <div>
            <p className="eyebrow">Outside this package</p>
            <h2 id="exclusions-title">What $10 does not include.</h2>
          </div>
          <ul>
            <li>Filming, footage sourcing, or file upload through this site</li>
            <li>Scriptwriting, content strategy, or performance guarantees</li>
            <li>Custom animation, complex motion graphics, or styled captions</li>
            <li>Paid music purchases or third-party licence procurement</li>
            <li>Extra versions, aspect ratios, cutdowns, or project files</li>
            <li>More than one revision or a guaranteed rush turnaround</li>
            <li>Publishing, account access, login, checkout, or payment handling</li>
            <li>Storage of footage, briefs, client details, or assessment results</li>
          </ul>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wordmark footer-wordmark">
          <span className="wordmark-mark" aria-hidden="true">
            pQ
          </span>
          <span>
            porQpine
            <small>Reel Brief</small>
          </span>
        </div>
        <p>
          Scope before spectacle.
          <br />
          One useful cut at a time.
        </p>
        <a href={REEL_SERVICE_URL} target="_blank" rel="noreferrer">
          Order the $10 edit <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </>
  );
}
