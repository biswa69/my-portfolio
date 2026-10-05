"use client";
import { useState } from "react";

const cases = [
  {
    id: "cohort",
    tab: "Cohort Automation",
    tag: "Business Analytics · Automation",
    title: "Client cohort analysis, rebuilt as an automated framework",
    hero: { from: "~2 days", to: "~5 min", label: "turnaround time" },
    flow: ["Client data", "Cohort framework", "Segments", "Cross-sell / upsell view"],
    problem: "Cohort analysis of clients took around two days each time it was run.",
    did: "Engineered an automated client cohort analysis framework, then used it to formulate customer segmentation strategies.",
    outcome: "Turnaround dropped to about 5 minutes, and segments could be used to evaluate cross-sell and upsell performance.",
  },
  {
    id: "migration",
    tab: "Data Migration",
    tag: "Data / Process Transformation",
    title: "Moving 90,000+ policies off legacy systems",
    hero: { from: "Legacy", to: "Vaatun", label: "90,000+ policies · ~40 data points" },
    flow: ["Legacy systems", "Restructure architecture", "Vaatun", "RCA-ready reporting"],
    problem: "Policy data lived in legacy systems and was not structured for root cause analysis.",
    did: "Led the end-to-end migration across ~40 data points, restructuring architectures for 12K direct and 40K partner clients.",
    outcome: "Data landed in a structure that enables RCA-ready reporting.",
  },
  {
    id: "dash",
    tab: "KPI Dashboards",
    tag: "Dashboarding",
    title: "One place for operational and financial KPIs",
    hero: { from: "Scattered logic", to: "One standard", label: "Power BI + Metabase" },
    flow: ["Raw data", "Standardized logic", "Power BI / Metabase", "Management decisions"],
    problem: "Teams needed a consistent view of operational and financial performance.",
    did: "Developed centralized Power BI and Metabase dashboards and standardized the KPI logic behind them.",
    outcome: "End-to-end business visibility and faster management decision-making.",
  },
  {
    id: "bot",
    tab: "AI Voice Bot Pilot",
    tag: "Product Thinking · Operations",
    title: "A 0-to-1 AI voice bot pilot for inbound leads",
    hero: { from: "0", to: "3,000+", label: "daily inbound leads qualified" },
    flow: ["Inbound lead", "Voice bot qualifies", "Queue + priority", "CRM handoff"],
    problem: "A high volume of inbound leads needed qualifying and routing.",
    did: "Drove the Greylabs AI voice bot pilot and optimized auto-dialer workflows by defining queue management, prioritization and CRM handoffs.",
    outcome: "A pilot qualifying 3,000+ daily inbound leads.",
  },
  {
    id: "growth",
    tab: "Revenue & Growth",
    tag: "Revenue / Growth Analysis",
    title: "Metrics behind a Rs. 100 Cr Series-A, and smarter lead allocation",
    hero: { from: "Rs. 100 Cr", to: "Series-A", label: "fundraise supported" },
    flow: ["Financial + operational metrics", "Pitch decks & due diligence", "RM allocation logic", "Relationship coverage"],
    problem: "The company needed rigorous metrics for investors, and a fair, effective way to allocate leads to relationship managers.",
    did: "Ran company-level financial and operational metric analysis. Owned RM allocation logic across India, assigning leads by entity type, revenue and GWP, and defined LSQ activity tracking for offline RM-assisted journeys.",
    outcome: "Critical insights for investor pitch decks and due diligence, and better relationship coverage.",
  },
  {
    id: "upi",
    tab: "UPI Dashboard",
    tag: "Project · Data Cleaning & Reporting",
    title: "UPI Transaction Analytics Dashboard",
    hero: { from: "Raw", to: "Reliable", label: "Excel · SQL · VLOOKUP · XLOOKUP" },
    flow: ["Raw UPI data", "Clean + transform", "Reconcile sources", "Interactive dashboard"],
    problem: "Raw transaction data from multiple sources needed a trustworthy base for performance reporting.",
    did: "Cleaned and transformed the data with Advanced Excel and SQL, and integrated multi-source datasets to streamline reconciliation.",
    outcome: "An interactive dashboard tracking payment trends, revenue and business KPIs.",
  },
];

export default function Cases() {
  const [id, setId] = useState(cases[0].id);
  const c = cases.find((x) => x.id === id);
  return (
    <div className="cases">
      <div className="case-tabs" role="tablist">
        {cases.map((x) => (
          <button key={x.id} role="tab" aria-selected={x.id === id} className={x.id === id ? "on" : ""} onClick={() => setId(x.id)}>
            {x.tab}
          </button>
        ))}
      </div>
      <article className="case" key={c.id}>
        <div className="case-main">
          <span className="tag">{c.tag}</span>
          <h3>{c.title}</h3>
          <div className="hero-metric">
            <span className="from">{c.hero.from}</span>
            <span className="arrow">→</span>
            <span className="to">{c.hero.to}</span>
          </div>
          <p className="hm-label">{c.hero.label}</p>
          <ol className="flow">
            {c.flow.map((f, n) => (
              <li key={f} style={{ animationDelay: `${n * 90}ms` }}>
                {f}
              </li>
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
