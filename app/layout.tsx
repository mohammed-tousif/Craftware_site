import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { site } from "@/config/site";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "CraftWare — Digital Experiences That Grow",
    template: "%s — CraftWare",
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "digital agency",
    "web design",
    "web development",
    "social media management",
    "Meta Ads",
    "Google Ads",
    "SEO",
    "branding",
    "digital marketing",
    "Mumbai",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: "CraftWare — Digital Experiences That Grow",
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "CraftWare — Digital Experiences That Grow",
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-paper text-ink antialiased">
        <SmoothScroll>
          <Nav />
          <main>{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
