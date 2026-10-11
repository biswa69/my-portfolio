"use client";
import { useEffect, useRef } from "react";
import { N, SHAPES, COLORS } from "../lib/shapes";

// One canvas, fixed behind the page, with N dots on springs. `shape` names the formation (lib/shapes.js).
// The dots move; nothing else on the page does. Hover pushes them aside, except on shapes that read the cursor.
// `focus` lets the text pick the highlighted group; `onFocus` tells the text which group the field is highlighting.

const SPRING = 38; // pull toward the target
const DAMP = 9; // a few percent overshoot, then settle in about 0.7s
const PUSH = 2800; // how hard the cursor pushes dots away
const HI = COLORS.hi;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function Field({ shape, focus = null, onFocus }) {
  const ref = useRef(null);
  const api = useRef(null);
  const focusRef = useRef(focus);
  const callbackRef = useRef(onFocus);

  useEffect(() => {
    focusRef.current = focus;
  }, [focus]);
  useEffect(() => {
    callbackRef.current = onFocus;
  }, [onFocus]);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() || "ui-monospace, monospace";
    // requestAnimationFrame pauses in hidden tabs; fall back to a timer so the field never stalls mid-formation
    const next = (f) => (document.hidden ? setTimeout(() => f(performance.now()), 16) : requestAnimationFrame(f));

    let W = 0;
    let H = 0;
    let dpr = 1;
    let region = null;
    let now = performance.now();
    let current = null;
    let shapeStart = now;
    let lastFocus;
    let jitter = false;
    let labels = [];
    let timers = [];
    let dead = false;
    let placed = false;
    const ptr = { x: -9999, y: -9999 };
    // what live shapes can read each frame (see the header of lib/shapes.js)
    // `sim` is time as the dots feel it: it only advances by the (capped) step of each frame, so anything driven by it
    // (rotation, the idle cue) slows down with the frame rate instead of running ahead of the springs.
    const st = { t: 0, sim: 0, since: 0, ptr, region: null, reduce, propFocus: null, focus: null, geo: null, mono };
    const dots = Array.from({ length: N }, () => ({
      x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0,
      c: COLORS.quiet.slice(), tc: COLORS.quiet, r: 1, tr: 1, r0: 1,
      wob: null, pend: null, until: 0, m: null,
    }));

    const place = (d, p) => {
      d.tx = p.x;
      d.ty = p.y;
      d.tc = p.c;
      d.tr = p.r * 1.7 * region.u;
      d.r0 = d.tr;
      d.wob = p.wob || null;
      d.m = p.m || null;
      d.until = p.flash ? now + p.flash * 1000 : 0;
    };

    // Point every dot at its place in `b`. Dots with a delay wait their turn, so a change can sweep across the field.
    const apply = (b, instant) => {
      jitter = !!b.jitter;
      st.geo = b.geo || null;
      labels = (b.labels || []).map((l) => ({ ...l, at: now + (l.delay || 0) * 1000 }));
      for (let i = 0; i < N; i++) {
        const d = dots[i];
        const p = b.pts[i];
        d.pend = null;
        if (instant) {
          place(d, p);
          d.x = d.tx;
          d.y = d.ty;
          d.vx = 0;
          d.vy = 0;
          d.c = p.c.slice();
          d.r = d.tr;
          d.until = 0;
        } else if (p.delay) d.pend = { at: now + p.delay * 1000, p };
        else place(d, p);
      }
    };

    const show = (id, instant = false) => {
      const def = SHAPES[id];
      if (!def || !region) return;
      timers.forEach(clearTimeout);
      timers = [];
      current = id;
      shapeStart = now;
      lastFocus = undefined;
      cv.dataset.shape = id;
      if (reduce) {
        apply(def.build(region, def.phases.length), true);
        return;
      }
      cv.dataset.phase = "0";
      apply(def.build(region, 0), instant);
      def.phases.forEach((at, i) =>
        timers.push(
          setTimeout(() => {
            if (current !== id) return;
            cv.dataset.phase = String(i + 1);
            apply(def.build(region, i + 1), false);
          }, at * 1000)
        )
      );
    };

    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth;
      H = innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const x0 = Math.round(W * 0.42);
      const x1 = Math.round(W * 0.955);
      const y0 = Math.round(Math.max(112, H * 0.16));
      const y1 = Math.round(H - Math.max(68, H * 0.11));
      region = { W, H, u: clamp(W / 1280, 0.85, 1.5), x0, x1, y0, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
      st.region = region;
      if (!placed) {
        // first paint: every dot starts at the centre of the field and bursts out to its place
        placed = true;
        dots.forEach((d, i) => {
          d.x = region.cx + (Math.sin(i * 12.9898) - 0.5) * 20;
          d.y = region.cy + (Math.cos(i * 78.233) - 0.5) * 20;
        });
      }
      if (current) show(current, true);
    };

    const onMove = (e) => {
      ptr.x = e.clientX;
      ptr.y = e.clientY;
    };
    const onLeave = () => {
      ptr.x = -9999;
      ptr.y = -9999;
    };

    let last = performance.now();
    const frame = () => {
      if (dead) return;
      now = performance.now();
      const dt = clamp((now - last) / 1000, 0.001, 0.05);
      last = now;
      const ts = now / 1000;
      st.t = ts;
      st.sim += dt;
      st.since = (now - shapeStart) / 1000;
      st.propFocus = focusRef.current;

      const def = SHAPES[current];
      const f = def && def.focusOf ? def.focusOf(st) : null;
      st.focus = f;
      if (f !== lastFocus) {
        lastFocus = f;
        if (callbackRef.current) callbackRef.current(f);
      }
      if (def && def.frame) def.frame(st, dots);

      const push = !reduce && !(def && def.noPush);
      const R = 90 * region.u;
      const R2 = R * R;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < N; i++) {
        const d = dots[i];
        if (d.pend && now >= d.pend.at) {
          place(d, d.pend.p);
          d.pend = null;
        }
        let tx = d.tx;
        let ty = d.ty;
        if (d.wob && !reduce) {
          const s = Math.sin(st.sim * d.wob[2] + d.wob[3]);
          tx += d.wob[0] * s;
          ty += d.wob[1] * s;
        }
        let ax = (tx - d.x) * SPRING - d.vx * DAMP;
        let ay = (ty - d.y) * SPRING - d.vy * DAMP;
        if (jitter && !reduce) {
          ax += (Math.random() - 0.5) * 420;
          ay += (Math.random() - 0.5) * 420;
        }
        if (push) {
          const dx = d.x - ptr.x;
          const dy = d.y - ptr.y;
          const q = dx * dx + dy * dy;
          if (q < R2) {
            const l = Math.sqrt(q) || 1;
            const k = (1 - l / R) * PUSH;
            ax += (dx / l) * k;
            ay += (dy / l) * k;
          }
        }
        d.vx += ax * dt;
        d.vy += ay * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        const tc = now < d.until ? HI : d.tc;
        const k = Math.min(1, dt * 7);
        d.c[0] += (tc[0] - d.c[0]) * k;
        d.c[1] += (tc[1] - d.c[1]) * k;
        d.c[2] += (tc[2] - d.c[2]) * k;
        d.r += (d.tr - d.r) * Math.min(1, dt * 6);
        ctx.fillStyle = `rgb(${d.c[0] | 0},${d.c[1] | 0},${d.c[2] | 0})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, 6.2832);
        ctx.fill();
      }
      if (def && def.draw) def.draw(ctx, st, dots);
      ctx.font = `${Math.round(11.5 * region.u)}px ${mono}`;
      ctx.textBaseline = "alphabetic";
      for (const l of labels) {
        const a = clamp((now - l.at) / 450, 0, 1);
        if (a <= 0) continue;
        ctx.globalAlpha = a;
        ctx.fillStyle = l.hi ? "#ffcf1f" : "#8b877e";
        ctx.textAlign = l.align || "left";
        ctx.fillText(l.t, l.x, l.y);
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = "left";
      next(frame);
    };

    size();
    addEventListener("resize", size);
    addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    api.current = { show };
    next(frame);

    return () => {
      dead = true;
      timers.forEach(clearTimeout);
      removeEventListener("resize", size);
      removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useEffect(() => {
    api.current?.show(shape);
  }, [shape]);

  return <canvas ref={ref} className="field" aria-hidden="true" />;
}
