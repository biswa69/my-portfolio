import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// A small field of dots with one highlighted.
const DOTS = [
  [14, 14], [32, 14], [50, 14],
  [14, 32], [32, 32], [50, 32],
  [14, 50], [32, 50], [50, 50],
];

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0d0c0b", borderRadius: 14 }}>
        {DOTS.map(([x, y], i) => (
          <div
            key={i}
            style={{ position: "absolute", left: x - 4, top: y - 4, width: 8, height: 8, borderRadius: 4, background: i === 5 ? "#ffcf1f" : "#8b877e" }}
          />
        ))}
      </div>
    ),
    size
  );
}
