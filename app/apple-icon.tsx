import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS/Android home-screen icon — the same mark as Logo.tsx and app/icon.svg. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <svg width="108" height="108" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6.5A9 9 0 1 0 20 17.5"
            stroke="#c8102e"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    size
  );
}
