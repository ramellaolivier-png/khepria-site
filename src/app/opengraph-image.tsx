import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#1F3D34", color: "#F5F1EA", fontSize: 64, fontWeight: 700 }}>
        <div style={{ color: "#C9A24B", fontSize: 28, letterSpacing: 4 }}>KHEPRIA · LIMOGES</div>
        <div style={{ marginTop: 24 }}>Des outils IA qui tournent en prod.</div>
      </div>
    ),
    size
  );
}
