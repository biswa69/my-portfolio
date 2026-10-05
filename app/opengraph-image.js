import { ImageResponse } from "next/og";

export const alt = "Biswajit Saha — Data × Product × Business";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0b0b11", color: "#f3f1ec", padding: 72 }}>
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: "#ff8a5c" }}>DATA × PRODUCT × BUSINESS</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 120, fontWeight: 700, lineHeight: 1 }}>Biswajit Saha</div>
          <div style={{ display: "flex", fontSize: 38, color: "#9c9aab", marginTop: 24, maxWidth: 900 }}>
            Business Analyst (Product &amp; Analytics). Turning complex business problems into decisions.
          </div>
        </div>
        <div style={{ display: "flex", gap: 40, fontSize: 30 }}>
          <span style={{ display: "flex" }}>~2 days → ~5 min</span>
          <span style={{ display: "flex" }}>90,000+ policies migrated</span>
          <span style={{ display: "flex" }}>3,000+ daily leads</span>
        </div>
      </div>
    ),
    size
  );
}
