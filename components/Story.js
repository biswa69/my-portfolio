"use client";
import { useState } from "react";

const steps = [
  { k: "Data", t: "Raw and messy information", d: "Cleaning and transforming raw UPI transaction data with Advanced Excel and SQL. Migrating 90,000+ policies from legacy systems." },
  { k: "Analysis", t: "Patterns, gaps, opportunities", d: "Cohort analysis, customer segmentation and gap analysis, written in SQL with CTEs and window functions." },
  { k: "Business", t: "Tied to real problems", d: "Financial and operational metric analysis behind a Rs. 100 Cr Series-A fundraise: pitch decks and due diligence." },
  { k: "Product", t: "Users, metrics, outcomes", d: "Lead prioritization, queue management and CRM handoffs for a 0-to-1 AI voice bot pilot. Activity tracking for offline RM-assisted journeys." },
  { k: "Automation", t: "Repetitive work removed", d: "A client cohort analysis framework that cut turnaround from ~2 days to ~5 minutes." },
  { k: "Visualization", t: "Complex made clear", d: "Centralized Power BI and Metabase dashboards tracking operational and financial KPIs." },
  { k: "Impact", t: "Faster, better decisions", d: "Standardized KPI logic that gives management end-to-end business visibility." },
];

export default function Story() {
  const [i, setI] = useState(0);
  const s = steps[i];
  return (
    <div className="story">
      <ol className="story-rail" role="tablist" aria-label="Portfolio story">
        {steps.map((x, n) => (
          <li key={x.k}>
            <button
              role="tab"
              aria-selected={n === i}
              className={n === i ? "on" : n < i ? "done" : ""}
              onClick={() => setI(n)}
            >
              <span className="num">{String(n + 1).padStart(2, "0")}</span>
              {x.k}
            </button>
          </li>
        ))}
      </ol>
      <div className="story-body" role="tabpanel">
        <h3>{s.t}</h3>
        <p>{s.d}</p>
      </div>
    </div>
  );
}
