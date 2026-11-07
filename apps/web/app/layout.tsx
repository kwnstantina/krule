import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Newsreader } from "next/font/google";
import "./globals.css";
import React from "react";
import SiteHeader from "./components/site/SiteHeader";
import SiteFooter from "./components/site/SiteFooter";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef1f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0d141c" },
  ],
};

const description =
  "Recover the business rules buried in legacy code, verify each one against its source, and hand auditors a report that cites the line.";

export const metadata: Metadata = {
  // Absolute base for social preview URLs. Set NEXT_PUBLIC_SITE_URL once the site has a public address.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "krule — Business logic observability",
  description,
  openGraph: {
    type: "website",
    siteName: "krule",
    title: "krule — Business logic observability",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "krule — Business logic observability",
    description,
  },
};

// Runs before first paint so a stored theme choice never flashes the wrong palette.
const themeScript = `(function(){try{var t=localStorage.getItem("krule-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
