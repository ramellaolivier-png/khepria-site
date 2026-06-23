import type { Metadata, Viewport } from "next";
import { Sora, Manrope } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { SITE } from "@/lib/site";

// Display / headings — Sora (mapped to --font-serif in @theme; the utility
// name `font-serif` is now a misnomer but keeps existing headings working).
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
// Body — Manrope (mapped to --font-sans).
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.domain),
  title: { default: `${SITE.name} — Agence IA à ${SITE.city}`, template: `%s · ${SITE.name}` },
  description: "Agence IA pour les PME de Nouvelle-Aquitaine. On livre du code, des automatisations et des produits qui tournent en prod.",
  openGraph: { type: "website", locale: "fr_FR", siteName: SITE.name, url: SITE.domain },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#FCFCFD" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${sora.variable} ${manrope.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            name: SITE.name,
            url: SITE.domain,
            email: SITE.email,
            areaServed: SITE.region,
            address: { "@type": "PostalAddress", addressLocality: SITE.city, addressCountry: "FR" },
            founder: [{ "@type": "Person", name: "Olivier" }, { "@type": "Person", name: "Charles de Clerfayt" }],
          }) }}
        />
        <SmoothScroll>
          <SiteHeader />
          <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-12">{children}</main>
          <SiteFooter />
        </SmoothScroll>
      </body>
    </html>
  );
}
