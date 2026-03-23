import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

function FaviconMarkup({ background = "#3F4F24", foreground = "#FFF9F0" }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F6F1E8",
        position: "relative",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: 404,
          height: 404,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background,
          borderRadius: 112,
          boxShadow: "inset 0 0 0 10px rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            color: foreground,
            fontWeight: 900,
            letterSpacing: "-0.075em",
            transform: "translateY(-6px)",
          }}
        >
          <span style={{ fontSize: 222, lineHeight: 1 }}>G</span>
          <span style={{ fontSize: 192, lineHeight: 1 }}>F</span>
        </div>
      </div>
    </div>
  );
}

export default function AppleIcon() {
  return new ImageResponse(<FaviconMarkup />, size);
}
