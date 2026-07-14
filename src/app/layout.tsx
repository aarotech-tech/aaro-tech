import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MobileCTA } from "@/components/layout/MobileCTA";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { ClickTracker } from "@/components/shared/ClickTracker";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { CursorGlow } from "@/components/ui/cursor-glow";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#020617",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://aarotech.in"),
  alternates: {
    canonical: "/",
  },
  title: "Aarotech | Digital Marketing Agency",
  description: "We help businesses generate more leads, improve online visibility, and grow revenue through websites, SEO, advertising, and social media.",
  openGraph: {
    title: "Aarotech | Digital Marketing Agency",
    description: "We help businesses generate more leads, improve online visibility, and grow revenue through websites, SEO, advertising, and social media.",
    siteName: "Aarotech",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aarotech | Digital Marketing Agency",
    description: "We help businesses generate more leads, improve online visibility, and grow revenue through websites, SEO, advertising, and social media.",
  },
};

import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Aarotech",
    "url": "https://aarotech.in",
    "logo": "https://aarotech.in/images/aarotech-logos/footer-logo-primary.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
      "contactType": "customer service"
    }
  };

  const localBusinessLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Aarotech",
    "image": "https://aarotech.in/images/aarotech-logos/footer-logo-primary.png",
    "@id": "https://aarotech.in",
    "url": "https://aarotech.in",
    "telephone": process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Tamil Nadu",
      "addressCountry": "IN"
    }
  };

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${inter.variable} antialiased overscroll-none scroll-smooth`}>
        <body suppressHydrationWarning className="min-h-screen flex flex-col pb-20 sm:pb-0 overscroll-none bg-background">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
          />
          {children}
          <WhatsAppButton />
          <MobileCTA />
          <ClickTracker />
          <CursorGlow />
        </body>
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        {process.env.NEXT_PUBLIC_GTM_ID && <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
              `
            }}
          />
        )}
      </html>
    </ClerkProvider>
  );
}
