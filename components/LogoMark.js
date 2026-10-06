"use client";
import { useEffect, useRef, useState } from "react";

// A tiny logo that keeps changing what kind of chart it is: bars, pie, line, scatter.
// One accent element per chart; everything else is ink.
const KINDS = ["bars", "pie", "line", "scatter"];
const C = 2 * Math.PI * 4.5; // circumference of the pie's r=4.5 stroke ring

export default function LogoMark() {
  const [i, setI] = useState(0);
  const timer = useRef(null);

  const start = () => {
    clearInterval(timer.current);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer.current = setInterval(() => setI((n) => (n + 1) % KINDS.length), 1100);
  };

  useEffect(() => {
    start();
    return () => clearInterval(timer.current);
  }, []);

  const next = () => {
    setI((n) => (n + 1) % KINDS.length);
    start();
  };

  const on = (k) => (KINDS[i] === k ? "lg on" : "lg");

  return (
    <svg className="logo" viewBox="0 0 24 24" aria-hidden="true" onPointerEnter={next}>
      <g className={on("bars")}>
        <rect x="3" y="12" width="5" height="9" rx="1.5" />
        <rect x="9.5" y="3" width="5" height="18" rx="1.5" className="acc" />
        <rect x="16" y="8" width="5" height="13" rx="1.5" />
      </g>
      <g className={on("pie")}>
        <g transform="rotate(-90 12 12)">
          <circle cx="12" cy="12" r="4.5" strokeWidth="9" className="acc-s" strokeDasharray={`${C * 0.38} ${C}`} />
          <circle cx="12" cy="12" r="4.5" strokeWidth="9" strokeDasharray={`${C * 0.32} ${C}`} strokeDashoffset={-C * 0.38} />
          <circle cx="12" cy="12" r="4.5" strokeWidth="9" opacity=".45" strokeDasharray={`${C * 0.3} ${C}`} strokeDashoffset={-C * 0.7} />
        </g>
      </g>
      <g className={on("line")}>
        <polyline points="3,18 8.5,12 13.5,14.5 20,6" />
        <circle cx="20" cy="6" r="2.4" className="acc" />
        <line x1="3" y1="21" x2="21" y2="21" opacity=".45" />
      </g>
      <g className={on("scatter")}>
        <circle cx="6" cy="17" r="2" />
        <circle cx="11" cy="11" r="2.4" className="acc" />
        <circle cx="17" cy="15" r="1.8" />
        <circle cx="18" cy="6" r="2.2" />
        <circle cx="5.5" cy="7" r="1.5" opacity=".45" />
      </g>
    </svg>
  );
}
