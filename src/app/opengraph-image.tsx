import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg, #ffffff 0%, #fafafa 50%, #f5f5f5 100%)",
          fontFamily:
            "Inter, Segoe UI, Roboto, Helvetica, Arial, system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 10,
              backgroundColor: "#ef4444",
              color: "#fff",
              fontWeight: 700,
              fontSize: 22,
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
                letterSpacing: -0.5,
                color: "#111827",
              }}
            >
              YOU-I Toolkit
            </span>
            <span
              style={{
                fontSize: 22,
                color: "#4b5563",
                marginTop: 8,
              }}
            >
              Color contrast & accessibility tools for UI design
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          {["Contrast checker", "Ratio calculator", "Palette comparisons"].map(
            (label) => (
              <div
                key={label}
                style={{
                  borderRadius: 12,
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  boxShadow:
                    "0 1px 2px rgba(0,0,0,0.05), 0 10px 20px rgba(0,0,0,0.06)",
                  padding: "10px 14px",
                  fontSize: 18,
                  color: "#374151",
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
      width: size.width,
      height: size.height,
    }
  );
}

