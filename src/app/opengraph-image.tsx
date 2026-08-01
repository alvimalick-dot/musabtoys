import { ImageResponse } from "next/og";

export const alt = "Karachi Toys — Pakistan's #1 online toy store";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          background: "linear-gradient(135deg, #ff6b6b 0%, #f43f5e 55%, #e11d48 100%)",
          position: "relative",
        }}
      >
        {/* Decorative building blocks */}
        <div
          style={{
            position: "absolute",
            top: 70,
            left: 90,
            width: 110,
            height: 110,
            borderRadius: 24,
            background: "rgba(255,255,255,0.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 54 }}>🧸</div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 90,
            right: 110,
            width: 110,
            height: 110,
            borderRadius: 24,
            background: "rgba(255,255,255,0.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 54 }}>🚗</div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 150,
            width: 90,
            height: 90,
            borderRadius: 20,
            background: "rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 46 }}>🧩</div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 90,
            right: 150,
            width: 90,
            height: 90,
            borderRadius: 20,
            background: "rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 46 }}>🚀</div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            borderRadius: 28,
            width: 108,
            height: 108,
            marginBottom: 26,
            boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
          }}
        >
          <span style={{ fontSize: 62 }}>🧸</span>
        </div>

        <div
          style={{
            fontSize: 72,
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
            fontSize: 30,
            fontWeight: 600,
            color: "#ffe4e6",
            marginTop: 14,
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          4,500+ toys · Cash on Delivery across Pakistan · from PKR 100
        </div>

        <div
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: "#ffd6da",
            marginTop: 10,
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          Based in Multan · Serving all of Pakistan
        </div>
      </div>
    ),
    { ...size }
  );
}

