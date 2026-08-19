import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// Runs before first paint so a dark-mode user never sees a white flash. Kept as
// a raw inline script rather than next/script: every strategy that component
// offers (beforeInteractive included) runs too late to beat the first paint,
// and this has to win that race. Key mirrors THEME_STORAGE_KEY in ThemeToggle.
const THEME_INIT = `(function(){try{var t=localStorage.getItem("hasa-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
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
  title: "HASA · Harvard African Students Association",
  description:
    "The Harvard African Students Association, connecting Harvard's African community since 1977.",
  // No explicit `icons` block: an explicit one overrides the file conventions,
  // and app/icon.svg (the official shield, squared for the tab) + app/favicon.ico
  // are picked up automatically.
  openGraph: {
    // The preview image itself comes from app/opengraph-image.tsx (a real PNG).
    title: "HASA · Harvard African Students Association",
    description:
      "Harvard's African community, since 1977. Marketing site + members-only alumni directory.",
    siteName: "HASA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HASA · Harvard African Students Association",
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
      // The theme script mutates <html> before React hydrates, so the class
      // list legitimately differs from the server-rendered one.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {children}
      </body>
    </html>
  );
}
