"use client";
import { useState } from "react";
import Counter from "./Counter";

const cases = [
  {
    id: "cohort",
    tab: "Cohort automation",
    tag: "Business analytics · Automation",
    title: "Client cohort analysis, rebuilt as an automated framework",
    hero: ["~2 days", "~5 min"],
    label: "turnaround time",
    flow: ["Client data", "Cohort framework", "Segments", "Cross-sell / upsell view"],
    problem: "Cohort analysis of clients took around two days each time it was run.",
    did: "Engineered an automated client cohort analysis framework, then used it to formulate customer segmentation strategies.",
    outcome: "Turnaround dropped to about 5 minutes, and segments could be used to evaluate cross-sell and upsell performance.",
    visual: { type: "race" },
  },
  {
    id: "migration",
    tab: "Data migration",
    tag: "Data & process transformation",
    title: "Moving 90,000+ policies off legacy systems",
    hero: ["Legacy", "Vaatun"],
    label: "~40 data points per policy",
    flow: ["Legacy systems", "Restructure architecture", "Vaatun", "RCA-ready reporting"],
    problem: "Policy data lived in legacy systems and was not structured for root cause analysis.",
    did: "Led the end-to-end migration across ~40 data points, restructuring architectures for 12K direct and 40K partner clients.",
    outcome: "Data landed in a structure that enables RCA-ready reporting.",
    visual: { type: "stream", from: "Legacy systems", to: "Vaatun", n: 90000, suffix: "+", cap: "policies migrated" },
  },
  {
    id: "dash",
    tab: "KPI dashboards",
    tag: "Dashboarding",
    title: "One place for operational and financial KPIs",
    hero: ["Scattered logic", "One standard"],
    label: "Power BI + Metabase",
    flow: ["Raw data", "Standardized logic", "Power BI / Metabase", "Management decisions"],
    problem: "Teams needed a consistent view of operational and financial performance.",
    did: "Developed centralized Power BI and Metabase dashboards and standardized the KPI logic behind them.",
    outcome: "End-to-end business visibility and faster management decision-making.",
    visual: { type: "dash" },
  },
  {
    id: "bot",
    tab: "AI voice bot pilot",
    tag: "Product thinking · Operations",
    title: "A 0-to-1 AI voice bot pilot for inbound leads",
    hero: ["0", "3,000+"],
    label: "daily inbound leads qualified",
    flow: ["Inbound lead", "Voice bot qualifies", "Queue + priority", "CRM handoff"],
    problem: "A high volume of inbound leads needed qualifying and routing.",
    did: "Drove the Greylabs AI voice bot pilot and optimized auto-dialer workflows by defining queue management, prioritization and CRM handoffs.",
    outcome: "A pilot qualifying 3,000+ daily inbound leads.",
    visual: { type: "stream", from: "Inbound leads", to: "CRM", n: 3000, suffix: "+", cap: "daily inbound leads" },
  },
  {
    id: "fundraise",
    tab: "Series-A fundraise",
    tag: "Fundraising · Investor analytics",
    status: "In progress",
    title: "The metrics behind a Rs. 100 Cr Series-A fundraise",
    hero: [null, "Rs. 100 Cr"],
    label: "Series-A fundraise in progress, supported with analysis",
    flow: ["Financial + operational metrics", "Investor pitch decks", "Due diligence", "Series-A (in progress)"],
    problem: "The Series-A fundraise needed clear company-level financial and operational metrics behind the story told to investors.",
    did: "Spearheaded company-level financial and operational metric analysis supporting the fundraise.",
    outcome: "Contributing critical insights for investor pitch decks and due diligence while the round is in progress.",
    visual: { type: "dash" },
  },
  {
    id: "allocation",
    tab: "RM allocation",
    tag: "Revenue operations · Lead allocation",
    title: "Allocating leads to relationship managers across India",
    hero: [null, "India-wide"],
    label: "RM allocation logic owned",
    flow: ["Incoming lead", "Entity type, revenue, GWP", "RM allocation", "Relationship coverage"],
    problem: "Leads, including offline RM-assisted journeys, needed to reach the right relationship manager.",
    did: "Owned RM allocation logic across India, assigning leads by entity type, revenue and GWP, and defined LSQ activity tracking for offline RM-assisted journeys.",
    outcome: "Optimized relationship coverage across India.",
    visual: { type: "route" },
  },
  {
    id: "upi",
    tab: "UPI dashboard",
    tag: "Project · Data cleaning & reporting",
    title: "UPI Transaction Analytics Dashboard",
    hero: ["Raw", "Reliable"],
    label: "Excel · SQL · VLOOKUP · XLOOKUP",
    flow: ["Raw UPI data", "Clean + transform", "Reconcile sources", "Interactive dashboard"],
    problem: "Raw transaction data from multiple sources needed a trustworthy base for performance reporting.",
    did: "Cleaned and transformed the data with Advanced Excel and SQL, and integrated multi-source datasets to streamline reconciliation.",
    outcome: "An interactive dashboard tracking payment trends, revenue and business KPIs.",
    visual: { type: "dash" },
  },
];

