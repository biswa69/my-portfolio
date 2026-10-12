"use client";
import { useEffect, useRef, useState } from "react";
import Field from "./Field";
import {
  person, hero, cases, chapters, elsewhereIds, noteRows, skills, alsoTools, experience, project, leadership,
} from "../lib/content";

const pad = (n) => String(n).padStart(2, "0");
const tick = (f) => (document.hidden ? setTimeout(f, 16) : requestAnimationFrame(f));
// A flipped chapter has its text on the right (and the dots on the left); see `chapters` in lib/content.js.
const FLIPPED = new Set(chapters.filter((c) => c.flip).map((c) => c.id));
const side = (id) => (FLIPPED.has(id) ? " flip" : "");
// Each chapter owns this much scroll, as a fraction of the screen height, and the text stays fixed while you scroll through it.
// Keep equal to --run in globals.css.
const RUN = 0.7;
// The text of a chapter that has just taken over waits this long (ms) before it starts to rise in, so the dots clear its side first.
// Keep equal to --reveal in globals.css.
const REVEAL = 520;
// Moves to a chapter, for when keyboard focus lands in text that is not showing.
const reveal = (id) => document.getElementById(id)?.scrollIntoView();

// A big number that counts up once, when its case takes over. Server and first paint show the final value.
function CountUp({ text, run }) {
  const [shown, setShown] = useState(text);
  const played = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (!run || played.current) return;
    played.current = true;
    const m = text.match(/^(\D*?)(\d[\d,]*)(.*)$/);
    if (!m || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const [, pre, num, post] = m;
    const to = parseInt(num.replace(/,/g, ""), 10);
    const commas = num.includes(",");
    const t0 = performance.now() + REVEAL + 90; // the number rises in a moment after REVEAL: count as it appears
    const step = () => {
      if (!alive.current) return;
      const t = Math.min(1, Math.max(0, (performance.now() - t0) / 700));
      const v = Math.round(to * (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)));
      setShown(pre + (commas ? v.toLocaleString("en-US") : String(v)) + post);
      if (t < 1) tick(step);
    };
    tick(step);
  }, [run, text]);

  return <>{shown}</>;
}

