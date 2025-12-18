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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://you-i-azel.vercel.app"),
  title: "YOU-I Toolkit",
  description:
    "A web-based platform designed for modern interface creation. Providing a comprehensive collection of tools for UI development and design workflows.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "YOU-I",
    description:
      "A web-based platform designed for modern interface creation. Providing a comprehensive collection of tools for UI development and design workflows.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://you-i-azel.vercel.app/",
    siteName: "YOU-I",
    type: "website",
    images: [
      {
        url: "/og-banner.png",
        width: 1200,
        height: 630,
        alt: "YOU-I Toolkit – color contrast and ratio tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YOU-I Toolkit",
    description:
      "A web-based platform designed for modern interface creation. Providing a comprehensive collection of tools for UI development and design workflows.",
    images: ["/og-banner.png"],
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
