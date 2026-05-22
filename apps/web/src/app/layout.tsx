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
  title: "Jin — Agent Intent Protocol Registry",
  description:
    "The open registry for AI agent intents. Discover, publish, and connect machine-readable intent maps for the agentic web.",
  icons: {
    icon: [
      { url: "/assets/logos/logo_favicon_32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/logos/logo_favicon_64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: "/assets/logos/logo_favicon_64.png",
  },
  openGraph: {
    title: "Jin — Agent Intent Protocol Registry",
    description:
      "The open registry for AI agent intents. Make your app agent-ready with a single JSON file.",
    url: "https://meetjin.com",
    siteName: "meetjin.com",
    images: [
      {
        url: "/assets/logos/logo_og.png",
        width: 1200,
        height: 630,
        alt: "Jin — Agent Intent Protocol",
      },
    ],
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