// `st` is " on" for the chapter being shown, " past" for the ones before it and " next" for the ones after it (see `.rv` in globals.css).
// Every block of text carries `rv`: it rises into place when its chapter takes over and lifts away when it leaves.
function Case({ c, n, st }) {
  const on = st === " on";
  const [from, to] = c.hero;
  // a long "before" ("Separate Excel trackers") sits on its own line above the big figure; a short one stays inline
  const stacked = Boolean(from) && from.length > 8;
  // font size is limited by how many characters the line holds, so long figures like "Rs. 100 Cr" still fit the column
  const len = to.length + (from && !stacked ? from.length * 0.34 + 1 : 0);
  return (
    <section id={c.id} className={`ch case${side(c.id)}${st}`} aria-labelledby={`${c.id}-t`}>
      <div className="ch-in" onFocus={() => !on && reveal(c.id)}>
        <p className="k rv">
          {pad(n + 1)} / {pad(cases.length)} · {c.tag}
          {c.status ? ` · ${c.status}` : ""}
        </p>
        <h2 id={`${c.id}-t`} className="case-t rv">{c.title}</h2>
        <p className={`big rv${stacked ? " stack" : ""}`} style={{ "--len": len }}>
          {from && (
            <>
              <s>{from}</s>
              <i aria-hidden="true">→</i>
            </>
          )}
          <CountUp text={to} run={on} />
        </p>
        <p className="big-l rv">{c.label}</p>
        <dl className="notes">
          {noteRows.filter(([key]) => c[key]).map(([key, label]) => (
            <div key={key} className="rv">
              <dt>{label}</dt>
              <dd>{c[key]}</dd>
            </div>
          ))}
        </dl>
        {c.measure && (
          <div className="measure rv">
            <p className="k">How I’d measure it · illustrative framing, not a result</p>
            <dl className="notes">
              {c.measure.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Showcase() {
  const [active, setActive] = useState("intro");
  const [focus, setFocus] = useState(null); // the skill group the field is highlighting
  const [hover, setHover] = useState(null); // the skill group the visitor is pointing at in the text

  // Once the script is running the text is fixed in place and only the active chapter's is shown (see `.gated` in globals.css).
  // The layout script in app/layout.js sets this before the first paint; this keeps it set. Without the script the text is just a column.
  useEffect(() => {
    document.documentElement.classList.add("gated");
    return () => document.documentElement.classList.remove("gated");
  }, []);

  // The blocks of a chapter's text rise one after another, in reading order: number them for the delay in globals.css.
  useEffect(() => {
    document.querySelectorAll(".ch-in").forEach((text) => text.querySelectorAll(".rv").forEach((el, i) => el.style.setProperty("--i", i)));
  }, []);

  // Each chapter owns RUN of scroll. The active chapter is the last one whose section top has passed half of RUN down the
  // screen, so the switch happens halfway between two chapters. A chapter whose text is taller than the screen is given extra
  // scroll (`over`, in px), and its text rises through that distance (--shift) so the rest can be read.
  useEffect(() => {
    const ids = chapters.map((c) => c.id);
    const secs = ids.map((id) => document.getElementById(id));
    const texts = secs.map((s) => s?.querySelector(".ch-in"));
    let over = ids.map(() => 0);
    let last = "intro";
    let timer = 0;

    // how tall a chapter's text is, from where its blocks sit in the layout (their transforms, which hide them, are not counted)
    const textHeight = (box) => {
      const first = box.firstElementChild;
      const lastBlock = box.lastElementChild;
      if (!first || !lastBlock) return 0;
      const top = first.offsetTop - (parseFloat(getComputedStyle(first).marginTop) || 0);
      const bottom = lastBlock.offsetTop + lastBlock.offsetHeight + (parseFloat(getComputedStyle(lastBlock).marginBottom) || 0);
      return bottom - top;
    };
    const measure = () => {
      over = secs.map((s, i) => {
        const o = texts[i] ? Math.max(0, Math.round(textHeight(texts[i]) - (innerHeight - 128))) : 0; // text may reach 24px from the bottom
        if (s) s.style.height = o ? `calc(var(--run) + ${o}px)` : "";
        return o;
      });
    };
    const pick = () => {
      const line = innerHeight * RUN * 0.5;
      let best = 0;
      secs.forEach((s, i) => {
        if (s && s.getBoundingClientRect().top <= line) best = i;
      });
      texts[best]?.style.setProperty("--shift", `${Math.min(over[best], Math.max(0, -secs[best].getBoundingClientRect().top))}px`);
      if (ids[best] === last) return;
      last = ids[best];
      clearTimeout(timer);
      timer = window.setTimeout(() => setActive(ids[best]), 60);
    };
    const refresh = () => {
      measure();
      pick();
    };

    refresh();
    document.fonts?.ready.then(refresh);
    addEventListener("scroll", pick, { passive: true });
    addEventListener("resize", refresh);
    return () => {
      clearTimeout(timer);
      removeEventListener("scroll", pick);
      removeEventListener("resize", refresh);
    };
  }, []);

  const shape = chapters.find((c) => c.id === active)?.shape ?? "raw";
  const flip = FLIPPED.has(active);
  const inWork = cases.some((c) => c.id === active);
  const inElsewhere = elsewhereIds.includes(active);
  const on = (id) => active === id;
  const order = chapters.map((c) => c.id);
  const here = order.indexOf(active);
  // the chapter being shown, and which side of it each of the others waits on: before it (above) or after it (below)
  const state = (id) => (id === active ? " on" : order.indexOf(id) < here ? " past" : " next");

  return (
    <>
      <Field shape={shape} flip={flip} focus={hover} onFocus={setFocus} />

      <header className="nav">
        <a className="brand" href="#intro">{person.name}</a>
        <nav aria-label="Primary">
          <ul>
            <li><a href="#cohort" className={inWork ? "on" : ""}>Work</a></li>
            <li><a href="#skills" className={inElsewhere ? "on" : ""}>Elsewhere</a></li>
            <li><a href="#contact" className={on("contact") ? "on" : ""}>Contact</a></li>
            <li><a href={person.resume} download>Resume</a></li>
          </ul>
        </nav>
      </header>

      <nav className="rail" aria-label="Chapters">
        {chapters.map((c) => (
          <a key={c.id} href={`#${c.id}`} className={on(c.id) ? "on" : ""} aria-label={c.label} aria-current={on(c.id) ? "true" : undefined}>
            <span>{c.label}</span>
            <i />
          </a>
        ))}
      </nav>

      <main>
        <section id="intro" className={`ch intro${side("intro")}${state("intro")}`} aria-label="Introduction">
          <div className="ch-in" onFocus={() => !on("intro") && reveal("intro")}>
            <p className="eyebrow rv">
              {hero.eyebrow.flatMap((w, i) => (i ? [<i key={`x${i}`} aria-hidden="true">×</i>, <b key={w}>{w}</b>] : [<b key={w}>{w}</b>]))}
            </p>
            <h1 className="name" aria-label={person.name}>
              {person.name.split(" ").map((word) => (
                <span key={word} className="rv" aria-hidden="true">
                  {[...word].map((c, i) => (
                    <span className="lt" key={i}>{c}</span>
                  ))}
                </span>
              ))}
            </h1>
            <p className="lead rv">{hero.lead}</p>
            <ul className="proof" aria-label="Results at a glance">
              {hero.proof.map(([value, label]) => {
                const [from, to] = value.split(" → ");
                return (
                  <li key={label} className="rv">
                    <b>{to ? <>{from} <i aria-hidden="true">→</i> <em>{to}</em></> : value}</b>
                    <span>{label}</span>
                  </li>
                );
              })}
            </ul>
            <p className="sub rv">{person.role} at {person.company}. {person.intro}</p>
            <ul className="links rv">
              <li><a href={`mailto:${person.email}`}>{person.email}</a></li>
              <li><a href={person.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></li>
              <li><a href={person.resume} download>Resume (PDF)</a></li>
            </ul>
          </div>
        </section>

        {cases.map((c, n) => (
          <Case key={c.id} c={c} n={n} st={state(c.id)} />
        ))}

        <section id="skills" className={`ch els${side("skills")}${state("skills")}`} aria-labelledby="skills-t">
          <div className="ch-in" onFocus={() => !on("skills") && reveal("skills")}>
            <p className="k rv">Elsewhere · skills</p>
            <h2 id="skills-t" className="sec-t rv">Skills, and where they showed up</h2>
            <ul className="sk" onPointerLeave={() => setHover(null)}>
              {skills.map(([name, tools], i) => (
                <li
                  key={name}
                  className={`rv${focus === i ? " on" : ""}`}
                  tabIndex={0}
                  onPointerEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                >
                  <b>{name}</b>
                  <span>{tools}</span>
                </li>
              ))}
            </ul>
            <p className="also rv">{alsoTools}</p>
            <p className="exp rv">
              <span className="k">Experience</span>
              <br />
              <b>{experience.title}</b>, {experience.where}. {experience.dates}.
            </p>
          </div>
        </section>

        <section id="smartshelf" className={`ch els${side("smartshelf")}${state("smartshelf")}`} aria-labelledby="smartshelf-t">
          <div className="ch-in" onFocus={() => !on("smartshelf") && reveal("smartshelf")}>
            <p className="k rv">Elsewhere · project</p>
            <h2 id="smartshelf-t" className="sec-t rv">{project.name}</h2>
            <p className="body rv">{project.text}</p>
            <p className="also rv">{project.stack}</p>
            <p className="hint rv">Move your cursor over the dots: it is the emotional cue, and the five closest titles light up.</p>
          </div>
        </section>

        <section id="mentoring" className={`ch els${side("mentoring")}${state("mentoring")}`} aria-labelledby="mentoring-t">
          <div className="ch-in" onFocus={() => !on("mentoring") && reveal("mentoring")}>
            <p className="k rv">Elsewhere · leadership</p>
            <h2 id="mentoring-t" className="sec-t rv">{leadership[0].name}</h2>
            <p className="body rv">{leadership[0].text}</p>
            <p className="also rv">
              Also: {leadership[1].name} ·{" "}
              <a href={leadership[2].href} target="_blank" rel="noreferrer">{leadership[2].name} ↗</a>
            </p>
          </div>
        </section>

        <section id="contact" className={`ch contact${side("contact")}${state("contact")}`} aria-labelledby="contact-t">
          <div className="ch-in" onFocus={() => !on("contact") && reveal("contact")}>
            <h2 id="contact-t" className="sec-t rv">Contact</h2>
            <p className="rv"><a className="mail" href={`mailto:${person.email}`}>{person.email}</a></p>
            <ul className="links rv">
              <li><a href={person.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></li>
              <li><a href={person.resume} download>Resume (PDF)</a></li>
            </ul>
            <p className="foot rv">© {new Date().getFullYear()} {person.name} · <a href="#intro">Back to top ↑</a></p>
          </div>
        </section>
      </main>
    </>
  );
}
