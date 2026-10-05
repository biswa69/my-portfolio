"use client";
import { useState } from "react";

const groups = [
  { id: "data", name: "Data", note: "Raw, messy data made usable", items: ["SQL (CTEs, window functions)", "Data wrangling", "Cohort analysis", "Customer segmentation"] },
  { id: "bi", name: "BI & Visualization", note: "Numbers made legible", items: ["Power BI", "Metabase", "Advanced Excel", "MIS reporting"] },
  { id: "product", name: "Product & Business", note: "Metrics that drive decisions", items: ["Funnel tracking", "KPI design", "Gap analysis", "Prioritization"] },
  { id: "auto", name: "Automation", note: "Manual work removed", items: ["n8n", "Python", "Web scraping"] },
  { id: "db", name: "Databases", note: "Where the data lives", items: ["MySQL", "PostgreSQL", "MongoDB", "Data migration"] },
];

// Five nodes around a centre. Angles in degrees, starting top and going clockwise.
const CX = 300, CY = 200, RX = 215, RY = 135;
const pos = groups.map((_, n) => {
  const a = ((-90 + n * 72) * Math.PI) / 180;
  return [CX + RX * Math.cos(a), CY + RY * Math.sin(a)];
});

export default function Skills() {
  const [a, setA] = useState(0);
  const g = groups[a];
  return (
    <div className="eco glow">
      <svg className="eco-svg" viewBox="0 0 600 400" role="img" aria-label="Skills connect into business decisions">
        <circle cx={CX} cy={CY} r="84" className="ring r1" />
        <circle cx={CX} cy={CY} r="140" className="ring r2" />
        {pos.map(([x, y], n) => (
          <line key={n} x1={CX} y1={CY} x2={x} y2={y} className={`eco-line ${a === n ? "on" : ""}`} />
        ))}
        <g>
          <circle cx={CX} cy={CY} r="46" className="eco-core" />
          <text x={CX} y={CY - 2} textAnchor="middle" className="eco-core-t">Business</text>
          <text x={CX} y={CY + 15} textAnchor="middle" className="eco-core-t">decisions</text>
        </g>
        {pos.map(([x, y], n) => (
          <g key={n} className={`eco-node ${a === n ? "on" : ""}`} onMouseEnter={() => setA(n)} onClick={() => setA(n)} tabIndex={0} role="button" aria-label={groups[n].name} onFocus={() => setA(n)}>
            <circle cx={x} cy={y} r="34" className="halo" />
            <circle cx={x} cy={y} r="26" className="dot" />
            <text x={x} y={y + 4} textAnchor="middle" className="n-i">{String(n + 1).padStart(2, "0")}</text>
            <text x={x} y={y + (y < CY ? -44 : 52)} textAnchor="middle" className="n-t">{groups[n].name}</text>
          </g>
        ))}
      </svg>
      <div className="eco-detail">
        <p className="eco-k">{String(a + 1).padStart(2, "0")} · {g.name}</p>
        <h3>{g.note}</h3>
        <div className="chips" key={g.id}>
          {g.items.map((it, n) => (
            <span key={it} className="chip" style={{ animationDelay: `${n * 70}ms` }}>{it}</span>
          ))}
        </div>
        <p className="eco-foot">Also: Git, VS Code. Hover or tap a node.</p>
      </div>
    </div>
  );
}
