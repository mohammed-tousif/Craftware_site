import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded share card for links to the homepage (WhatsApp, LinkedIn, Slack, X…). */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 84px",
          background: "#ffffff",
          backgroundImage:
            "radial-gradient(900px 500px at 80% 6%, rgba(200,16,46,0.08), rgba(200,16,46,0) 60%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6.5A9 9 0 1 0 20 17.5"
              stroke="#c8102e"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </svg>
          <span
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: "#1a1113",
              letterSpacing: -0.5,
            }}
          >
            CraftWare
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <span
            style={{
              fontSize: 20,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#a2969a",
            }}
          >
            Digital Growth Studio
          </span>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#1a1113",
              maxWidth: 980,
            }}
          >
            <span>We&nbsp;craft&nbsp;digital&nbsp;experiences&nbsp;that&nbsp;</span>
            <span style={{ color: "#c8102e" }}>grow.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(26,17,19,0.12)",
            paddingTop: 28,
            fontSize: 18,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#6b5c5f",
          }}
        >
          <span>Design × Technology × Marketing</span>
          <span>craftware.studio</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
