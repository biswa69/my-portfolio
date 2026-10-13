"use client";
import { useEffect, useRef } from "react";
import { N, SHAPES, COLORS } from "../lib/shapes";

// One canvas, fixed behind the page, with N dots on springs. `shape` names the formation (lib/shapes.js).
// The dots move; nothing else on the page does. Hover pushes them aside, except on shapes that read the cursor.
// `focus` lets the text pick the highlighted group; `onFocus` tells the text which group the field is highlighting.
// `flip` puts the field on the left, for a chapter whose text sits on the right; the dots then fly across to their new side.
// Drawing is kept cheap: each colour becomes its CSS string once, a frame is not redrawn when nothing in it has changed, and the
// loop stops once the formation has settled (it starts again when the cursor comes near, or when the formation changes).

const SPRING = 38; // pull toward the target
const DAMP = 9; // a few percent overshoot, then settle in about 0.7s
const PUSH = 2800; // how hard the cursor pushes dots away
const HI = COLORS.hi;
const TAU = 6.2832;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function Field({ shape, flip = false, focus = null, onFocus }) {
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
    if (!matchMedia("(min-width: 1024px)").matches) return; // a phone has no dots (see WIDE in Showcase.js)
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
    let flipped = false; // false: the field is right of the text; true: left of it
    let labels = [];
    let timers = [];
    let dead = false;
    let placed = false;
    let cw = 0; // the page's width beside the scrollbar; read once per resize, because reading it forces the page to lay out
    let asleep = false; // the loop has stopped because nothing is moving
    let quiet = 0; // frames in a row in which nothing moved
    let forced = true; // the next frame must be drawn even if nothing moved (new size, new formation)
    let wasMoving = true;
    // A colour is turned into its CSS string once, not once per dot per frame.
    const cssCache = new Map();
    const cssOf = (key) => {
      let s = cssCache.get(key);
      if (s === undefined) {
        if (cssCache.size > 2000) cssCache.clear();
        cssCache.set(key, (s = `rgb(${key >> 16},${(key >> 8) & 255},${key & 255})`));
      }
      return s;
    };
    let last = performance.now();
    const wake = () => {
      quiet = 0;
      if (!asleep) return;
      asleep = false;
      last = performance.now();
      next(frame);
    };
    const ptr = { x: -9999, y: -9999 };
    // what live shapes can read each frame (see the header of lib/shapes.js)
    // `sim` is time as the dots feel it: it only advances by the (capped) step of each frame, so anything driven by it
    // (rotation, the idle cue) slows down with the frame rate instead of running ahead of the springs.
    const st = { t: 0, sim: 0, since: 0, ptr, region: null, reduce, propFocus: null, focus: null, geo: null, mono };
    const dots = Array.from({ length: N }, () => ({
      x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0,
      c: COLORS.quiet.slice(), tc: COLORS.quiet, r: 1, tr: 1, r0: 1, key: -1, css: "",
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
          d.key = -1; // its colour is worked out again on the next frame
          d.r = d.tr;
          d.until = 0;
        } else if (p.delay) d.pend = { at: now + p.delay * 1000, p };
        else place(d, p);
      }
      forced = true;
      wake();
    };

    // When the field changes sides, the dots whose place is nearest the side they are heading for set off first,
    // so the flock streams across instead of lurching.
    const sweep = (b) => {
      for (const p of b.pts) {
        const lead = flipped ? p.x - region.x0 : region.x1 - p.x;
        p.delay = (p.delay || 0) + clamp(lead / region.w, 0, 1) * 0.3;
      }
    };

    const show = (id, instant = false, turned = false) => {
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
      const first = def.build(region, 0);
      if (turned && !instant) sweep(first);
      apply(first, instant);
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

    // Where the dots may go: the part of the page the text column leaves free. The three numbers repeat --pad, --col and
    // --gap in globals.css, so the text and the field always sit side by side; change them together.
    const setRegion = () => {
      const pad = clamp(W * 0.046, 48, 88);
      const col = clamp(W * 0.42, 400, 820);
      const gap = clamp(W * 0.046, 40, 96);
      const x0 = Math.round(flipped ? pad : pad + col + gap);
      const x1 = Math.round(flipped ? cw - pad - col - gap : cw - pad);
      const y0 = Math.round(Math.max(112, H * 0.16));
      const y1 = Math.round(H - Math.max(68, H * 0.11));
      region = { W, H, u: clamp(W / 1280, 0.85, 1.5), x0, x1, y0, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
      st.region = region;
    };

    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth;
      H = innerHeight;
      cw = document.documentElement.clientWidth || W; // the page lays out beside the scrollbar
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      setRegion();
      if (!placed) {
        // first paint: every dot starts at the centre of the field and bursts out to its place
        placed = true;
        dots.forEach((d, i) => {
          d.x = region.cx + (Math.sin(i * 12.9898) - 0.5) * 20;
          d.y = region.cy + (Math.cos(i * 78.233) - 0.5) * 20;
        });
      }
      forced = true;
      if (current) show(current, true);
      wake();
    };

    // The cursor can only move dots that are within its reach of the field, so a loop that has stopped wakes up only for that.
    const onMove = (e) => {
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      if (!region) return;
      const R = 90 * region.u;
      if (ptr.x > region.x0 - R && ptr.x < region.x1 + R && ptr.y > region.y0 - R && ptr.y < region.y1 + R) wake();
    };
    const onLeave = () => {
      ptr.x = -9999;
      ptr.y = -9999;
      wake();
    };

    // Draws every dot, then the live shape's own drawing and the labels. A dot is one filled circle: the browser has a fast path
    // for that, and it loses to nothing tried here (one path per colour, sprites).
    const draw = (def) => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < N; i++) {
        const d = dots[i];
        ctx.fillStyle = d.css;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, TAU);
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
    };

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
      const kc = Math.min(1, dt * 7); // how quickly a colour follows its target
      const kr = Math.min(1, dt * 6); // and a size
      let moving = false; // some dot is still travelling, changing colour or size, flashing or waiting to start
      for (let i = 0; i < N; i++) {
        const d = dots[i];
        if (d.pend) {
          moving = true;
          if (now >= d.pend.at) {
            place(d, d.pend.p);
            d.pend = null;
          }
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
        // colour and size follow their targets; a dot that has arrived is drawn in exactly its target colour and is left alone
        const flash = now < d.until;
        const tc = flash ? HI : d.tc;
        const c = d.c;
        if (d.key < 0 || c[0] !== tc[0] || c[1] !== tc[1] || c[2] !== tc[2]) {
          c[0] += (tc[0] - c[0]) * kc;
          c[1] += (tc[1] - c[1]) * kc;
          c[2] += (tc[2] - c[2]) * kc;
          let key;
          if (Math.abs(tc[0] - c[0]) < 0.5 && Math.abs(tc[1] - c[1]) < 0.5 && Math.abs(tc[2] - c[2]) < 0.5) {
            c[0] = tc[0];
            c[1] = tc[1];
            c[2] = tc[2];
            key = (tc[0] << 16) | (tc[1] << 8) | tc[2];
          } else {
            moving = true;
            key = ((c[0] | 0) << 16) | ((c[1] | 0) << 8) | (c[2] | 0);
          }
          if (key !== d.key) {
            d.key = key;
            d.css = cssOf(key);
          }
        }
        if (d.r !== d.tr) {
          d.r += (d.tr - d.r) * kr;
          if (Math.abs(d.tr - d.r) < 0.01) d.r = d.tr;
          else moving = true;
        }
        if (flash) moving = true;
        if (!moving && (Math.abs(d.vx) > 0.5 || Math.abs(d.vy) > 0.5 || Math.abs(tx - d.x) > 0.02 || Math.abs(ty - d.y) > 0.02)) moving = true;
      }
      // a canvas in which nothing has changed is left as it is; a shape with drawing of its own is never unchanged
      const live = (jitter && !reduce) || !!(def && (def.draw || def.frame));
      let fading = false;
      for (const l of labels) {
        if (now < l.at + 450) {
          fading = true;
          break;
        }
      }
      if (moving || wasMoving || live || fading || forced) {
        draw(def);
        forced = false;
        quiet = 0;
      } else quiet++;
      wasMoving = moving;
      // nothing has moved for a moment: stop the loop (wake() starts it again)
      if (quiet > 12 && !live) {
        asleep = true;
        return;
      }
      next(frame);
    };

    size();
    addEventListener("resize", size);
    addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    api.current = {
      show: (id, f = false) => {
        const turned = f !== flipped;
        flipped = f;
        if (turned) setRegion();
        show(id, false, turned);
      },
    };
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
    api.current?.show(shape, flip);
  }, [shape, flip]);

  return <canvas ref={ref} className="field" aria-hidden="true" />;
}
