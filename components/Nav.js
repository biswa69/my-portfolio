"use client";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const links = [
  ["story", "Story"],
  ["work", "Case studies"],
  ["product", "Product thinking"],
  ["skills", "Skills"],
  ["experience", "Experience"],
];

export default function Nav() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    document.querySelectorAll("main section[id]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <header className="nav">
      <a href="#top" className="brand">
        <span className="logo" aria-hidden="true"><i /><i /><i /></span>
        Biswajit Saha
      </a>
      <nav aria-label="Primary">
        {links.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={active === id ? "on" : ""}>{label}</a>
        ))}
      </nav>
      <div className="nav-end">
        <a className="nav-resume" href="/Biswajit-Saha-Resume.pdf" download>Resume</a>
        <ThemeToggle />
        <a href="#contact" className="btn btn-secondary"><span>Contact</span></a>
      </div>
    </header>
  );
}
