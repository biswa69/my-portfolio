"use client";
import { useEffect, useRef, useState } from "react";

const steps = [
  { k: "Data", t: "I can work with raw, messy information.", d: "Before any chart, there is cleaning: fixing data-quality and recording issues, and migrating 90,000+ policies out of legacy systems.", f: ["SQL", "Data cleaning", "Data migration"] },
  { k: "Analysis", t: "I find the patterns, trends and gaps.", d: "Cohort analysis, customer segmentation and gap analysis, written in SQL with CTEs and window functions.", f: ["Cohort analysis", "Segmentation", "Gap analysis"] },
  { k: "Business", t: "I connect insight to a real problem.", d: "Company-level financial and operational metric analysis behind a Rs. 100 Cr Series-A fundraise that is still in progress: pitch decks and due diligence.", f: ["Rs. 100 Cr Series-A (in progress)", "Due diligence"] },
  { k: "Product", t: "I think in users, metrics and funnels.", d: "Queue management, prioritization and CRM handoffs for a 0-to-1 AI voice bot pilot, plus LSQ activity tracking for offline RM-assisted journeys.", f: ["Funnel tracking", "Prioritization", "KPI design"] },
  { k: "Automation", t: "I remove repetitive manual work.", d: "A client cohort analysis framework that cut turnaround from about 2 days to about 5 minutes.", f: ["~2 days → ~5 min", "n8n", "Python"] },
  { k: "Visualization", t: "I turn complexity into a dashboard.", d: "Centralized Power BI and Metabase dashboards tracking operational and financial KPIs, built on standardized logic.", f: ["Power BI", "Metabase", "MIS reporting"] },
  { k: "Impact", t: "I help teams decide faster, and better.", d: "End-to-end business visibility for management, and reporting that is ready for root cause analysis.", f: ["Faster decisions", "RCA-ready reporting"] },
];

export default function Story() {
  const [i, setI] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setI(Number(e.target.dataset.i))),
      { rootMargin: "-42% 0px -50% 0px" }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="story">
      <div className="story-stick">
        <div className="story-big" aria-hidden="true">
          <span className="story-n">{String(i + 1).padStart(2, "0")}</span>
          <span className="story-w" key={i}>{steps[i].k}</span>
        </div>
        <ol className="story-dots" aria-label="Story progress">
          {steps.map((s, n) => (
            <li key={s.k}>
              <button
                className={n === i ? "on" : n < i ? "done" : ""}
                aria-label={s.k}
                onClick={() => refs.current[n]?.scrollIntoView({ behavior: "smooth", block: "center" })}
              />
            </li>
          ))}
        </ol>
        <div className="story-rail"><i style={{ transform: `scaleY(${(i + 1) / steps.length})` }} /></div>
      </div>
      <div className="story-cards">
        {steps.map((s, n) => (
          <article key={s.k} data-i={n} ref={(el) => (refs.current[n] = el)} className={`scard glow ${n === i ? "active" : ""}`}>
            <span className="scard-k">{String(n + 1).padStart(2, "0")} · {s.k}</span>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
            <div className="scard-f">{s.f.map((x) => <span key={x}>{x}</span>)}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
