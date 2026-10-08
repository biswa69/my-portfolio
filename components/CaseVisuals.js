// One visual per case study, each a different shape, so no two cases look alike.
// A visual shows how the result happened. It does not repeat the headline number
// or the notes beside it. Everything here is schematic: no figure is drawn to scale.

// Cohort automation: time, as two bars racing.
function Race() {
  return (
    <div className="vis race" aria-hidden="true">
      <div><label>Before</label><span className="lane"><i className="slow" /></span><b>~2 days</b></div>
      <div><label>After</label><span className="lane"><i className="fast" /></span><b>~5 min</b></div>
    </div>
  );
}

// Data migration: one policy is ~40 data points. 5 rows x 8 columns = 40 squares.
// o fine, s recorded out of line, g missing, w flagged data-quality issue.
const LEGACY = ["oosoogoo", "owoosoog", "goosowoo", "oowoosog", "soogowoo"];
const KIND = { s: "skew", g: "gap", w: "flag" };

function Records() {
  return (
    <div className="vis rec" role="img" aria-label="One policy has about 40 data points. In the legacy systems they are uneven and incomplete. In the new system every one is aligned.">
      <figure className="rec-panel">
        <div className="rec-grid">
          {LEGACY.flatMap((row, r) => [...row].map((k, c) => <i key={`${r}-${c}`} className={KIND[k]} />))}
        </div>
        <figcaption>Legacy systems</figcaption>
      </figure>
      <span className="vis-arrow" aria-hidden="true">→</span>
      <figure className="rec-panel">
        <div className="rec-grid ok">
          {Array.from({ length: 40 }, (_, n) => (
            <i key={n} style={{ "--d": `${(Math.floor(n / 8) + (n % 8)) * 40}ms` }} />
          ))}
        </div>
        <figcaption className="after">New system</figcaption>
      </figure>
      <p className="vis-cap">One policy. Each square is one data point.</p>
    </div>
  );
}

// KPI dashboards: separate trackers become one board with two KPI families.
function Merge() {
  return (
    <div className="vis mg" role="img" aria-label="Separate trackers become one dashboard holding operational and financial KPIs.">
      <div className="mg-sheets">{[0, 1, 2].map((n) => <i key={n} style={{ "--k": n }} />)}</div>
      <span className="vis-arrow" aria-hidden="true">→</span>
      <div className="mg-board">
        <div className="mg-top"><i /><i /><i /></div>
        <div className="mg-body">
          <div className="mg-panel">
            <span className="overline">Operational</span>
            <svg viewBox="0 0 120 56" preserveAspectRatio="none">
              {[0.4, 0.6, 0.5, 0.78, 0.66, 0.92].map((h, n) => (
                <rect key={n} className="mg-bar" x={4 + n * 19} y={56 - 52 * h} width="12" height={52 * h} rx="2" style={{ "--d": `${0.45 + n * 0.08}s` }} />
              ))}
            </svg>
          </div>
          <div className="mg-panel">
            <span className="overline">Financial</span>
            <svg className="wipe" viewBox="0 0 120 56" preserveAspectRatio="none">
              <polygon className="mg-area" points="4,44 24,38 44,42 64,28 84,31 104,16 116,12 116,56 4,56" />
              <polyline className="mg-line" points="4,44 24,38 44,42 64,28 84,31 104,16 116,12" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// AI voice bot: calls come in, a voice answers, a priority queue hands off to the CRM.
const WAVE = [22, 40, 58, 34, 70, 46, 62, 30, 50, 26, 18];

function Voice() {
  return (
    <div className="vis vc" role="img" aria-label="Inbound leads are answered by an AI voice bot, then queued by priority and handed off to the CRM.">
      <div className="vc-col">
        <span className="overline">Inbound leads</span>
        <ul className="vc-list">
          {[0, 1, 2, 3].map((n) => <li key={n} style={{ "--k": n }}><i /><b /></li>)}
        </ul>
      </div>
      <span className="vis-arrow" aria-hidden="true">→</span>
      <div className="vc-col">
        <span className="overline">AI voice bot</span>
        <div className="vc-wave">
          {WAVE.map((h, n) => <i key={n} style={{ "--h": h, "--i": n }} />)}
        </div>
      </div>
      <span className="vis-arrow" aria-hidden="true">→</span>
      <div className="vc-col">
        <span className="overline">CRM handoff</span>
        <ol className="vc-list vc-q">
          <li className="top" style={{ "--k": 4 }}><i /><em>Priority</em></li>
          {[5, 6, 7].map((n) => <li key={n} style={{ "--k": n }}><i /><b /></li>)}
        </ol>
      </div>
    </div>
  );
}

// Series-A fundraise: one set of metrics feeds two documents. The round is not closed, so its box is dashed.
function Raise() {
  return (
    <div className="vis fr" role="img" aria-label="Financial and operational metrics feed the investor pitch decks and the due diligence, which lead to the Series-A round, still in progress.">
      <div className="fr-node" style={{ "--k": 0 }}>Financial + operational metrics</div>
      <span className="fr-link a" />
      <div className="fr-mid">
        <div className="fr-node" style={{ "--k": 2 }}>Investor pitch decks</div>
        <div className="fr-node" style={{ "--k": 3 }}>Due diligence</div>
      </div>
      <span className="fr-link b" />
      <div className="fr-goal" style={{ "--k": 5 }}><i />Series-A</div>
    </div>
  );
}

// RM allocation: the same three leads, assigned two ways. Only the potential client moves.
const ROUTE = [
  {
    when: "Before", title: "Round-robin",
    muted: ["M0 16 H100", "M0 80 H100"], hot: "M0 48 H100",
    rms: [{}, { label: "Fresher", landed: true }, {}],
  },
  {
    when: "After", title: "By criteria",
    muted: ["M0 16 C55 16 45 48 100 48", "M0 80 H100"], hot: "M0 48 C55 48 45 16 100 16",
    rms: [{ label: "Right RM", ok: true }, {}, {}],
  },
];

const Check = () => (
  <svg className="rt-check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>
);

function Route() {
  return (
    <div className="vis rt" role="img" aria-label="Round-robin sent a potential client's lead to a fresher. Allocating by criteria sends it to the right relationship manager.">
      {ROUTE.map((r) => (
        <div className={`rt-row ${r.when.toLowerCase()}`} key={r.when}>
          <div className="rt-head"><span className="overline">{r.when}</span><b>{r.title}</b></div>
          <div className="rt-leads">
            <span className="rt-lead"><i /></span>
            <span className="rt-lead hot">Potential client<i /></span>
            <span className="rt-lead"><i /></span>
          </div>
          <svg className="rt-lines wipe" viewBox="0 0 100 96" preserveAspectRatio="none">
            {r.muted.map((d) => <path key={d} className="rt-p" d={d} />)}
            <path className="rt-p hot" d={r.hot} />
          </svg>
          <div className="rt-rms">
            {r.rms.map((m, n) => (
              <span key={n} className={`rt-rm${m.landed ? " landed" : ""}${m.ok ? " ok" : ""}`}>
                {m.label}{m.ok && <Check />}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const VISUALS = { race: Race, records: Records, merge: Merge, voice: Voice, raise: Raise, route: Route };

export function Vis({ type }) {
  const V = VISUALS[type];
  return V ? <V /> : null;
}
