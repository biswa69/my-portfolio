"use client";
import { useEffect, useRef, useState } from "react";

// Bar heights (relative). A deliberately rising shape: the "insight" the messy data resolves into.
const HF = [0.26, 0.38, 0.32, 0.5, 0.45, 0.62, 0.56, 0.76, 0.7, 0.92];

export default function DataField() {
  const wrap = useRef(null);
  const cv = useRef(null);
  const modeRef = useRef("messy");
  const [mode, setMode] = useState("messy");

  const choose = (m) => {
    modeRef.current = m;
    setMode(m);
  };

  useEffect(() => {
    const canvas = cv.current;
    const ctx = canvas.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, org = 0, visible = true;
    let parts = [];
    let tops = [];
    let base = 0, padX = 0;
    const mouse = { x: -999, y: -999 };

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      return { a1: s.getPropertyValue("--a1").trim(), a2: s.getPropertyValue("--a2").trim(), mut: s.getPropertyValue("--muted").trim(), line: s.getPropertyValue("--line").trim() };
    };
    let col = readColors();

    const layout = () => {
      padX = w * 0.07;
      const padT = h * 0.1;
      base = h - h * 0.12;
      const maxH = base - padT;
      const C = HF.length;
      const bw = (w - padX * 2) / C;
      const N = parts.length;
      const sum = HF.reduce((a, b) => a + b, 0);
      tops = [];
      let idx = 0;
      HF.forEach((f, i) => {
        const k = Math.round((N * f) / sum);
        const cx = padX + bw * (i + 0.5);
        const hh = maxH * f;
        const cols = N > 200 ? 3 : 2;
        const rows = Math.max(1, Math.ceil(k / cols));
        const gap = Math.min(bw * 0.22, 10);
        for (let j = 0; j < k && idx < N; j++, idx++) {
          const c = j % cols, r = Math.floor(j / cols);
          parts[idx].tx = cx + (c - (cols - 1) / 2) * gap * 1.6;
          parts[idx].ty = base - (r + 0.5) * (hh / rows);
        }
        tops.push([cx, base - hh]);
      });
      for (; idx < N; idx++) {
        const t = tops[tops.length - 1];
        parts[idx].tx = t[0];
        parts[idx].ty = t[1] + Math.random() * 10;
      }
    };

    const resize = () => {
      const r = wrap.current.getBoundingClientRect();
      dpr = Math.min(2, devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!parts.length) {
        const N = w < 380 ? 130 : 270;
        parts = Array.from({ length: N }, (_, i) => ({
          x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, tx: 0, ty: 0,
          r: 2 + Math.random() * 1.6,
          c: i % 10 === 0 ? 2 : i % 4 === 0 ? 1 : 0,
        }));
      }
      layout();
      if (reduce) { parts.forEach((p) => { p.x = p.tx; p.y = p.ty; }); org = 1; draw(); }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const target = modeRef.current === "organized" ? 1 : 0;
      org += (target - org) * 0.06;

      ctx.globalAlpha = 0.9 * org;
      ctx.strokeStyle = col.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX - 6, base + 10);
      ctx.lineTo(w - padX + 6, base + 10);
      ctx.stroke();

      if (org > 0.4) {
        ctx.globalAlpha = Math.pow((org - 0.4) / 0.6, 2);
        ctx.strokeStyle = col.a1;
        ctx.lineWidth = 2;
        ctx.beginPath();
        tops.forEach((t, i) => (i ? ctx.lineTo(t[0], t[1] - 14) : ctx.moveTo(t[0], t[1] - 14)));
        ctx.stroke();
      }

      for (const p of parts) {
        if (!reduce) {
          if (target) {
            p.vx += (p.tx - p.x) * 0.012;
            p.vy += (p.ty - p.y) * 0.012;
            p.vx *= 0.9;
            p.vy *= 0.9;
          } else {
            p.vx += (Math.random() - 0.5) * 0.14;
            p.vy += (Math.random() - 0.5) * 0.14;
            p.vx *= 0.97;
            p.vy *= 0.97;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
          }
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 5200) {
            const d = Math.sqrt(d2) || 1;
            const f = (72 - d) * 0.05;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
          p.x += p.vx;
          p.y += p.vy;
        }
        ctx.globalAlpha = 0.5 + 0.5 * org;
        ctx.fillStyle = p.c === 2 ? col.a2 : p.c === 1 ? col.mut : col.a1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (0.85 + 0.25 * org), 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      if (visible && !document.hidden) draw();
      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap.current);
    resize();
    if (!reduce) raf = requestAnimationFrame(loop);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(wrap.current);

    const move = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const leave = () => { mouse.x = mouse.y = -999; };
    wrap.current.addEventListener("pointermove", move);
    wrap.current.addEventListener("pointerleave", leave);

    const theme = new MutationObserver(() => { col = readColors(); if (reduce) draw(); });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // Sort itself out shortly after the intro lifts.
    const d = document.documentElement;
    let timer;
    const kick = () => { timer = setTimeout(() => choose("organized"), reduce ? 0 : 1500); };
    let ready;
    if (d.classList.contains("ready")) kick();
    else {
      ready = new MutationObserver(() => { if (d.classList.contains("ready")) { ready.disconnect(); kick(); } });
      ready.observe(d, { attributes: true, attributeFilter: ["class"] });
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      ro.disconnect();
      io.disconnect();
      theme.disconnect();
      ready?.disconnect();
    };
  }, []);

  return (
    <div className="field" data-mode={mode}>
      <div className="field-canvas" ref={wrap}>
        <canvas ref={cv} aria-hidden="true" />
        <span className="field-chip">↗ Pattern identified</span>
      </div>
      <div className="field-ctl" role="group" aria-label="Data view">
        <button aria-pressed={mode === "messy"} onClick={() => choose("messy")}>Raw data</button>
        <button aria-pressed={mode === "organized"} onClick={() => choose("organized")}>Insight</button>
      </div>
      <p className="field-cap">Move your cursor through the data. It scatters, then it sorts.</p>
    </div>
  );
}
