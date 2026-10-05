"use client";
import { useEffect, useState } from "react";

const pairs = [
  ["messy data", "reliable models"],
  ["scattered KPIs", "one dashboard"],
  ["2-day reports", "5-minute automation"],
  ["legacy systems", "RCA-ready reporting"],
];

export default function Rotator() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % pairs.length), 2800);
    return () => clearInterval(t);
  }, []);
  const [a, b] = pairs[i];
  return (
    <p className="rotator" aria-live="off">
      <span className="rot-k">I turn</span>
      <span className="rot-w" key={`a${i}`}>{a}</span>
      <span className="rot-k">into</span>
      <span className="rot-w hi" key={`b${i}`}>{b}</span>
    </p>
  );
}
