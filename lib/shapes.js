// The dot field's formations. There are always N dots; each shape says where every dot goes, what
// colour it is and when it moves, so one set of dots re-forms into each case study.
//
// A shape is { phases: [seconds], build(ctx, phase) -> { pts, labels, jitter?, geo? } }.
// Phase 0 builds on arrival; each number in `phases` is when the next phase builds (a shape can change its mind).
// ctx = { W, H, u, x0, x1, y0, y1, w, h, cx, cy } is the area the dots may use. u scales sizes with screen width.
// A point is { x, y, c, r, delay, flash, wob, m }: colour, size (x base), seconds to wait, seconds of yellow flash on arrival,
// an optional wobble [ampX, ampY, speed, phase], and optional meta the live hooks below can read.
//
// Live shapes also have hooks the field calls with st = { t, since, ptr, region, reduce, propFocus, focus, geo, mono }:
//   focusOf(st)        which group is highlighted (the field tells the page, and the page can override it by hovering text)
//   frame(st, dots)    every frame: recolour, rotate, search
//   draw(g2d, st, dots) extra canvas drawing every frame
//   noPush             the cursor does not push dots aside

import { skills, cases } from "./content";

export const N = 1400; // 35 policies x 40 data points, so the migration shape can use every dot as one data point

export const COLORS = {
  faint: [96, 93, 86],
  quiet: [139, 135, 126],
  bone: [236, 232, 223],
  hi: [255, 207, 31],
};
const { faint: FAINT, quiet: QUIET, bone: BONE, hi: HI } = COLORS;

const rnd = (i, s) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Split the N dots between parts. A part owns a share (w) of them and says where its k-th of n dots goes.
function compose(parts) {
  const total = parts.reduce((s, p) => s + p.w, 0);
  const pts = [];
  let cum = 0;
  let start = 0;
  for (const p of parts) {
    cum += p.w;
    const end = Math.round((cum / total) * N);
    const n = end - start;
    for (let k = 0; k < n; k++) {
      const pos = p.at(k, n);
      const get = (v, dflt) => (typeof v === "function" ? v(k, n, pos) : v === undefined ? dflt : v);
      pts.push({ x: pos.x, y: pos.y, c: get(p.c, BONE), r: get(p.r, 1), delay: get(p.delay, 0), flash: get(p.flash, 0), wob: get(p.wob, null) });
    }
    start = end;
  }
  return pts;
}

// ---- where the k-th of n dots goes ------------------------------------------------------------------------------

// an even grid filling a rectangle
const grid = (x, y, w, h, fixedCols) => (k, n) => {
  const cols = fixedCols || Math.max(1, Math.round(Math.sqrt((n * w) / Math.max(h, 1))));
  const rows = Math.ceil(n / cols);
  const gc = k % cols;
  const gr = Math.floor(k / cols);
  return {
    x: x + (cols === 1 ? w / 2 : (gc / (cols - 1)) * w),
    y: y + (rows === 1 ? h / 2 : (gr / (rows - 1)) * h),
    gc, gr, cols, rows,
  };
};
// evenly along a straight line
const seg = (x1, y1, x2, y2) => (k, n) => {
  const t = n === 1 ? 0.5 : k / (n - 1);
  return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t, t };
};
// evenly along a curve given as t -> [x, y]
const curve = (f) => (k, n) => {
  const t = n === 1 ? 0.5 : k / (n - 1);
  const p = f(t);
  return { x: p[0], y: p[1], t };
};
const bez = (p0, p1, p2, p3) => (t) => {
  const m = 1 - t;
  const a = m * m * m, b = 3 * m * m * t, c = 3 * m * t * t, d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
};
// along the outline of a rectangle, optionally broken into dashes
const outline = (x, y, w, h, dash) => {
  const P = 2 * (w + h);
  const per = (s) => {
    s = ((s % P) + P) % P;
    if (s < w) return [x + s, y];
    s -= w;
    if (s < h) return [x + w, y + s];
    s -= h;
    if (s < w) return [x + w - s, y + h];
    s -= w;
    return [x, y + h - s];
  };
  return (k, n) => {
    if (!dash) {
      const p = per((k / n) * P);
      return { x: p[0], y: p[1] };
    }
    const cycle = dash.on + dash.off;
    const count = Math.max(1, Math.floor(P / cycle));
    const t = (k / n) * count * dash.on;
    const i = Math.floor(t / dash.on);
    const p = per(i * cycle + (t - i * dash.on));
    return { x: p[0], y: p[1] };
  };
};
const rot = (p, cx, cy, deg) => {
  const a = (deg * Math.PI) / 180;
  const dx = p.x - cx;
  const dy = p.y - cy;
  return { ...p, x: cx + dx * Math.cos(a) - dy * Math.sin(a), y: cy + dx * Math.sin(a) + dy * Math.cos(a) };
};

