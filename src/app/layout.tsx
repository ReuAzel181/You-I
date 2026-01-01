import type { Metadata } from "next";
import Script from "next/script";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/providers/AuthProvider";
import { SettingsProvider } from "@/providers/SettingsProvider";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieAppearance = cookieStore.get("you_i_appearance")?.value;
  const cookieAccent = cookieStore.get("you_i_accent")?.value;

  const initialAppearance =
    cookieAppearance === "light" ||
    cookieAppearance === "light-high-contrast" ||
    cookieAppearance === "dark" ||
    cookieAppearance === "system"
      ? cookieAppearance
      : "system";

  const initialAccent =
    cookieAccent === "red" ||
    cookieAccent === "emerald" ||
    cookieAccent === "violet" ||
    cookieAccent === "amber" ||
    cookieAccent === "sky"
      ? cookieAccent
      : "red";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-accent={initialAccent}
      data-theme={initialAppearance === "system" ? undefined : initialAppearance}
    >
      <head>
        <Script id="you-i-theme-init" strategy="beforeInteractive">
          {`(function () {
  try {
    var stored = window.localStorage.getItem('you-i-settings');
    var parsed = stored ? JSON.parse(stored) : null;
    var appearance = parsed && typeof parsed.appearance === 'string' ? parsed.appearance : 'system';
    var root = document.documentElement;

    if (appearance === 'light' || appearance === 'light-high-contrast' || appearance === 'dark') {
      root.setAttribute('data-theme', appearance);
    } else {
      root.removeAttribute('data-theme');
    }
  } catch (error) {
  }
})();`}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased page-transition-root`}
      >
        <AuthProvider>
          <SettingsProvider>{children}</SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
