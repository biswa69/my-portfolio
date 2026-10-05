"use client";
import { useState } from "react";

const groups = [
  { id: "data", name: "Data", note: "Working with raw, messy data", items: ["SQL (CTEs, window functions)", "Data Wrangling", "Cohort Analysis", "Customer Segmentation"] },
  { id: "bi", name: "BI & Visualization", note: "Making numbers legible", items: ["Power BI", "Metabase", "Advanced Excel", "MIS Reporting"] },
  { id: "product", name: "Product & Business", note: "Metrics that drive decisions", items: ["Funnel Tracking", "KPI Design", "Gap Analysis", "Prioritization"] },
  { id: "auto", name: "Automation", note: "Removing manual work", items: ["n8n", "Python", "Web Scraping"] },
  { id: "db", name: "Databases", note: "Where the data lives", items: ["MySQL", "PostgreSQL", "MongoDB", "Data Migration"] },
];

export default function Skills() {
  const [a, setA] = useState("data");
  return (
    <div className="eco">
      <div className="eco-nodes">
        {groups.map((g) => (
          <button key={g.id} className={a === g.id ? "node on" : "node"} onClick={() => setA(g.id)} onMouseEnter={() => setA(g.id)}>
            <b>{g.name}</b>
            <small>{g.note}</small>
          </button>
        ))}
      </div>
      <div className="eco-detail">
        {groups.map((g) => (
          <div key={g.id} className={a === g.id ? "chips show" : "chips"}>
            {g.items.map((it, n) => (
              <span key={it} className="chip" style={{ animationDelay: `${n * 60}ms` }}>
                <i>→</i> {it}
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="eco-foot">Also: Git, VS Code. Hover or tap a category to explore it.</p>
    </div>
  );
}