// ---- the shapes -------------------------------------------------------------------------------------------------

// Intro: raw, unstructured events. The engine keeps them jittering.
function raw(ctx) {
  const { x0, y0, w, h, y1, u } = ctx;
  return {
    jitter: true,
    pts: compose([{
      w: 1,
      at: (k) => ({ x: x0 + w * rnd(k, 1), y: y0 + h * rnd(k, 2) }),
      c: (k) => (rnd(k, 3) < 0.09 ? BONE : QUIET),
    }]),
    labels: [{ x: x0, y: y1 + 34 * u, t: "raw operational data · illustrative" }],
  };
}

// Cohort automation: the same job as two bars. The old way fills slowly, the new way is done almost at once.
function race(ctx, phase) {
  const { x0, y0, w, h, y1, u } = ctx;
  const COLS = 70;
  const bandH = h * 0.2;
  const yA = y0 + h * 0.16;
  const yB = y0 + h * 0.6;
  const band = (y, color, step) => ({
    w: 1,
    at: (k, n) => {
      const gc = k % COLS;
      const gr = Math.floor(k / COLS);
      const rows = Math.ceil(n / COLS);
      return { x: x0 + (gc / (COLS - 1)) * w, y: y + (rows < 2 ? 0 : (gr / (rows - 1)) * bandH), gc };
    },
    c: phase === 0 ? FAINT : color,
    delay: (k, n, pos) => (phase === 0 ? 0 : pos.gc * step),
  });
  return {
    pts: compose([band(yA, BONE, 0.1), band(yB, HI, 0.011)]),
    labels: [
      { x: x0, y: yA - 16 * u, t: "Before · ~2 days" },
      { x: x0, y: yB - 16 * u, t: "After · ~5 min", hi: true },
      { x: x0, y: y1 + 34 * u, t: "illustrative, not to scale" },
    ],
  };
}

// Data migration: 35 policies, 40 dots each (one dot per data point). Legacy: skewed, missing, flagged.
// New system: every dot snaps into line, a yellow front sweeping across.
const LEGACY = ["oosoogoo", "owoosoog", "goosowoo", "oowoosog", "soogowoo"]; // o fine, s skewed, g gap, w flagged

