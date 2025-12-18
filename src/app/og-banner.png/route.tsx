import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: 1200,
          height: 630,
          alignItems: "center",
          justifyContent: "center",
          padding: 64,
          boxSizing: "border-box",
          background:
            "radial-gradient(circle at top, #1f2937 0%, #020617 55%, #000000 100%)",
          fontFamily:
            "Inter, Segoe UI, Roboto, Helvetica, Arial, system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            padding: "32px 40px",
            borderRadius: 28,
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(15,23,42,0.92))",
            border: "1px solid rgba(148,163,184,0.45)",
            boxShadow:
              "0 28px 80px rgba(15,23,42,0.85), 0 0 0 1px rgba(15,23,42,0.7) inset",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 96,
                height: 96,
                borderRadius: 24,
                backgroundColor: "#ef4444",
                color: "#fff",
                fontWeight: 700,
                fontSize: 40,
                letterSpacing: -0.5,
                boxShadow:
                  "0 18px 40px rgba(248,113,113,0.55), 0 0 0 1px rgba(248,250,252,0.12) inset",
              }}
            >
              UI
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: 1.1,
              }}
            >
              <span
                style={{
                  fontSize: 56,
                  fontWeight: 800,
                  letterSpacing: -0.6,
                  color: "#f9fafb",
                }}
              >
                YOU-I Toolkit
              </span>
              <span
                style={{
                  fontSize: 22,
                  color: "#9ca3af",
                  marginTop: 10,
                }}
              >
                Accessibility tools integrated into UI design workflows.
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 8,
            }}
          >
            {["Contrast Checker", "Ratio Calculator", "And More"].map(
              (label) => (
                <div
                  key={label}
                  style={{
                    borderRadius: 999,
                    background:
                      "linear-gradient(135deg, rgba(15,23,42,1), rgba(30,64,175,1))",
                    border: "1px solid rgba(148,163,184,0.7)",
                    padding: "10px 18px",
                    fontSize: 18,
                    color: "#e5e7eb",
                    fontWeight: 600,
                    letterSpacing: -0.1,
                    boxShadow: "0 10px 30px rgba(15,23,42,0.85)",
                  }}
                >
                  {label}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

