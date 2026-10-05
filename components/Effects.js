"use client";
import { useEffect, useRef } from "react";

// Global behaviours: scroll reveals, scroll progress, cursor light, card spotlight.
export default function Effects() {
  const glow = useRef(null);

  useEffect(() => {
    const d = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    let tick = false;
    const onScroll = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        const h = d.scrollHeight - innerHeight;
        d.style.setProperty("--sp", h > 0 ? (scrollY / h).toFixed(4) : 0);
        d.toggleAttribute("data-scrolled", scrollY > 24);
        tick = false;
      });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });

    const onMove = (e) => {
      if (glow.current && !reduce) glow.current.style.transform = `translate3d(${e.clientX - 260}px, ${e.clientY - 260}px, 0)`;
      const g = e.target.closest?.(".glow");
      if (g) {
        const r = g.getBoundingClientRect();
        g.style.setProperty("--mx", e.clientX - r.left + "px");
        g.style.setProperty("--my", e.clientY - r.top + "px");
      }
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      removeEventListener("scroll", onScroll);
      document.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <>
      <div className="progress" aria-hidden="true" />
      <div className="cursor-glow" ref={glow} aria-hidden="true" />
    </>
  );
}