function records(ctx, phase) {
  const { x0, y0, w, h, y1, u } = ctx;
  const BC = 7;
  const BR = 5;
  const cw = w / BC;
  const chh = h / BR;
  const bw = cw * 0.7;
  const bh = chh * 0.52;
  const sx = bw / 7;
  const sy = bh / 4;
  const pts = [];
  for (let k = 0; k < N; k++) {
    const b = Math.floor(k / 40);
    const loc = k % 40;
    const lc = loc % 8;
    const lr = Math.floor(loc / 8);
    const bc = b % BC;
    const br = Math.floor(b / BC);
    let x = x0 + bc * cw + (cw - bw) / 2 + lc * sx;
    let y = y0 + br * chh + (chh - bh) / 2 + lr * sy;
    let c = BONE;
    let r = 1;
    let delay = 0;
    let flash = 0;
    if (phase === 0) {
      const kind = LEGACY[(lr + b) % 5][(lc + (b % 3)) % 8];
      if (kind === "s") { x += (lc % 2 ? 1 : -1) * sx * 0.5; y += (lr % 2 ? -1 : 1) * sy * 0.38; c = QUIET; }
      else if (kind === "g") { c = FAINT; r = 0.35; }
      else if (kind === "w") { c = BONE; r = 1.5; }
      else c = QUIET;
    } else {
      delay = (bc + lc / 8) * 0.3 + rnd(k, 4) * 0.12;
      flash = 0.55;
    }
    pts.push({ x, y, c, r, delay, flash, wob: null });
  }
  return {
    pts,
    labels: [
      phase === 0
        ? { x: x0, y: y0 - 18 * u, t: "Legacy systems · uneven and incomplete" }
        : { x: x0, y: y0 - 18 * u, t: "New system · every data point aligned", hi: true },
      { x: x0, y: y1 + 34 * u, t: "one block is one policy, one dot is one data point · illustrative" },
    ],
  };
}

// KPI dashboards: separate trackers, then one board with an operational and a financial panel.
const LINE = [[0, 0.79], [0.17, 0.68], [0.35, 0.75], [0.55, 0.5], [0.73, 0.55], [0.9, 0.29], [1, 0.21]];
const lineY = (t) => {
  for (let i = 1; i < LINE.length; i++) {
    if (t <= LINE[i][0]) {
      const [ta, ya] = LINE[i - 1];
      const [tb, yb] = LINE[i];
      return ya + ((yb - ya) * (t - ta)) / (tb - ta || 1);
    }
  }
  return LINE[LINE.length - 1][1];
};

function merge(ctx, phase) {
  const { x0, y0, w, h, y1, u } = ctx;
  const toss = () => (k) => rnd(k, 9) * 0.6;
  if (phase === 0) {
    const sheet = (fx, fy, fw, fh, deg) => ({
      w: 1,
      at: (k, n) => rot(grid(x0 + w * fx, y0 + h * fy, w * fw, h * fh)(k, n), x0 + w * (fx + fw / 2), y0 + h * (fy + fh / 2), deg),
      c: (k, n, pos) => (pos.gr === 0 ? BONE : QUIET),
    });
    return {
      pts: compose([sheet(0, 0.06, 0.36, 0.4, -4), sheet(0.32, 0.5, 0.36, 0.4, 3), sheet(0.64, 0.1, 0.36, 0.4, -2)]),
      labels: [{ x: x0, y: y1 + 34 * u, t: "Separate Excel trackers" }],
    };
  }
  const bx = x0 + w * 0.04;
  const by = y0 + h * 0.02;
  const bw = w * 0.92;
  const bh = h * 0.9;
  const pw = bw * 0.42;
  const px = bx + bw * 0.05;
  const fw = bw * 0.42;
  const fx = bx + bw * 0.53;
  const pTop = by + bh * 0.2;
  const pH = bh * 0.64;
  const heights = [0.4, 0.6, 0.5, 0.78, 0.66, 0.92];
  const barW = pw / (heights.length * 1.5 - 0.5);
  const bars = heights.map((hh, i) => ({
    w: hh * 4,
    at: grid(px + i * barW * 1.5, pTop + pH * (1 - hh), barW, pH * hh),
    c: BONE,
    delay: toss(),
  }));
  const AREA_COLS = 34;
  return {
    pts: compose([
      { w: 6, at: outline(bx, by, bw, bh), c: QUIET, delay: toss() },
      { w: 2, at: seg(bx, by + bh * 0.12, bx + bw, by + bh * 0.12), c: FAINT, delay: toss() },
      { w: 1.5, at: seg(bx + bw * 0.5, by + bh * 0.16, bx + bw * 0.5, by + bh * 0.96), c: FAINT, delay: toss() },
      ...bars,
      { w: 2.2, at: curve((t) => [fx + fw * t, pTop + pH * lineY(t)]), c: HI, delay: toss() },
      {
        w: 16,
        at: (k, n) => {
          const gc = k % AREA_COLS;
          const gr = Math.floor(k / AREA_COLS);
          const rows = Math.ceil(n / AREA_COLS);
          const t = gc / (AREA_COLS - 1);
          const top = pTop + pH * lineY(t) + 9 * u;
          return { x: fx + fw * t, y: top + (pTop + pH - top) * ((gr + 0.5) / rows) };
        },
        c: FAINT,
        delay: toss(),
      },
    ]),
    labels: [
      { x: px, y: pTop - 16 * u, t: "Operational" },
      { x: fx, y: pTop - 16 * u, t: "Financial" },
      { x: x0, y: y1 + 34 * u, t: "One dashboard · Power BI + Metabase", hi: true },
    ],
  };
}

