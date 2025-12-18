import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg, #111827 0%, #1f2937 40%, #111827 100%)",
          fontFamily:
            "Inter, Segoe UI, Roboto, Helvetica, Arial, system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: "#ef4444",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: 28,
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
                fontSize: 60,
                fontWeight: 800,
                letterSpacing: -0.8,
                color: "#f9fafb",
              }}
            >
              YOU-I Toolkit
            </span>
            <span
              style={{
                fontSize: 22,
                color: "#e5e7eb",
                marginTop: 10,
              }}
            >
              Web-based collection of UI development tools
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          {["Color contrast checker", "Ratio calculator", "Palette comparisons"].map(
            (label) => (
              <div
                key={label}
                style={{
                  borderRadius: 14,
                  backgroundColor: "rgba(15,23,42,0.85)",
                  border: "1px solid rgba(248,113,113,0.4)",
                  boxShadow:
                    "0 8px 20px rgba(0,0,0,0.45), 0 0 0 1px rgba(15,23,42,0.9)",
                  padding: "10px 16px",
                  fontSize: 18,
                  color: "#f9fafb",
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

