import { Metadata } from "next";
import { Services } from "@/components/sections/Services";
import { FreeAudit } from "@/components/sections/FreeAudit";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Our Digital Marketing Services | Aarotech Trichy",
  description: "Explore our comprehensive suite of digital marketing services, including SEO, social media, web development, and digital advertising, tailored for businesses in Trichy and beyond.",
};

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-24 pb-12 bg-white">
        <div className="container mx-auto px-4 text-center max-w-4xl mb-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Digital Marketing Services That <span className="text-primary">Drive Growth</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            We combine data-driven strategies with creative execution to help businesses in Trichy and across Tamil Nadu scale their revenue online.
          </p>
        </div>
        
        {/* Reusing the Services section component from the homepage */}
        <Services />

        {/* Adding a CTA at the bottom */}
        <div className="mt-20">
          <FreeAudit />
        </div>
      </main>
      <Footer />
    </>
  );
}
