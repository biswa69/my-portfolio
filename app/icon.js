import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6, background: "#0b0b11", borderRadius: 14, padding: 12 }}>
        <div style={{ display: "flex", width: 10, height: 20, background: "#f3f1ec", borderRadius: 3 }} />
        <div style={{ display: "flex", width: 10, height: 38, background: "#ff8a5c", borderRadius: 3 }} />
        <div style={{ display: "flex", width: 10, height: 28, background: "#f3f1ec", borderRadius: 3 }} />
      </div>
    ),
    size
  );
}