// AI voice bot: inbound leads -> the voice bot (a live waveform) -> the CRM queue, priority lead on top.
const WAVE = [22, 40, 58, 34, 70, 46, 62, 30, 50, 26, 18];

function voice(ctx) {
  const { x0, y0, w, h, cy, u } = ctx;
  const colW = w * 0.24;
  const xL = x0;
  const xM = x0 + w * 0.38;
  const xR = x0 + w - colW;
  const rowY = [0.22, 0.38, 0.54, 0.7].map((f) => y0 + h * f);
  const lens = [0.92, 0.7, 1, 0.62];
  const rowH = h * 0.075;
  const leads = (x, hiTop) =>
    lens.map((len, i) => ({ w: len * 5, at: grid(x, rowY[i], colW * len, rowH), c: hiTop && i === 0 ? HI : BONE }));
  const bars = WAVE.map((v, j) => {
    const bh = (v / 70) * h * 0.52;
    const bx = xM + (j / (WAVE.length - 1)) * (w * 0.24);
    return {
      w: 1 + v / 35,
      at: seg(bx, cy - bh / 2, bx, cy + bh / 2),
      c: BONE,
      wob: (k, n) => [0, ((n < 2 ? 0 : k / (n - 1)) - 0.5) * 0.4 * bh, 2.2, j * 0.8],
    };
  });
  const arrow = (xa, xb) => [
    { w: 3, at: seg(xa, cy, xb, cy), c: QUIET },
    { w: 0.8, at: seg(xb - 9 * u, cy - 7 * u, xb, cy), c: QUIET },
    { w: 0.8, at: seg(xb - 9 * u, cy + 7 * u, xb, cy), c: QUIET },
  ];
  return {
    pts: compose([
      ...leads(xL, false),
      ...bars,
      ...leads(xR, true),
      ...arrow(xL + colW + 12 * u, xM - 14 * u),
      ...arrow(xM + w * 0.24 + 14 * u, xR - 14 * u),
    ]),
    labels: [
      { x: xL, y: y0 + h * 0.1, t: "Inbound leads" },
      { x: xM, y: y0 + h * 0.1, t: "AI voice bot" },
      { x: xR, y: y0 + h * 0.1, t: "CRM handoff" },
      { x: xR, y: rowY[0] - 12 * u, t: "Priority", hi: true },
    ],
  };
}

