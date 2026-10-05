"use client";
import { useState } from "react";

// Prototype-only: explains the placeholder styling. Not part of the real site.
export default function ProtoBanner() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <aside className="proto" role="note">
      <b>PROTOTYPE</b>
      <span>Preview only. Nothing here is published.</span>
      <button onClick={() => setOpen(false)} aria-label="Dismiss prototype note">×</button>
    </aside>
  );
}
