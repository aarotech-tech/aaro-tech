import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { ClientLogos } from "@/components/sections/ClientLogos";
import { Trust } from "@/components/sections/Trust";
import { FreeAudit } from "@/components/sections/FreeAudit";
import { Services } from "@/components/sections/Services";
import { Industries } from "@/components/sections/Industries";
import { HowWeWork } from "@/components/sections/HowWeWork";
import { Work } from "@/components/sections/Work";
import { WhyWorkWithUs } from "@/components/sections/WhyWorkWithUs";
import { MeetFounders } from "@/components/sections/MeetFounders";

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
        <Trust />
        <FreeAudit />
        <Services />
        <Industries />
        <HowWeWork />
        <Testimonials />
        <Work />
        <WhyWorkWithUs />
        <MeetFounders />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