// Series-A: one set of metrics feeds the pitch decks and the due diligence, which lead to a round that is still open (dashed).
function raise(ctx) {
  const { x0, y0, w, h, cy, y1, u } = ctx;
  const A = { x: x0, y: cy - h * 0.15, w: w * 0.27, h: h * 0.3 };
  const B1 = { x: x0 + w * 0.42, y: y0 + h * 0.08, w: w * 0.24, h: h * 0.2 };
  const B2 = { x: x0 + w * 0.42, y: y0 + h * 0.72, w: w * 0.24, h: h * 0.2 };
  const C = { x: x0 + w * 0.78, y: cy - h * 0.13, w: w * 0.22, h: h * 0.26 };
  const link = (a, b) => {
    const mid = (a[0] + b[0]) / 2;
    return { w: 5, at: curve(bez(a, [mid, a[1]], [mid, b[1]], b)), c: QUIET };
  };
  const right = (n, f) => [n.x + n.w, n.y + n.h * f];
  const left = (n, f) => [n.x, n.y + n.h * f];
  return {
    pts: compose([
      { w: 24, at: grid(A.x, A.y, A.w, A.h), c: BONE },
      { w: 12, at: grid(B1.x, B1.y, B1.w, B1.h), c: BONE },
      { w: 12, at: grid(B2.x, B2.y, B2.w, B2.h), c: BONE },
      { w: 14, at: outline(C.x, C.y, C.w, C.h, { on: 12 * u, off: 9 * u }), c: HI },
      link(right(A, 0.3), left(B1, 0.5)),
      link(right(A, 0.7), left(B2, 0.5)),
      link(right(B1, 0.5), left(C, 0.3)),
      link(right(B2, 0.5), left(C, 0.7)),
    ]),
    labels: [
      { x: A.x, y: A.y - 14 * u, t: "Financial + operational metrics" },
      { x: B1.x, y: B1.y - 14 * u, t: "Investor pitch decks" },
      { x: B2.x, y: B2.y - 14 * u, t: "Due diligence" },
      { x: C.x, y: C.y + C.h + 26 * u, t: "Series-A · in progress", hi: true },
      { x: x0, y: y1 + 34 * u, t: "illustrative, not a measured flow" },
    ],
  };
}

// RM allocation: the same three leads, sent two ways. Only the potential client (yellow) changes route.
function route(ctx, phase) {
  const { x0, y0, w, h, cy, y1, u } = ctx;
  const ys = [y0 + h * 0.16, cy, y0 + h * 0.84];
  const nw = w * 0.1;
  const nh = h * 0.11;
  const xl = x0;
  const xr = x0 + w - nw;
  const pairs = phase === 0 ? [[0, 0], [1, 1], [2, 2]] : [[0, 1], [1, 0], [2, 2]];
  const path = ([a, b]) => {
    const x1 = xl + nw + 8 * u;
    const x2 = xr - 8 * u;
    const mid = (x1 + x2) / 2;
    return {
      w: 9,
      at: curve(bez([x1, ys[a]], [mid, ys[a]], [mid, ys[b]], [x2, ys[b]])),
      c: a === 1 ? HI : QUIET,
      delay: (k, n) => (phase === 0 ? 0 : (k / n) * 0.5),
    };
  };
  const node = (x, i, color, flash) => ({ w: 7, at: grid(x, ys[i] - nh / 2, nw, nh), c: color, flash: flash ? 0.6 : 0 });
  return {
    pts: compose([
      node(xl, 0, BONE), node(xl, 1, HI), node(xl, 2, BONE),
      node(xr, 0, phase === 1 ? HI : BONE, phase === 1), node(xr, 1, BONE), node(xr, 2, BONE),
      ...pairs.map(path),
    ]),
    labels: [
      phase === 0
        ? { x: x0, y: y0 - 18 * u, t: "Before · round-robin" }
        : { x: x0, y: y0 - 18 * u, t: "After · by criteria: entity type, revenue, GWP", hi: true },
      { x: xl, y: ys[1] - nh / 2 - 12 * u, t: "Potential client", hi: true },
      { x: xr + nw, y: ys[0] - nh / 2 - 12 * u, t: phase === 1 ? "Right RM" : "RM", align: "right", hi: phase === 1 },
      { x: xr + nw, y: ys[1] - nh / 2 - 12 * u, t: phase === 0 ? "Fresher" : "RM", align: "right" },
      { x: xr + nw, y: ys[2] - nh / 2 - 12 * u, t: "RM", align: "right" },
      { x: x0, y: y1 + 34 * u, t: "illustrative" },
    ],
  };
}

