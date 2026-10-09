"use client";
import { useEffect, useRef, useState } from "react";

// One set of dots that re-forms into five chart shapes. The shapes are illustrative: no value on screen is real data.
const VIEWS = [
  { id: "raw", label: "Raw data", dwell: 2200 },
  { id: "trend", label: "Trend", chip: "↗ Pattern identified", dwell: 4200 },
  { id: "funnel", label: "Funnel", chip: "↘ Where leads drop off", dwell: 4200 },
  { id: "cohort", label: "Cohort", chip: "Who stays over time", dwell: 4200 },
  { id: "share", label: "Share", chip: "What makes up the whole", dwell: 4200 },
];

// Trend: bar heights (relative). A deliberately rising shape: the "insight" the messy data resolves into.
const HF = [0.26, 0.38, 0.32, 0.5, 0.45, 0.62, 0.56, 0.76, 0.7, 0.92];
// Funnel: the lead stages used on the Product thinking section. Widths are relative, not measured.
const STAGES = ["Lead", "Assigned", "Contacted", "Qualified", "Converted"];
const STAGE_W = [1, 0.78, 0.56, 0.36, 0.2];
// Share: three segments of one whole, as [colour, fraction].
const SHARE = [["a1", 0.58], ["a2", 0.24], ["mut", 0.18]];
const COHORTS = 8;

