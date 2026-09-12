import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { site } from "@/config/site";
import { services } from "@/content/services";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

/**
 * Organization structured data for search engines / AI agents.
 * `sameAs` is intentionally omitted — site.socials are still placeholder
 * URLs (bare platform homepages). Add it back once real profile links exist.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  url: site.url,
  description: site.description,
  email: site.contact.email,
  telephone: site.contact.phone,
  areaServed: "IN",
  address: {
    "@type": "PostalAddress",
    addressRegion: "Karnataka",
    addressCountry: "IN",
  },
  makesOffer: services.map((s) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name: s.name, description: s.line },
  })),
};

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
    "Karnataka",
    "India",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  alternates: { canonical: "/" },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScroll>
          <Nav />
          <main>{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