// Elsewhere and contact: a calm grid with a slow ripple. The story is over.
function still(ctx) {
  const { x0, y0, w, h, u } = ctx;
  return {
    pts: compose([{
      w: 1,
      at: grid(x0, y0, w, h, 40), // 40 x 35 = 1400, a full grid with no ragged last row
      c: (k) => (rnd(k, 5) < 0.07 ? BONE : QUIET),
      wob: (k, n, pos) => [0, 1.4 * u, 0.9, (pos.gc + pos.gr) * 0.4],
    }]),
    labels: [],
  };
}

// ---- Skills, SmartShelf, mentoring -------------------------------------------------------------------------------

const HEX = { quiet: "#8b877e", bone: "#ece8df", hi: "#ffcf1f" };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const put = (g2d, st, s, x, y, color, size, align = "left") => {
  g2d.font = `${size}px ${st.mono}`;
  g2d.fillStyle = color;
  g2d.textAlign = align;
  g2d.fillText(s, x, y);
};

// Skills, proven: skill groups down the side, the six cases across the top.
// A lit block means that group showed up in that case (see `skills` in content.js).
const USE = skills.map(([, , ids]) => cases.map((c) => ids.includes(c.id)));

function matrix(ctx) {
  const { x0, y0, w, h } = ctx;
  const rows = skills.length;
  const cols = cases.length;
  const gx = x0 + w * 0.24;
  const gy = y0 + h * 0.1;
  const gw = w * 0.76;
  const gh = h * 0.84;
  const cw = gw / cols;
  const rh = gh / rows;
  const bw = cw * 0.74;
  const bh = rh * 0.62;
  const lit = USE.flat().filter(Boolean).length;
  const unlit = rows * cols - lit;
  const per = Math.floor((N - unlit) / lit);
  let extra = N - unlit - per * lit;
  const pts = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = gx + c * cw + (cw - bw) / 2;
      const y = gy + r * rh + (rh - bh) / 2;
      const delay = r * 0.1 + c * 0.06;
      if (USE[r][c]) {
        const n = per + (extra-- > 0 ? 1 : 0);
        const at = grid(x, y, bw, bh);
        for (let k = 0; k < n; k++) {
          const p = at(k, n);
          pts.push({ x: p.x, y: p.y, c: BONE, r: 1, delay: delay + rnd(k, r * 9 + c) * 0.3, m: { kind: "matrix", r, c, lit: true } });
        }
      } else pts.push({ x: x + bw / 2, y: y + bh / 2, c: FAINT, r: 0.8, delay, m: { kind: "matrix", r, c, lit: false } });
    }
  }
  return { pts, labels: [], geo: { left: gx - w * 0.23, right: gx + gw, gx, gy, gh, cw, rh } };
}

// Which skill group is lit: the one hovered in the text, else the row under the cursor, else it cycles by itself.
function matrixFocus(st) {
  if (st.propFocus != null) return st.propFocus;
  const g = st.geo;
  if (g && st.ptr.x > g.left && st.ptr.x < g.right && st.ptr.y > g.gy && st.ptr.y < g.gy + g.gh) {
    return clamp(Math.floor((st.ptr.y - g.gy) / g.rh), 0, skills.length - 1);
  }
  return st.reduce ? -1 : Math.floor(st.since / 2.2) % skills.length;
}

function matrixFrame(st, dots) {
  for (let i = 0; i < dots.length; i++) {
    const d = dots[i];
    const m = d.m;
    if (!m || m.kind !== "matrix") continue;
    d.tc = !m.lit ? FAINT : m.r === st.focus ? HI : BONE;
  }
}

function matrixDraw(g2d, st) {
  const g = st.geo;
  if (!g) return;
  const u = st.region.u;
  const fs = 11.5 * u;
  skills.forEach(([name], r) => put(g2d, st, name, g.gx - 14 * u, g.gy + r * g.rh + g.rh / 2 + 4 * u, r === st.focus ? HEX.hi : HEX.quiet, fs, "right"));
  cases.forEach((c, i) => put(g2d, st, c.col, g.gx + i * g.cw + g.cw / 2, g.gy - 14 * u, HEX.quiet, fs, "center"));
  put(g2d, st, "a lit block means that skill group showed up in that case", g.gx, st.region.y1 + 34 * u, HEX.quiet, fs * 0.92);
}

