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
  title: {
    default: "HASA — Harvard African Students Association",
    template: "%s · HASA",
  },
  description:
    "The Harvard African Students Association — connecting Harvard's African community since 1977.",
  icons: {
    icon: [{ url: "/hasa-mark.svg", type: "image/svg+xml" }],
    apple: [{ url: "/hasa-mark.svg" }],
  },
  openGraph: {
    title: "HASA — Harvard African Students Association",
    description:
      "Harvard's African community, since 1977. Marketing site + members-only alumni directory.",
    siteName: "HASA",
    images: [{ url: "/hasa-logo.svg" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HASA — Harvard African Students Association",
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
