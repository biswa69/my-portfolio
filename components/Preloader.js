"use client";
import { useEffect, useRef, useState } from "react";

// The loader is a name and one line. The line is a rising trend that draws itself left to right,
// and it is also the progress bar. About 1.3s, then a curtain lifts to reveal the page.
const DURATION = 1250;
const smooth = (t) => t * t * (3 - 2 * t); // slow start, quick middle, soft landing

// Trend in a 1000 x 80 box (y grows downward). x is monotonic, so progress maps straight to x.
const PTS = [[0, 70], [110, 54], [215, 62], [330, 36], [440, 46], [560, 22], [670, 32], [790, 12], [1000, 4]];
const LINE = PTS.map(([x, y]) => `${x},${y}`).join(" ");
const AREA = `${LINE} 1000,80 0,80`;

function yAt(x) {
  for (let i = 1; i < PTS.length; i++) {
    if (x <= PTS[i][0]) {
      const [x0, y0] = PTS[i - 1];
      const [x1, y1] = PTS[i];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return PTS[PTS.length - 1][1];
}

export default function Preloader() {
  const [f, setF] = useState(0); // 0..1
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
      setF(1);
      setPhase("out");
      setTimeout(() => d.classList.add("ready"), 250);
      try { sessionStorage.setItem("seen", "1"); } catch {}
      setTimeout(() => setPhase("gone"), 1000);
    };
    skip.current = finish;

    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION);
      setF(smooth(t));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(finish, 180);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("keydown", finish);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", finish);
    };
  }, []);

  if (phase === "gone") return null;
  const pct = Math.round(f * 100);
  const hx = f * 1000;

  return (
    <div
      className={`preloader ${phase === "out" ? "out" : ""}`}
      role="progressbar"
      aria-label="Loading portfolio"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      onClick={() => skip.current?.()}
    >
      <p className="pre-tag">DATA × PRODUCT × BUSINESS</p>
      <div className="pre-main">
        <h2 className="pre-name" aria-label="Biswajit Saha">
          <span className="pre-line" aria-hidden="true"><span>Biswajit</span></span>
          <span className="pre-line" aria-hidden="true"><span style={{ animationDelay: ".28s" }}>Saha</span></span>
        </h2>
        <div className="pre-trend" aria-hidden="true">
          <svg viewBox="0 0 1000 80" preserveAspectRatio="none">
            <line className="pre-base" x1="0" y1="79" x2="1000" y2="79" />
            <g style={{ clipPath: `inset(0 ${(1 - f) * 100}% 0 0)` }}>
              <polygon className="pre-area" points={AREA} />
              <polyline className="pre-path" points={LINE} />
            </g>
          </svg>
          <span className="pre-dot" style={{ left: `${f * 100}%`, top: `${(yAt(hx) / 80) * 100}%` }} />
        </div>
      </div>
      <div className="pre-foot">
        <span>Click or press any key to skip</span>
        <span className="pre-pct">{pct}%</span>
      </div>
    </div>
  );
}
