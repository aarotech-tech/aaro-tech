import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { ClientLogos } from "@/components/sections/ClientLogos";
import { FreeAudit } from "@/components/sections/FreeAudit";
import { Services } from "@/components/sections/Services";
import { TechStackMarquee } from "@/components/sections/TechStackMarquee";
import { Industries } from "@/components/sections/Industries";
import { HowWeWork } from "@/components/sections/HowWeWork";
import { Work } from "@/components/sections/Work";
import { WhyWorkWithUs } from "@/components/sections/WhyWorkWithUs";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { Contact } from "@/components/sections/Contact";

import { generateLocalBusinessSchema } from "@/lib/seo";

export default function Home() {
  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <Hero />
        <ClientLogos />
        <Services />
        <div className="mb-16">
          <TechStackMarquee />
        </div>
        <Industries />
        <HowWeWork />
        <Work />
        <Testimonials />
        <WhyWorkWithUs />
        <FreeAudit />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
