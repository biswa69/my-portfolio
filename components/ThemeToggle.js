"use client";
import { useRef } from "react";

export default function ThemeToggle() {
  const btn = useRef(null);

  const toggle = () => {
    const d = document.documentElement;
    const next = d.getAttribute("data-theme") === "dark" ? "light" : "dark";
    const apply = () => {
      d.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch {}
    };
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce) return apply();
    const r = btn.current.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(apply).ready.then(() =>
      d.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(.65,0,.35,1)", pseudoElement: "::view-transition-new(root)" }
      )
    );
  };

  return (
    <button ref={btn} className="theme-btn" onClick={toggle} aria-label="Toggle light and dark theme" title="Toggle theme">
      <svg viewBox="0 0 24 24" className="ico sun" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
      </svg>
      <svg viewBox="0 0 24 24" className="ico moon" aria-hidden="true">
        <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.2 8.2 0 1 0 10.2 10.2z" />
      </svg>
    </button>
  );
}
