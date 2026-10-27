import { ImageResponse } from "next/og";

export const alt = "PaceBeat, ta prochaine sortie en rythme";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BARS = Array.from({ length: 24 }, (_, index) => 18 + (82 * index) / 23);

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 72,
        background: "#0a110c",
        color: "#e8f5e6",
        fontFamily: "monospace",
      }}
    >
      <div style={{ display: "flex", fontSize: 44 }}>PaceBeat</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 260 }}>
        {BARS.map((height) => (
          <div
            key={height}
            style={{ display: "flex", flex: 1, height: `${height}%`, background: "#7df57b" }}
          />
        ))}
      </div>
      <div style={{ display: "flex", fontSize: 56 }}>Ta prochaine sortie, en rythme.</div>
    </div>,
    size,
  );
}
