"use client";
import { useEffect, useRef, useState } from "react";

const BARS = [0.3, 0.45, 0.38, 0.55, 0.5, 0.66, 0.6, 0.78, 0.72, 0.92];
const STAGES = ["Ingesting raw data", "Cleaning & validating", "Modeling the metrics", "Rendering the dashboard"];
const SAYS = ["Gathering the data…", "Cleaning it up…", "Building the model…", "Drawing the dashboard…", "All set!"];

// Progress moves stage by stage with a short pause at each milestone (virtual milliseconds).
const SEGMENTS = [
  { to: 24, ms: 550 }, { hold: 120 },
  { to: 52, ms: 500 }, { hold: 120 },
  { to: 78, ms: 450 }, { hold: 100 },
  { to: 100, ms: 400 },
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

// The analyst: feet at (0, 0). Walks in, builds the chart, looks at your cursor, hops when tapped.
function Analyst({ x, p, stage, look, hop, onTap }) {
  const done = p >= 100;
  const walking = p < 14;
  const armClass = done ? "arm-up" : walking ? "arm-walk" : "arm-work";
  const mouth = done ? "M-7 -45 Q0 -37 7 -45" : "M-5 -45 Q0 -41 5 -45";
  const say = SAYS[Math.min(stage, 4)];
  return (
    <g className="ch-move" style={{ transform: `translate(${x}px, 150px)` }}>
      <g key={hop} className={hop ? "ch-hop" : ""}>
        <g className={walking ? "walking" : "ch-idle"} onClick={onTap} role="button" tabIndex={0} aria-label="Tap the analyst to speed up loading" onKeyDown={(e) => e.key === "Enter" && onTap(e)} style={{ cursor: "pointer" }}>
          <rect className="ch-leg l" x="-14" y="-18" width="9" height="18" rx="4" />
          <rect className="ch-leg r" x="5" y="-18" width="9" height="18" rx="4" />
          <line className="ch-ant" x1="0" y1="-72" x2="0" y2="-83" />
          <circle className={`ch-led ${done ? "ok" : ""}`} cx="0" cy="-87" r="4.5" />
          <rect className="ch-body" x="-24" y="-72" width="48" height="56" rx="14" />
          <rect className="ch-face" x="-17" y="-64" width="34" height="25" rx="8" />
          <g className="ch-eyes" style={{ transform: `translate(${look.x * 2.6}px, ${look.y * 1.8}px)` }}>
            <circle className="ch-eye" cx="-7" cy="-53" r="3.2" />
            <circle className="ch-eye" cx="7" cy="-53" r="3.2" />
          </g>
          <path className="ch-mouth" d={mouth} />
          <circle className="ch-badge" cx="0" cy="-29" r="4.5" />
          {/* left arm holds a clipboard */}
          <line className="ch-limb" x1="-24" y1="-58" x2="-33" y2="-41" />
          <rect className="ch-clip" x="-46" y="-48" width="17" height="22" rx="3" />
          <line className="ch-clip-line" x1="-42" y1="-42" x2="-33" y2="-42" />
          <line className="ch-clip-line" x1="-42" y1="-37" x2="-33" y2="-37" />
          <line className="ch-clip-line" x1="-42" y1="-32" x2="-37" y2="-32" />
          {/* right arm points at the chart */}
          <g transform="translate(24,-58)">
            <g className={`ch-arm ${armClass}`}>
              <line className="ch-limb" x1="0" y1="0" x2="20" y2="0" />
            </g>
          </g>
        </g>
        <g className="ch-say" key={say} transform="translate(-64,-126)">
          <rect x="0" y="0" width="128" height="26" rx="13" />
          <path d="M58 26 L64 33 L70 26 Z" />
          <text x="64" y="17.5" textAnchor="middle">{say}</text>
        </g>
      </g>
    </g>
  );
}

export default function Preloader() {
  const [p, setP] = useState(0);
  const [phase, setPhase] = useState("run"); // run | out | gone
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [hop, setHop] = useState(0);
  const speed = useRef(1);
  const skip = useRef(null);
  const root = useRef(null);

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
      setTimeout(() => setPhase("gone"), 1000);
    };
    skip.current = finish;

    let last = performance.now();
    let vt = 0;
    const tick = (now) => {
      const dt = Math.min(64, now - last);
      last = now;
      vt += dt * speed.current;
      speed.current += (1 - speed.current) * Math.min(1, dt / 350); // a tap's boost fades out
      setP(Math.round(progressAt(vt)));
      if (vt < TOTAL) raf = requestAnimationFrame(tick);
      else setTimeout(finish, 650);
    };
    raf = requestAnimationFrame(tick);

    // The analyst's eyes follow the pointer.
    let pending = false;
    const move = (e) => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const r = root.current?.getBoundingClientRect();
        if (!r) return;
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        setLook({ x: Math.max(-1, Math.min(1, dx)), y: Math.max(-1, Math.min(1, dy)) });
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("keydown", finish);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("keydown", finish);
    };
  }, []);

  if (phase === "gone") return null;
  const stage = p >= 100 ? 4 : p >= 78 ? 3 : p >= 52 ? 2 : p >= 24 ? 1 : 0;
  const x = p < 14 ? -80 + (p / 14) * 150 : 70;
  const tap = (e) => {
    e.stopPropagation();
    speed.current = 3.2;
    setHop((h) => h + 1);
  };
  const tops = BARS.map((b, i) => [150 + i * 20 + 7, 150 - b * 100]);

  return (
    <div ref={root} className={`preloader ${phase === "out" ? "out" : ""}`} role="progressbar" aria-label="Loading portfolio" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p}>
      <div className="pre-inner">
        <p className="pre-tag">DATA × PRODUCT × BUSINESS</p>
        <svg className="pre-scene" viewBox="0 0 360 170">
          <line className="pre-ground" x1="4" y1="152" x2="356" y2="152" />
          {BARS.map((b, i) => (
            <rect key={i} className={`pbar c${i % 3} ${p >= 14 + i * 8 ? "on" : ""}`} x={150 + i * 20} y={150 - b * 100} width="14" height={b * 100} rx="3" />
          ))}
          <polyline className={`ptrend ${p >= 92 ? "on" : ""}`} points={tops.map(([a, b]) => `${a},${b - 8}`).join(" ")} />
          <Analyst x={x} p={p} stage={stage} look={look} hop={hop} onTap={tap} />
        </svg>
        <div className="pre-meter">
          <Odometer value={p} />
          <div className="pre-drum" aria-hidden="true">
            <ul style={{ transform: `translateY(${(1 - stage) * 24}px)` }}>
              {[...STAGES, "Ready"].map((label, i) => (
                <li key={label} className={i === stage ? "now" : Math.abs(i - stage) === 1 ? "near" : ""}>{label}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pre-track"><i style={{ transform: `scaleX(${p / 100})` }} /></div>
        <h2 className="pre-name">Biswajit Saha</h2>
        <p className="pre-skip">
          Tap the analyst to speed things up
          <button type="button" onClick={() => skip.current?.()}>Skip intro</button>
        </p>
      </div>
    </div>
  );
}