const hex = (c) => {
  if (!c.startsWith("#")) return [255, 255, 255];
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const hash = (a, b) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
// Dots keep the mix of colours the graph always had: mostly accent, some muted, a few violet.
const mix = (i) => (i % 10 === 0 ? "a2" : i % 4 === 0 ? "mut" : "a1");
const fit = (pts, N) => {
  while (pts.length > N) pts.pop();
  while (pts.length < N) pts.push({ ...pts[pts.length - 1] });
  return pts;
};

// Each builder returns exactly N target points: { x, y, k: colour key, a: alpha, s: size scale }.
function trendView(N, w, h) {
  const padX = w * 0.07, padT = h * 0.1, base = h - h * 0.12, maxH = base - padT;
  const bw = (w - padX * 2) / HF.length;
  const sum = HF.reduce((a, b) => a + b, 0);
  const pts = [], tops = [];
  HF.forEach((f, i) => {
    const k = Math.round((N * f) / sum), cx = padX + bw * (i + 0.5), hh = maxH * f;
    const cols = N > 200 ? 3 : 2, rows = Math.max(1, Math.ceil(k / cols)), gap = Math.min(bw * 0.22, 10);
    for (let j = 0; j < k && pts.length < N; j++) {
      const c = j % cols, r = Math.floor(j / cols);
      pts.push({ x: cx + (c - (cols - 1) / 2) * gap * 1.6, y: base - (r + 0.5) * (hh / rows) });
    }
    tops.push([cx, base - hh]);
  });
  while (pts.length < N) {
    const t = tops[tops.length - 1];
    pts.push({ x: t[0], y: t[1] + 4 + (pts.length % 7) });
  }
  pts.forEach((p, i) => Object.assign(p, { k: mix(i), a: 1, s: 1.1 }));
  return { pts, tops, base, padX };
}

function funnelView(N, w, h) {
  const padX = w * 0.07, top = h * 0.15, stageH = (h * 0.78) / STAGES.length;
  const sum = STAGE_W.reduce((a, b) => a + b, 0);
  const counts = STAGE_W.map((x) => Math.round((N * x) / sum));
  counts[0] += N - counts.reduce((a, b) => a + b, 0);
  const rows = 3, rowGap = 9;
  const cols = counts.map((c) => Math.ceil(c / rows));
  const sx = (w - padX * 2) / cols[0];
  const pts = [], bands = [];
  counts.forEach((cnt, i) => {
    const y0 = top + i * stageH + 14;
    let left = Infinity, right = -Infinity, used = 0;
    for (let r = 0; r < rows && used < cnt; r++) {
      const inRow = Math.min(cols[i], cnt - used);
      const x0 = w / 2 - ((inRow - 1) * sx) / 2;
      for (let c = 0; c < inRow; c++) {
        const x = x0 + c * sx;
        pts.push({ x, y: y0 + r * rowGap });
        left = Math.min(left, x);
        right = Math.max(right, x);
      }
      used += inRow;
    }
    bands.push({ left, right, y: y0, bottom: y0 + (rows - 1) * rowGap, label: STAGES[i] });
  });
  pts.forEach((p, i) => Object.assign(p, { k: mix(i), a: 1, s: 1.1 }));
  return { pts, bands };
}

// A retention-style triangle: older cohorts have more periods, and each cell fades with time.
function cohortView(N, w, h) {
  const x0 = w * 0.13, y0 = h * 0.2, cw = (w * 0.8) / COHORTS, ch = (h * 0.66) / COHORTS;
  const cells = [];
  for (let r = 0; r < COHORTS; r++) {
    for (let c = 0; c < COHORTS - r; c++) {
      cells.push({ r, c, v: Math.min(1, Math.max(0.12, (1 - c * 0.115) * (0.8 + 0.34 * hash(r, c)))) });
    }
  }
  const tot = cells.reduce((a, b) => a + b.v, 0);
  cells.forEach((q) => (q.n = Math.floor((N * q.v) / tot)));
  let rest = N - cells.reduce((a, b) => a + b.n, 0);
  [...cells].sort((a, b) => b.v - a.v).forEach((q) => {
    if (rest > 0) { q.n++; rest--; }
  });
  const pts = [];
  cells.forEach((q) => {
    const gc = Math.max(1, Math.ceil(Math.sqrt(q.n))), gr = Math.ceil(q.n / gc), sp = Math.min(cw, ch) * 0.27;
    const cx = x0 + q.c * cw + cw / 2, cy = y0 + q.r * ch + ch / 2;
    for (let j = 0; j < q.n; j++) {
      pts.push({
        x: cx + ((j % gc) - (gc - 1) / 2) * sp,
        y: cy + (Math.floor(j / gc) - (gr - 1) / 2) * sp,
        k: "a1", a: 0.28 + 0.72 * q.v, s: 0.75 + 0.35 * q.v,
      });
    }
  });
  return { pts, x0, y0, cw };
}

// A ring of three rows of dots, split into coloured arcs with small gaps between them.
function shareView(N, w, h) {
  const cx = w / 2, cy = h / 2 + 4, R = Math.min(w, h) * 0.36, step = 9, gap = 0.1;
  const radii = [R, R - step, R - step * 2];
  const circ = radii.map((r) => r * 2 * Math.PI);
  const total = circ.reduce((a, b) => a + b, 0);
  const perRow = circ.map((c) => Math.round((N * c) / total));
  perRow[0] += N - perRow.reduce((a, b) => a + b, 0);
  const usable = Math.PI * 2 - gap * SHARE.length;
  const pts = [];
  perRow.forEach((n, ri) => {
    let used = 0, a0 = -Math.PI / 2;
    SHARE.forEach(([k, f], si) => {
      const cnt = si === SHARE.length - 1 ? n - used : Math.round(n * f), span = usable * f;
      for (let j = 0; j < cnt; j++) {
        const ang = a0 + (span * (j + 0.5)) / cnt;
        pts.push({ x: cx + Math.cos(ang) * radii[ri], y: cy + Math.sin(ang) * radii[ri], k, a: 1, s: 1.1 });
      }
      used += cnt;
      a0 += span + gap;
    });
  });
  return { pts };
}

export default function DataField() {
  const wrap = useRef(null);
  const cv = useRef(null);
  const api = useRef({});
  const [view, setView] = useState("raw");

  useEffect(() => {
    const canvas = cv.current;
    const ctx = canvas.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true, hover = false;
    let parts = [], V = null, cur = "raw", auto = true, cycle = 0;
    const ov = { trend: 0, funnel: 0, cohort: 0, share: 0 };
    const mouse = { x: -999, y: -999 };

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      const g = (n) => s.getPropertyValue(n).trim();
      const c = { a1: g("--a1"), a2: g("--a2"), mut: g("--muted"), line: g("--line") };
      return { ...c, rgb: { a1: hex(c.a1), a2: hex(c.a2), mut: hex(c.mut) } };
    };
    let col = readColors();
    let fam = getComputedStyle(document.body).fontFamily;

    const build = () => {
      const N = parts.length;
      V = { trend: trendView(N, w, h), funnel: funnelView(N, w, h), cohort: cohortView(N, w, h), share: shareView(N, w, h) };
      Object.values(V).forEach((v) => fit(v.pts, N));
    };

    // Pair dots with targets by position so the move between shapes flows instead of crossing.
    const assign = (pts) => {
      const a = parts.map((_, i) => i).sort((i, j) => parts[i].x - parts[j].x || parts[i].y - parts[j].y);
      const b = pts.map((_, i) => i).sort((i, j) => pts[i].x - pts[j].x || pts[i].y - pts[j].y);
      a.forEach((pi, k) => { parts[pi].t = pts[b[k]]; });
    };

    // Reduced motion: jump straight to the target, no travel.
    const settle = () => {
      parts.forEach((p) => {
        const t = p.t, c = col.rgb[t ? t.k : p.k];
        if (t) { p.x = t.x; p.y = t.y; }
        [p.cr, p.cg, p.cb] = c;
        p.ca = t ? t.a : 0.5;
        p.cs = t ? t.s : 0.85;
      });
      Object.keys(ov).forEach((id) => { ov[id] = cur === id ? 1 : 0; });
    };

    const drawTrend = (a) => {
      const v = V.trend;
      ctx.globalAlpha = 0.9 * a;
      ctx.strokeStyle = col.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(v.padX - 6, v.base + 10);
      ctx.lineTo(w - v.padX + 6, v.base + 10);
      ctx.stroke();
      if (a > 0.4) {
        ctx.globalAlpha = Math.pow((a - 0.4) / 0.6, 2);
        ctx.strokeStyle = col.a1;
        ctx.lineWidth = 2;
        ctx.beginPath();
        v.tops.forEach((t, i) => (i ? ctx.lineTo(t[0], t[1] - 14) : ctx.moveTo(t[0], t[1] - 14)));
        ctx.stroke();
      }
    };

    const drawFunnel = (a) => {
      const bands = V.funnel.bands;
      ctx.globalAlpha = 0.9 * a;
      ctx.strokeStyle = col.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      bands.forEach((b, i) => {
        const n = bands[i + 1];
        if (!n) return;
        ctx.moveTo(b.left - 6, b.bottom + 8);
        ctx.lineTo(n.left - 6, n.y - 18);
        ctx.moveTo(b.right + 6, b.bottom + 8);
        ctx.lineTo(n.right + 6, n.y - 18);
      });
      ctx.stroke();
      ctx.fillStyle = col.mut;
      ctx.font = `600 12px ${fam}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      bands.forEach((b) => ctx.fillText(b.label, b.left - 6, b.y - 12));
    };

    const drawCohort = (a) => {
      const v = V.cohort, y = v.y0 - 16;
      ctx.globalAlpha = a;
      ctx.fillStyle = col.mut;
      ctx.font = `600 12px ${fam}`;
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";
      ctx.fillText("Cohort ↓", v.x0 - 4, y);
      ctx.textAlign = "right";
      ctx.fillText("Time →", v.x0 + COHORTS * v.cw, y);
    };

    const overlays = { trend: drawTrend, funnel: drawFunnel, cohort: drawCohort };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const id of Object.keys(ov)) {
        ov[id] += ((cur === id ? 1 : 0) - ov[id]) * 0.08;
        if (ov[id] > 0.01 && overlays[id]) overlays[id](ov[id]);
      }

      for (const p of parts) {
        const t = p.t;
        if (!reduce) {
          if (t) {
            p.vx += (t.x - p.x) * 0.012;
            p.vy += (t.y - p.y) * 0.012;
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

          // Ease colour, opacity and size toward the target so shapes change without a pop.
          const c = col.rgb[t ? t.k : p.k];
          p.cr += (c[0] - p.cr) * 0.08;
          p.cg += (c[1] - p.cg) * 0.08;
          p.cb += (c[2] - p.cb) * 0.08;
          p.ca += ((t ? t.a : 0.5) - p.ca) * 0.08;
          p.cs += ((t ? t.s : 0.85) - p.cs) * 0.08;
        }
        ctx.globalAlpha = p.ca;
        ctx.fillStyle = `rgb(${p.cr | 0},${p.cg | 0},${p.cb | 0})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.cs, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
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
        parts = Array.from({ length: N }, (_, i) => {
          const k = mix(i), c = col.rgb[k];
          return { x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, t: null, k, r: 2 + Math.random() * 1.6, cr: c[0], cg: c[1], cb: c[2], ca: 0.5, cs: 0.85 };
        });
      }
      build();
      if (cur !== "raw") assign(V[cur].pts);
      if (reduce) { settle(); draw(); }
    };

    const schedule = () => {
      clearTimeout(cycle);
      if (!auto || reduce) return;
      cycle = setTimeout(() => {
        if (hover || !visible || document.hidden) return schedule();
        const i = VIEWS.findIndex((x) => x.id === cur);
        go(VIEWS[(i + 1) % VIEWS.length].id);
      }, VIEWS.find((x) => x.id === cur).dwell);
    };

    const go = (id) => {
      cur = id;
      setView(id);
      if (id === "raw") {
        parts.forEach((p) => {
          p.t = null;
          p.vx += (Math.random() - 0.5) * 3;
          p.vy += (Math.random() - 0.5) * 3;
          if (reduce) { p.x = Math.random() * w; p.y = Math.random() * h; }
        });
      } else {
        assign(V[id].pts);
      }
      if (reduce) { settle(); draw(); }
      schedule();
    };

    // Picking a view, by click or by hovering its button, hands control to the visitor for good.
    api.current.choose = (id) => {
      auto = false;
      clearTimeout(cycle);
      if (id !== cur) go(id);
    };
    // Hovering a button shows its view after a short pause, so sweeping across the row does not thrash the dots.
    let hoverTimer;
    api.current.preview = (id) => {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => api.current.choose(id), 90);
    };
    api.current.cancel = () => clearTimeout(hoverTimer);

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
    const enter = () => { hover = true; };
    const leave = () => { hover = false; mouse.x = mouse.y = -999; };
    wrap.current.addEventListener("pointermove", move);
    wrap.current.addEventListener("pointerenter", enter);
    wrap.current.addEventListener("pointerleave", leave);

    const theme = new MutationObserver(() => { col = readColors(); if (reduce) { settle(); draw(); } });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.fonts?.ready.then(() => { fam = getComputedStyle(document.body).fontFamily; });

    // Sort itself out shortly after the intro lifts, then keep cycling through the shapes.
    const d = document.documentElement;
    let timer;
    const kick = () => { timer = setTimeout(() => { if (auto) go("trend"); }, reduce ? 0 : 1500); };
    let ready;
    if (d.classList.contains("ready")) kick();
    else {
      ready = new MutationObserver(() => { if (d.classList.contains("ready")) { ready.disconnect(); kick(); } });
      ready.observe(d, { attributes: true, attributeFilter: ["class"] });
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      clearTimeout(cycle);
      clearTimeout(hoverTimer);
      ro.disconnect();
      io.disconnect();
      theme.disconnect();
      ready?.disconnect();
    };
  }, []);

  const chip = VIEWS.find((v) => v.id === view)?.chip;

  return (
    <div className="field" data-mode={view === "raw" ? "messy" : "organized"}>
      <div className="field-canvas" ref={wrap}>
        <canvas ref={cv} aria-hidden="true" />
        <span className="field-chip">{chip}</span>
      </div>
      <div className="seg field-ctl" role="group" aria-label="Data view">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            aria-pressed={view === v.id}
            onClick={() => api.current.choose?.(v.id)}
            onPointerEnter={(e) => { if (e.pointerType === "mouse") api.current.preview?.(v.id); }}
            onPointerLeave={() => api.current.cancel?.()}
          >
            {v.label}
          </button>
        ))}
      </div>
      <p className="field-cap">Illustrative data. Hover a view, or move your cursor through the dots.</p>
    </div>
  );
}
