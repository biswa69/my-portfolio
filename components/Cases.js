"use client";
import { useState } from "react";
import { Vis } from "./CaseVisuals";

const cases = [
  {
    id: "cohort",
    tab: "Cohort automation",
    tag: "Business analytics · Automation",
    title: "Client cohort analysis, rebuilt as an automated framework",
    hero: ["~2 days", "~5 min"],
    label: "turnaround time",
    problem: "Cohort analysis of clients took around two days each time it was run.",
    did: "Engineered an automated client cohort analysis framework, then used it to formulate customer segmentation strategies.",
    outcome: "Turnaround dropped to about 5 minutes, and segments could be used to evaluate cross-sell and upsell performance.",
    baseline: "Around two days per run, every time.",
    visual: "race",
  },
  {
    id: "migration",
    tab: "Data migration",
    tag: "Data & process transformation",
    title: "Moving 90,000+ policies off legacy systems",
    hero: [null, "90,000+"],
    label: "policies migrated, ~40 data points each",
    problem: "Policy data lived in legacy systems and was not structured for root cause analysis.",
    did: "Led the end-to-end migration across ~40 data points, restructuring architectures for 12K direct and 40K partner clients.",
    outcome: "Data landed in a structure that enables RCA-ready reporting.",
    baseline: "Data-quality issues and past recording issues meant hours of cleaning, then the data was fed into Metabase or Power BI by hand.",
    next: "More real-time tracking for KMPs.",
    visual: "records",
  },
  {
    id: "dash",
    tab: "KPI dashboards",
    tag: "Dashboarding",
    title: "One place for operational and financial KPIs",
    hero: ["Separate Excel trackers", "One dashboard"],
    label: "Power BI + Metabase",
    problem: "Teams needed a consistent view of operational and financial performance.",
    did: "Developed centralized Power BI and Metabase dashboards and standardized the KPI logic behind them.",
    outcome: "End-to-end business visibility and faster management decision-making.",
    baseline: "KPIs lived in several separate Excel trackers, which was inconvenient for key managerial personnel (KMPs).",
    visual: "merge",
  },
  {
    id: "bot",
    tab: "AI voice bot pilot",
    tag: "Product thinking · Operations",
    title: "A 0-to-1 AI voice bot pilot for inbound leads",
    hero: [null, "3,000+"],
    label: "daily inbound leads qualified",
    problem: "A high volume of inbound leads needed qualifying and routing.",
    did: "Drove the Greylabs AI voice bot pilot and optimized auto-dialer workflows by defining queue management, prioritization and CRM handoffs.",
    outcome: "A pilot qualifying 3,000+ daily inbound leads.",
    baseline: "The ABM team manually called each person to qualify them as a lead, which cost more.",
    visual: "voice",
  },
  {
    id: "fundraise",
    tab: "Series-A fundraise",
    tag: "Fundraising · Investor analytics",
    status: "In progress",
    title: "The metrics behind a Rs. 100 Cr Series-A fundraise",
    hero: [null, "Rs. 100 Cr"],
    label: "Series-A fundraise in progress, supported with analysis",
    problem: "The Series-A fundraise needed clear company-level financial and operational metrics behind the story told to investors.",
    did: "Spearheaded company-level financial and operational metric analysis supporting the fundraise.",
    outcome: "Contributing critical insights for investor pitch decks and due diligence while the round is in progress.",
    baseline: "Not shareable.",
    visual: "raise",
  },
  {
    id: "allocation",
    tab: "RM allocation",
    tag: "Revenue operations · Lead allocation",
    title: "Allocating leads to relationship managers across India",
    hero: [null, "+30%"],
    label: "revenue vs before the new RM allocation logic",
    problem: "Leads, including offline RM-assisted journeys, needed to reach the right relationship manager.",
    did: "Owned RM allocation logic across India, assigning leads by entity type, revenue and GWP, and defined LSQ activity tracking for offline RM-assisted journeys.",
    outcome: "More selling, and 30% more revenue than before.",
    baseline: "Leads were assigned round-robin, so leads from potential clients often went to freshers.",
    visual: "route",
    memo: [
      ["Before", "Round-robin: potential clients' leads went to freshers"],
      ["Criteria", "Entity type · Revenue · GWP"],
      ["Decision", "Assign each lead to an RM on those criteria, across India"],
      ["Result", "30% more revenue than before"],
    ],
  },
];

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
          <Vis type={c.visual} />
          {c.memo && (
            <dl className="memo">
              {c.memo.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd className={v.startsWith("[") ? "ph" : ""}>{v}</dd></div>
              ))}
            </dl>
          )}
        </div>
        <dl className="case-notes">
          {[["Problem", c.problem], ["Baseline", c.baseline], ["What I did", c.did], ["Outcome", c.outcome], ["What I’d improve", c.next]].filter(([, v]) => v).map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd className={v.startsWith("[") ? "ph" : ""}>{v}</dd></div>
          ))}
        </dl>
      </article>
    </div>
  );
}