// SmartShelf: an embedding space. Your cursor is the emotional cue; the five nearest titles light up.
const BLOBS = [[0.1, 0.2], [0.4, 0.12], [0.72, 0.2], [0.92, 0.45], [0.55, 0.45], [0.2, 0.5], [0.12, 0.82], [0.48, 0.82], [0.8, 0.8]];
const gauss = (i, s) => Math.sqrt(-2 * Math.log(Math.max(1e-6, rnd(i, s)))) * Math.cos(6.2832 * rnd(i, s + 1));

function embed(ctx) {
  const { x0, y0, w, h, y1, u } = ctx;
  const sg = Math.min(w, h) * 0.055;
  const pts = [];
  for (let i = 0; i < N; i++) {
    const b = BLOBS[i % BLOBS.length];
    const c = rnd(i, 5) < 0.08 ? BONE : QUIET;
    pts.push({
      x: clamp(x0 + w * b[0] + gauss(i, 1) * sg * 1.3, x0, x0 + w),
      y: clamp(y0 + h * b[1] + gauss(i, 3) * sg, y0, y0 + h),
      c,
      r: 0.95,
      m: { kind: "embed", base: c },
    });
  }
  return { pts, labels: [{ x: x0, y: y1 + 34 * u, t: "each dot is a book title · illustrative embedding space" }] };
}

function embedFrame(st, dots) {
  const { x0, x1, y0, y1, w, h } = st.region;
  const inside = st.ptr.x >= x0 - 30 && st.ptr.x <= x1 + 30 && st.ptr.y >= y0 - 30 && st.ptr.y <= y1 + 30;
  const idle = st.reduce
    ? { x: x0 + w * 0.55, y: y0 + h * 0.5 }
    : { x: x0 + w * (0.5 + 0.36 * Math.sin(st.sim * 0.5)), y: y0 + h * (0.5 + 0.34 * Math.sin(st.sim * 0.73 + 1)) };
  const cue = inside ? { x: st.ptr.x, y: st.ptr.y } : idle;
  st.cue = cue;
  const best = []; // [distance squared, dot index], nearest first, at most five
  for (let i = 0; i < dots.length; i++) {
    const d = dots[i];
    if (!d.m || d.m.kind !== "embed") continue;
    const q = (d.x - cue.x) ** 2 + (d.y - cue.y) ** 2;
    if (best.length < 5 || q < best[best.length - 1][0]) {
      best.push([q, i]);
      best.sort((a, b) => a[0] - b[0]);
      if (best.length > 5) best.pop();
    }
  }
  const hot = new Set(best.map((b) => b[1]));
  st.near = best.map((b) => b[1]);
  for (let i = 0; i < dots.length; i++) {
    const d = dots[i];
    if (!d.m || d.m.kind !== "embed") continue;
    const on = hot.has(i);
    d.tc = on ? HI : d.m.base;
    d.tr = on ? d.r0 * 2.3 : d.r0;
  }
}

function embedDraw(g2d, st, dots) {
  const cue = st.cue;
  if (!cue || !st.near) return;
  const u = st.region.u;
  g2d.strokeStyle = "rgba(255, 207, 31, 0.55)";
  g2d.lineWidth = 1;
  for (const i of st.near) {
    g2d.beginPath();
    g2d.moveTo(cue.x, cue.y);
    g2d.lineTo(dots[i].x, dots[i].y);
    g2d.stroke();
  }
  g2d.strokeStyle = HEX.hi;
  g2d.lineWidth = 1.5;
  g2d.beginPath();
  g2d.arc(cue.x, cue.y, 9 * u, 0, 6.2832);
  g2d.stroke();
  g2d.fillStyle = HEX.hi;
  g2d.beginPath();
  g2d.arc(cue.x, cue.y, 2.4 * u, 0, 6.2832);
  g2d.fill();
  put(g2d, st, "emotional cue", cue.x + 16 * u, cue.y - 12 * u, HEX.hi, 11.5 * u);
}

