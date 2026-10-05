const words = ["SQL", "Power BI", "Metabase", "Advanced Excel", "Cohort analysis", "KPI design", "Funnel tracking", "n8n", "Python", "PostgreSQL", "MySQL", "MongoDB", "Gap analysis", "MIS reporting", "Data migration"];

export default function Marquee() {
  const row = words.map((w) => (
    <span key={w}>{w}<i aria-hidden="true">✦</i></span>
  ));
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <div>{row}</div>
        <div>{row}</div>
      </div>
    </div>
  );
}
