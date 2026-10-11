"use client";
import { useEffect, useRef, useState } from "react";
import Field from "./Field";
import {
  person, cases, chapters, elsewhereIds, noteRows, skills, alsoTools, experience, project, leadership,
} from "../lib/content";

const pad = (n) => String(n).padStart(2, "0");
const tick = (f) => (document.hidden ? setTimeout(f, 16) : requestAnimationFrame(f));

// A big number that counts up once, the first time its case is on screen. Server and first paint show the final value.
function CountUp({ text, run }) {
  const [shown, setShown] = useState(text);
  const played = useRef(false);

  useEffect(() => {
    if (!run || played.current) return;
    played.current = true;
    const m = text.match(/^(\D*?)(\d[\d,]*)(.*)$/);
    if (!m || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const [, pre, num, post] = m;
    const to = parseInt(num.replace(/,/g, ""), 10);
    const commas = num.includes(",");
    const t0 = performance.now();
    let alive = true;
    const step = () => {
      if (!alive) return;
      const t = Math.min(1, (performance.now() - t0) / 700);
      const v = Math.round(to * (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)));
      setShown(pre + (commas ? v.toLocaleString("en-US") : String(v)) + post);
      if (t < 1) tick(step);
    };
    tick(step);
    return () => {
      alive = false;
    };
  }, [run, text]);

  return <>{shown}</>;
}

function Case({ c, n, on }) {
  const [from, to] = c.hero;
  // a long "before" ("Separate Excel trackers") sits on its own line above the big figure; a short one stays inline
  const stacked = Boolean(from) && from.length > 8;
  // font size is limited by how many characters the line holds, so long figures like "Rs. 100 Cr" still fit the column
  const len = to.length + (from && !stacked ? from.length * 0.34 + 1 : 0);
  return (
    <section id={c.id} className={`ch case${on ? " on" : ""}`} aria-labelledby={`${c.id}-t`}>
      <div className="ch-in">
        <p className="k">
          {pad(n + 1)} / {pad(cases.length)} · {c.tag}
          {c.status ? ` · ${c.status}` : ""}
        </p>
        <h2 id={`${c.id}-t`} className="case-t">{c.title}</h2>
        <p className={`big${stacked ? " stack" : ""}`} style={{ "--len": len }}>
          {from && (
            <>
              <s>{from}</s>
              <i aria-hidden="true">→</i>
            </>
          )}
          <CountUp text={to} run={on} />
        </p>
        <p className="big-l">{c.label}</p>
        <dl className="notes">
          {noteRows.filter(([key]) => c[key]).map(([key, label]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>{c[key]}</dd>
            </div>
          ))}
        </dl>
        {c.measure && (
          <div className="measure">
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

  // The active chapter is the last one whose top has passed the middle of the screen.
  useEffect(() => {
    const ids = chapters.map((c) => c.id);
    let last = "intro";
    let timer = 0;
    const pick = () => {
      const mid = window.innerHeight * 0.5;
      let best = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= mid) best = id;
      }
      if (best === last) return;
      last = best;
      clearTimeout(timer);
      timer = window.setTimeout(() => setActive(best), 60);
    };
    pick();
    addEventListener("scroll", pick, { passive: true });
    addEventListener("resize", pick);
    return () => {
      clearTimeout(timer);
      removeEventListener("scroll", pick);
      removeEventListener("resize", pick);
    };
  }, []);

  const shape = chapters.find((c) => c.id === active)?.shape ?? "raw";
  const inWork = cases.some((c) => c.id === active);
  const inElsewhere = elsewhereIds.includes(active);
  const on = (id) => active === id;

  return (
    <>
      <Field shape={shape} focus={hover} onFocus={setFocus} />

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
        <section id="intro" className={`ch intro${on("intro") ? " on" : ""}`} aria-label="Introduction">
          <div className="ch-in">
            <h1 className="name">
              <span>Biswajit</span>
              <span>Saha</span>
            </h1>
            <p className="role">{person.role}, {person.company}</p>
            <p className="lede">{person.intro}</p>
            <ul className="links">
              <li><a href={`mailto:${person.email}`}>{person.email}</a></li>
              <li><a href={person.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></li>
              <li><a href={person.resume} download>Resume (PDF)</a></li>
            </ul>
          </div>
        </section>

        {cases.map((c, n) => (
          <Case key={c.id} c={c} n={n} on={on(c.id)} />
        ))}

        <section id="skills" className={`ch els${on("skills") ? " on" : ""}`} aria-labelledby="skills-t">
          <div className="ch-in">
            <p className="k">Elsewhere · skills</p>
            <h2 id="skills-t" className="sec-t">Skills, and where they showed up</h2>
            <ul className="sk" onPointerLeave={() => setHover(null)}>
              {skills.map(([name, tools], i) => (
                <li
                  key={name}
                  className={focus === i ? "on" : ""}
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
            <p className="also">{alsoTools}</p>
            <p className="exp">
              <span className="k">Experience</span>
              <br />
              <b>{experience.title}</b>, {experience.where}. {experience.dates}.
            </p>
          </div>
        </section>

        <section id="smartshelf" className={`ch els${on("smartshelf") ? " on" : ""}`} aria-labelledby="smartshelf-t">
          <div className="ch-in">
            <p className="k">Elsewhere · project</p>
            <h2 id="smartshelf-t" className="sec-t">{project.name}</h2>
            <p className="body">{project.text}</p>
            <p className="also">{project.stack}</p>
            <p className="hint">Move your cursor over the dots: it is the emotional cue, and the five closest titles light up.</p>
          </div>
        </section>

        <section id="mentoring" className={`ch els${on("mentoring") ? " on" : ""}`} aria-labelledby="mentoring-t">
          <div className="ch-in">
            <p className="k">Elsewhere · leadership</p>
            <h2 id="mentoring-t" className="sec-t">{leadership[0].name}</h2>
            <p className="body">{leadership[0].text}</p>
            <p className="also">
              Also: {leadership[1].name} ·{" "}
              <a href={leadership[2].href} target="_blank" rel="noreferrer">{leadership[2].name} ↗</a>
            </p>
          </div>
        </section>

        <section id="contact" className={`ch contact${on("contact") ? " on" : ""}`} aria-labelledby="contact-t">
          <div className="ch-in">
            <h2 id="contact-t" className="sec-t">Contact</h2>
            <p><a className="mail" href={`mailto:${person.email}`}>{person.email}</a></p>
            <ul className="links">
              <li><a href={person.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></li>
              <li><a href={person.resume} download>Resume (PDF)</a></li>
            </ul>
            <p className="foot">© {new Date().getFullYear()} {person.name} · <a href="#intro">Back to top ↑</a></p>
          </div>
        </section>
      </main>
    </>
  );
}