// Mentoring: five rings for five-plus years (the outer one dashed), the mentor at the centre, Technophilia on its own.
const RING_SPEED = [0.28, -0.22, 0.17, -0.13, 0.1];

function rings(ctx) {
  const { x0, y0, w, h, y1, u } = ctx;
  const cx = x0 + w * 0.6;
  const cy = y0 + h * 0.46;
  const R = h * 0.5;
  const rad = [0.18, 0.36, 0.54, 0.72, 0.9].map((f) => f * R);
  const nCenter = 7;
  const nTech = 90;
  const ringN = N - nCenter - nTech;
  const total = rad.reduce((a, b) => a + b, 0);
  const pts = [];
  for (let k = 0; k < nCenter; k++) {
    const rr = h * 0.03 * Math.sqrt((k + 0.5) / nCenter);
    const th = k * 2.4;
    pts.push({ x: cx + rr * Math.cos(th), y: cy + rr * Math.sin(th), c: HI, r: 1.3, m: { kind: "ring", ring: -1 } });
  }
  let used = 0;
  rad.forEach((r, k) => {
    const last = k === rad.length - 1;
    const n = last ? ringN - used : Math.round((ringN * r) / total);
    used += n;
    for (let j = 0; j < n; j++) {
      let t = j / n;
      if (last) {
        const segs = 16;
        const s = Math.floor(t * segs);
        t = (s + (t * segs - s) * 0.55) / segs; // dashes: the outer ring is "5+"
      }
      const th = t * 6.2832;
      pts.push({ x: cx + r * Math.cos(th), y: cy + r * Math.sin(th), c: BONE, r: 1, m: { kind: "ring", ring: k, th, r } });
    }
  });
  const tx = x0 + w * 0.1;
  const ty = y0 + h * 0.84;
  for (let k = 0; k < nTech; k++) {
    const rr = h * 0.07 * Math.sqrt((k + 0.5) / nTech);
    const th = k * 2.39996;
    pts.push({ x: tx + rr * Math.cos(th), y: ty + rr * Math.sin(th), c: QUIET, r: 1, m: { kind: "ring", ring: -2 } });
  }
  return {
    pts,
    geo: { cx, cy },
    labels: [
      ...["1", "2", "3", "4", "5+"].map((t, k) => ({ x: cx + rad[k] * Math.cos(-0.7) + 6 * u, y: cy + rad[k] * Math.sin(-0.7) - 4 * u, t, hi: k === 4 })),
      { x: cx, y: cy + rad[4] + 24 * u, t: "years of mentoring", align: "center" },
      { x: tx, y: ty + h * 0.07 + 22 * u, t: "Technophilia", align: "center" },
      { x: x0, y: y1 + 34 * u, t: "illustrative: one ring per year, not data" },
    ],
  };
}

function ringsFrame(st, dots) {
  const g = st.geo;
  if (!g || st.reduce) return;
  for (let i = 0; i < dots.length; i++) {
    const d = dots[i];
    const m = d.m;
    if (!m || m.kind !== "ring" || m.ring < 0) continue;
    const a = m.th + RING_SPEED[m.ring] * st.sim;
    d.tx = g.cx + m.r * Math.cos(a);
    d.ty = g.cy + m.r * Math.sin(a);
  }
}

export const SHAPES = {
  raw: { phases: [], build: raw },
  race: { phases: [0.5], build: race },
  records: { phases: [1.6], build: records },
  merge: { phases: [1.5], build: merge },
  voice: { phases: [], build: voice },
  raise: { phases: [], build: raise },
  route: { phases: [2.2], build: route },
  matrix: { phases: [], build: matrix, focusOf: matrixFocus, frame: matrixFrame, draw: matrixDraw, noPush: true },
  embed: { phases: [], build: embed, frame: embedFrame, draw: embedDraw, noPush: true },
  rings: { phases: [], build: rings, frame: ringsFrame },
  still: { phases: [], build: still },
};
