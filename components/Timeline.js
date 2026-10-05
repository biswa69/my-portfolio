// Study and work on one shared timeline, drawn to scale from the resume dates.
// Months are counted from Jan 2019; the work bar runs to "now" (build date).
const m = (y, mo) => (y - 2019) * 12 + (mo - 1);

const now = new Date();
const END = m(now.getFullYear(), now.getMonth() + 1) + 1;
const YEARS = Array.from({ length: now.getFullYear() - 2019 + 1 }, (_, i) => 2019 + i);

const pct = (v) => `${((v / END) * 100).toFixed(2)}%`;
const span = (a, b) => ({ "--s": pct(a), "--w": pct(b - a) });

const edu = [
  { id: "BCA", from: m(2019, 10), to: m(2022, 10), label: "BCA", note: "Bachelor of Computer Application · Oct 2019 – Oct 2022" },
  { id: "MCA", from: m(2023, 11), to: m(2025, 11), label: "MCA", note: "Master of Computer Application, Data Science · Nov 2023 – Nov 2025" },
];
const work = { from: m(2025, 11), to: END, label: "BimaKavach", note: "Business Analyst (Product & Analytics) · Nov 2025 – Present" };

export default function Timeline() {
  return (
    <div className="tl" data-reveal>
      <div className="tl-grid" role="img" aria-label="Timeline from 2019 to today: BCA 2019 to 2022, MCA 2023 to 2025, BimaKavach from November 2025">
        <div className="tl-axis" aria-hidden="true">
          {YEARS.map((y) => (
            <span key={y} style={{ left: pct(m(y, 1)) }}>{y}</span>
          ))}
        </div>
        <div className="tl-row">
          <span className="tl-name">Study</span>
          <div className="tl-lane">
            {edu.map((e, i) => (
              <span key={e.id} className="tl-bar" style={{ ...span(e.from, e.to), "--i": i }}><b>{e.label}</b></span>
            ))}
          </div>
        </div>
        <div className="tl-row">
          <span className="tl-name">Work</span>
          <div className="tl-lane">
            <span className="tl-bar work" style={{ ...span(work.from, work.to), "--i": 2 }}><b>{work.label}</b></span>
          </div>
        </div>
      </div>
      <ul className="tl-legend">
        {[...edu, work].map((e) => (
          <li key={e.id || "w"}><i className={e === work ? "work" : ""} aria-hidden="true" />{e.note}</li>
        ))}
      </ul>
    </div>
  );
}