function Race() {
  return (
    <div className="vis race" aria-hidden="true">
      <div><label>Before</label><span className="lane"><i className="slow" /></span><b>~2 days</b></div>
      <div><label>After</label><span className="lane"><i className="fast" /></span><b>~5 min</b></div>
    </div>
  );
}

function Stream({ v }) {
  return (
    <div className="vis stream">
      <div className="stream-track" aria-hidden="true">
        <span className="node">{v.from}</span>
        <span className="pipe">{Array.from({ length: 14 }, (_, n) => <i key={n} style={{ animationDelay: `${n * 0.28}s` }} />)}</span>
        <span className="node end">{v.to}</span>
      </div>
      <p className="stream-n"><Counter to={v.n} suffix={v.suffix} /> <span>{v.cap}</span></p>
    </div>
  );
}

function Dash() {
  return (
    <div className="vis dash" aria-hidden="true">
      <div className="dash-top"><i /><i /><i /></div>
      <div className="dash-tiles"><b /><b /><b /></div>
      <svg viewBox="0 0 240 90" preserveAspectRatio="none">
        {[0.35, 0.5, 0.42, 0.62, 0.55, 0.75, 0.7, 0.9].map((h, n) => (
          <rect key={n} x={8 + n * 29} y={90 - 80 * h} width="18" height={80 * h} rx="3" className="dbar" style={{ animationDelay: `${n * 0.09}s` }} />
        ))}
        <polyline className="dline" points="17,52 46,44 75,50 104,34 133,40 162,24 191,28 220,12" />
      </svg>
    </div>
  );
}

function Route() {
  const L = ["Entity type", "Revenue", "GWP"];
  return (
    <div className="vis route" aria-hidden="true">
      <svg viewBox="0 0 260 144">
        {L.map((t, n) => (
          <g key={t}>
            <rect x="0" y={10 + n * 40} width="84" height="26" rx="13" className="r-in" />
            <text x="42" y={27 + n * 40} textAnchor="middle" className="r-t">{t}</text>
            {[0, 1, 2, 3].map((m) => (
              <path key={m} d={`M84 ${23 + n * 40} C 150 ${23 + n * 40}, 150 ${20 + m * 30}, 214 ${20 + m * 30}`} className="r-p" style={{ animationDelay: `${(n + m) * 0.2}s` }} />
            ))}
          </g>
        ))}
        {[0, 1, 2, 3].map((m) => <circle key={m} cx="224" cy={20 + m * 30} r="9" className="r-n" style={{ animationDelay: `${m * 0.25}s` }} />)}
        <text x="224" y="140" textAnchor="middle" className="r-t">RMs</text>
      </svg>
    </div>
  );
}

const Vis = ({ v }) => (v.type === "race" ? <Race /> : v.type === "stream" ? <Stream v={v} /> : v.type === "route" ? <Route /> : <Dash />);

export default function Cases() {
  const [id, setId] = useState(cases[0].id);
  const c = cases.find((x) => x.id === id);
  return (
    <div className="cases">
      <div className="case-tabs seg" role="tablist" aria-label="Case studies">
        {cases.map((x) => (
          <button key={x.id} role="tab" aria-selected={x.id === id} className={x.id === id ? "on" : ""} onClick={() => setId(x.id)}>
            {x.tab}
          </button>
        ))}
      </div>
      <article className="case glow" key={c.id} role="tabpanel">
        <div className="case-main">
          <div className="tag-row">
            <span className="tag">{c.tag}</span>
            {c.status && <span className="status"><i aria-hidden="true" />{c.status}</span>}
          </div>
          <h3>{c.title}</h3>
          <div className="hero-metric">
            {c.hero[0] && (
              <>
                <span className="from">{c.hero[0]}</span>
                <span className="arrow">→</span>
              </>
            )}
            <span className="to">{c.hero[1]}</span>
          </div>
          <p className="hm-label">{c.label}</p>
          <Vis v={c.visual} />
          <ol className="flow">
            {c.flow.map((f, n) => (
              <li key={f} style={{ "--d": `${n * 0.9}s` }}>{f}</li>
            ))}
          </ol>
        </div>
        <dl className="case-notes">
          <div><dt>Problem</dt><dd>{c.problem}</dd></div>
          <div><dt>What I did</dt><dd>{c.did}</dd></div>
          <div><dt>Outcome</dt><dd>{c.outcome}</dd></div>
        </dl>
      </article>
    </div>
  );
}
