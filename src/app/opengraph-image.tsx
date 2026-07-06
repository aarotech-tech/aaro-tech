import { ImageResponse } from "next/og";
import { headers } from "next/headers";

export const runtime = "edge";

// Image metadata
export const alt = "Aarotech Digital Marketing Agency";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to right bottom, #0f172a, #1e293b)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "40px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${baseUrl}/images/aarotech-logos/footer-logo-primary.png`}
            height={90}
            alt="Aarotech"
            style={{ objectFit: "contain" }}
          />
        </div>

        <h2
          style={{
            fontSize: "48px",
            fontWeight: "700",
            color: "#ffce1b",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.2,
            marginBottom: "20px",
          }}
        >
          Get More Leads, Customers, and Revenue for Your Business
        </h2>

        <p
          style={{
            fontSize: "32px",
            color: "#cbd5e1",
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          Social Media Marketing • Content Creation • Google and Meta Ads • Website Developement • SEO
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
