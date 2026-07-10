import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { ClientLogos } from "@/components/sections/ClientLogos";
import { Trust } from "@/components/sections/Trust";
import { FreeAudit } from "@/components/sections/FreeAudit";
import { Services } from "@/components/sections/Services";
import { Industries } from "@/components/sections/Industries";
import { HowWeWork } from "@/components/sections/HowWeWork";
import { CaseStudies } from "@/components/sections/CaseStudies";
import { WhyWorkWithUs } from "@/components/sections/WhyWorkWithUs";

import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden">
        <Hero />
        <ClientLogos />
        <Trust />
        <FreeAudit />
        <Services />
        <Industries />
        <HowWeWork />
        <CaseStudies />
        <WhyWorkWithUs />
        <Testimonials />
        {/* <MeetFounders /> */}
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
