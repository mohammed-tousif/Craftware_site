import { ImageResponse } from "next/og";
import { projectBySlug } from "@/content/projects";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded share card per case study — project name, industry, headline result. */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  const name = project?.name ?? "Case Study";
  const industry = project?.industry ?? "CraftWare";
  const line = project?.result ?? project?.summary ?? "";

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
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6.5A9 9 0 1 0 20 17.5"
              stroke="#c8102e"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </svg>
          <span style={{ fontSize: 24, fontWeight: 700, color: "#1a1113" }}>
            CraftWare
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span
            style={{
              fontSize: 18,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "#c8102e",
            }}
          >
            Case Study — {industry}
          </span>
          <span
            style={{
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: -1.5,
              color: "#1a1113",
              maxWidth: 980,
            }}
          >
            {name}
          </span>
          {line ? (
            <span style={{ fontSize: 24, color: "#6b5c5f", maxWidth: 860 }}>
              {line}
            </span>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(26,17,19,0.12)",
            paddingTop: 26,
            fontSize: 16,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#6b5c5f",
          }}
        >
          <span>Work We&apos;ve Crafted</span>
          <span>craftware.studio</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
