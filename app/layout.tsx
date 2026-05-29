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

// Root metadata applies to anything that doesn't set its own. Route-group
// layouts (app/(app)/layout.tsx, app/(auth)/layout.tsx, app/(marketing)/layout.tsx)
// override `title` with section-specific values, and individual pages can
// override further.
export const metadata: Metadata = {
  // Makes all relative metadata URLs (incl. the generated OG/Twitter images)
  // resolve to absolute https URLs — social crawlers require absolute URLs.
  metadataBase: new URL("https://www.harvardafricans.com"),
  // Root default only. Route-group layouts (marketing, auth, app) override
  // both `default` and `template`, so this string is just the safety net
  // for any page that somehow escapes a group layout.
  title: "HASA — Harvard African Students Association",
  description:
    "The Harvard African Students Association — connecting Harvard's African community since 1977.",
  icons: {
    icon: [{ url: "/hasa-mark.svg", type: "image/svg+xml" }],
    apple: [{ url: "/hasa-mark.svg" }],
  },
  openGraph: {
    // The preview image itself comes from app/opengraph-image.tsx (a real PNG).
    title: "HASA — Harvard African Students Association",
    description:
      "Harvard's African community, since 1977. Marketing site + members-only alumni directory.",
    siteName: "HASA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HASA — Harvard African Students Association",
    description:
      "Harvard's African community, since 1977. Marketing site + members-only alumni directory.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
