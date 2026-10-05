"use client";
import { useEffect, useRef, useState } from "react";

const BARS = [0.3, 0.45, 0.38, 0.55, 0.5, 0.66, 0.6, 0.78, 0.72, 0.92];
const STAGES = ["Ingesting raw data", "Cleaning & validating", "Modeling the metrics", "Rendering the dashboard"];

// Loading advances stage by stage with a short pause at each milestone, like real work,
// instead of one smooth sweep through every number.
const SEGMENTS = [
  { to: 24, ms: 700 }, { hold: 200 },
  { to: 52, ms: 650 }, { hold: 200 },
  { to: 78, ms: 600 }, { hold: 180 },
  { to: 100, ms: 520 },
];
const TOTAL = SEGMENTS.reduce((a, s) => a + (s.ms || s.hold), 0);
const easeInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

function progressAt(t) {
  let at = 0;
  let from = 0;
  for (const s of SEGMENTS) {
    if (s.hold) {
      if (t < at + s.hold) return from;
      at += s.hold;
    } else {
      if (t < at + s.ms) return from + (s.to - from) * easeInOut((t - at) / s.ms);
      at += s.ms;
      from = s.to;
    }
  }
  return 100;
}

// Rolling digits: each place is a vertical strip that slides to the right number.
function Odometer({ value }) {
  const digits = String(value).split("");
  return (
    <span className="odo" aria-hidden="true">
      {digits.map((d, i) => (
        <span className="odo-d" key={digits.length - 1 - i}>
          <span className="odo-strip" style={{ "--d": d }}>
            {Array.from({ length: 10 }, (_, n) => <i key={n}>{n}</i>)}
          </span>
        </span>
      ))}
      <span className="odo-pct">%</span>
    </span>
  );
}

export default function Preloader() {
  const [p, setP] = useState(0);
  const [phase, setPhase] = useState("run"); // run | out | gone
  const skip = useRef(null);

  useEffect(() => {
    const d = document.documentElement;
    if (d.classList.contains("seen")) {
      d.classList.add("ready");
      setPhase("gone");
      return;
    }
    let raf = 0;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      setP(100);
      setPhase("out");
      setTimeout(() => d.classList.add("ready"), 250);
      try { sessionStorage.setItem("seen", "1"); } catch {}
      setTimeout(() => setPhase("gone"), 1200);
    };
    skip.current = finish;
    const start = performance.now();
    const tick = (t) => {
      const el = t - start;
      setP(Math.round(progressAt(el)));
      if (el < TOTAL) raf = requestAnimationFrame(tick);
      else setTimeout(finish, 350);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("keydown", finish);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", finish);
    };
  }, []);

  if (phase === "gone") return null;
  const stage = p >= 100 ? 4 : p >= 78 ? 3 : p >= 52 ? 2 : p >= 24 ? 1 : 0;

  return (
    <div className={`preloader ${phase === "out" ? "out" : ""}`} role="progressbar" aria-label="Loading portfolio" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p} onClick={() => skip.current?.()}>
      <div className="pre-inner">
        <p className="pre-tag">DATA × PRODUCT × BUSINESS</p>
        <svg className="pre-chart" viewBox="0 0 300 120" aria-hidden="true">
          <line x1="0" y1="110" x2="300" y2="110" className="pre-axis" />
          {BARS.map((b, i) => {
            const h = 100 * b * Math.min(1, (p / 100) * 1.15);
            const jitter = p < 100 ? Math.sin(p * 0.35 + i * 1.7) * (1 - p / 100) * 14 : 0;
            const hh = Math.max(3, h + jitter);
            return <rect key={i} x={i * 30 + 6} y={110 - hh} width="18" height={hh} rx="4" className={`pre-bar b${i % 3}`} />;
          })}
          <polyline
            className="pre-line"
            points={BARS.map((b, i) => `${i * 30 + 15},${110 - 100 * b * Math.min(1, (p / 100) * 1.15)}`).join(" ")}
            style={{ opacity: p > 55 ? 1 : 0 }}
          />
        </svg>
        <div className="pre-meter">
          <Odometer value={p} />
          <ul className="pre-stages">
            {STAGES.map((s, i) => (
              <li key={s} className={i < stage ? "done" : i === stage ? "now" : ""}>
                <b aria-hidden="true">{i < stage ? "✓" : ""}</b>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="pre-track"><i style={{ transform: `scaleX(${p / 100})` }} /></div>
        <h2 className="pre-name">Biswajit Saha</h2>
        <p className="pre-skip">Click or press any key to skip</p>
      </div>
    </div>
  );
}
