import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

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
          background: "#FFFDF8",
          borderRadius: 128,
          position: "relative",
          overflow: "hidden",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 24,
            borderRadius: 104,
            border: "8px solid rgba(46,35,22,0.12)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 18,
            color: "#221D18",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: 220, color: "#4D5F2D", lineHeight: 1 }}>G</span>
          <span style={{ fontSize: 200, lineHeight: 1 }}>F</span>
        </div>
        <div
          style={{
            position: "absolute",
            top: 72,
            right: 82,
            width: 62,
            height: 42,
            background: "#8FB26A",
            borderRadius: "100% 0 100% 0",
            transform: "rotate(-28deg)",
            zIndex: 1,
          }}
        />
      </div>
    ),
    size,
  );
}
