import { ImageResponse } from "next/og";

export const alt = "Karachi Toys — Pakistan's #1 online toy store";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1530 0%, #312e81 55%, #4338ca 100%)",
          position: "relative",
        }}
      >
        {/* Toy emoji accents */}
        <div
          style={{
            position: "absolute",
            top: 64,
            left: 100,
            width: 96,
            height: 96,
            borderRadius: 22,
            background: "rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 48 }}>🎲</div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 84,
            right: 110,
            width: 96,
            height: 96,
            borderRadius: 22,
            background: "rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 48 }}>🪁</div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 76,
            left: 140,
            width: 84,
            height: 84,
            borderRadius: 20,
            background: "rgba(255,255,255,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 44 }}>🤖</div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 80,
            right: 140,
            width: 84,
            height: 84,
            borderRadius: 20,
            background: "rgba(255,255,255,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 44 }}>🏎️</div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            borderRadius: 26,
            width: 100,
            height: 100,
            marginBottom: 24,
            boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          }}
        >
          <span style={{ fontSize: 56 }}>🧸</span>
        </div>

        <div
          style={{
            fontSize: 70,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-1px",
            fontFamily: "Arial, Helvetica, sans-serif",
            display: "flex",
          }}
        >
          KARACHI&nbsp;TOYS
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "#c7d2fe",
            marginTop: 14,
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          Toys for every age · COD nationwide · PKR 100 to 150,000+
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: "#a5b4fc",
            marginTop: 10,
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          Multan · Pakistan
        </div>
      </div>
    ),
    { ...size }
  );
}

