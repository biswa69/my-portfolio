"use client";
import { useEffect, useRef, useState } from "react";

export default function Counter({ to, prefix = "", suffix = "", dur = 1800 }) {
  const ref = useRef(null);
  const [v, setV] = useState(to);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setV(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const s = performance.now();
        const step = (t) => {
          const x = Math.min(1, (t - s) / dur);
          setV(Math.round(to * (x === 1 ? 1 : 1 - Math.pow(2, -10 * x))));
          if (x < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    io.observe(ref.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, dur]);

  return (
    <span ref={ref} className="counter">
      {prefix}
      {v.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
