import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://you-i-tool.vercel.app"),
  title: "YOU-I Toolkit",
  description:
    "A web-based collection of UI development tools",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "YOU-I",
    description:
      "A web-based collection of UI development tools",
    url: "https://you-i-tool.vercel.app/",
    siteName: "YOU-I",
    type: "website",
    images: [
      {
        url: "/og-banner.svg",
        width: 1200,
        height: 630,
        alt: "YOU-I Toolkit – color contrast and ratio tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YOU-I – Color Contrast & Accessibility Toolkit",
    description:
      "YOU-I is a simple toolkit for checking color contrast ratios, exploring palettes, and designing accessible interfaces.",
    images: ["https://you-i-tool.vercel.app/og-banner.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
