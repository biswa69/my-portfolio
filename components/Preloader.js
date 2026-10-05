"use client";
import { useEffect, useState } from "react";

const BARS = [0.3, 0.45, 0.38, 0.55, 0.5, 0.66, 0.6, 0.78, 0.72, 0.92];
const STAGES = ["Ingesting raw data", "Cleaning & validating", "Modeling the metrics", "Rendering the dashboard"];
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export default function Preloader() {
  const [p, setP] = useState(0);
  const [phase, setPhase] = useState("run"); // run | out | gone

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
    const start = performance.now();
    const dur = 2600;
    const tick = (t) => {
      const x = Math.min(1, (t - start) / dur);
      setP(Math.round(ease(x) * 100));
      if (x < 1) raf = requestAnimationFrame(tick);
      else setTimeout(finish, 250);
    };
    raf = requestAnimationFrame(tick);
    const skip = () => finish();
    window.addEventListener("keydown", skip);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  if (phase === "gone") return null;
  const stage = STAGES[Math.min(3, Math.floor(p / 25.01))];

  return (
    <div className={`preloader ${phase === "out" ? "out" : ""}`} role="status" aria-live="polite" onClick={() => setP(100)}>
      <div className="pre-inner">
        <p className="pre-tag">DATA × PRODUCT × BUSINESS</p>
        <svg className="pre-chart" viewBox="0 0 300 120" aria-hidden="true">
          <line x1="0" y1="110" x2="300" y2="110" className="pre-axis" />
          {BARS.map((b, i) => {
            const h = 100 * b * Math.min(1, p / 100 * 1.15);
            const jitter = p < 100 ? Math.sin(p * 0.35 + i * 1.7) * (1 - p / 100) * 14 : 0;
            const hh = Math.max(3, h + jitter);
            return <rect key={i} x={i * 30 + 6} y={110 - hh} width="18" height={hh} rx="4" className={`pre-bar b${i % 3}`} />;
          })}
          <polyline
            className="pre-line"
            points={BARS.map((b, i) => `${i * 30 + 15},${110 - 100 * b * Math.min(1, p / 100 * 1.15)}`).join(" ")}
            style={{ opacity: p > 55 ? 1 : 0 }}
          />
        </svg>
        <div className="pre-row">
          <span className="pre-stage">{stage}…</span>
          <span className="pre-pct">{String(p).padStart(3, "0")}%</span>
        </div>
        <div className="pre-track"><i style={{ transform: `scaleX(${p / 100})` }} /></div>
        <h2 className="pre-name">Biswajit Saha</h2>
        <p className="pre-skip">Click or press any key to skip</p>
      </div>
    </div>
  );
}
