import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Contact } from "@/components/sections/Contact";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const validCities = [
  "chennai", "coimbatore", "madurai", "trichy", 
  "salem", "tiruppur", "erode", "tirunelveli", "nagercoil"
];

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const city = resolvedParams.city.toLowerCase();
  if (!validCities.includes(city)) return {};

  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  return {
    title: `Digital Marketing Agency in ${cityName} | Aarotech`,
    description: `Aarotech is the premier digital marketing agency in ${cityName}. We help local businesses generate more leads and grow revenue with SEO, Ads, and Web Development.`,
  };
}

export async function generateStaticParams() {
  return validCities.map((city) => ({
    city: city,
  }));
}

export default async function LocationPage({ params }: { params: Promise<{ city: string }> }) {
  const resolvedParams = await params;
  const city = resolvedParams.city.toLowerCase();
  if (!validCities.includes(city)) notFound();

  const cityName = city.charAt(0).toUpperCase() + city.slice(1);

  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden pt-16">
        <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
           <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
             <div className="inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-sm text-white/80 mb-6 bg-white/10 backdrop-blur-sm">
               Serving {cityName}, Tamil Nadu
             </div>
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
                Grow Your Business in <span className="text-primary">{cityName}</span>
             </h1>
             <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
               Aarotech provides data-driven digital marketing, SEO, and web development services tailored for businesses in {cityName} and surrounding areas.
             </p>
             <Link href="/#contact" className={buttonVariants({ size: "lg", className: "bg-primary text-white hover:bg-primary/90 h-14 px-8 text-base shadow-xl" })}>
               Get Your Free {cityName} Growth Plan
               <ArrowRight className="ml-2 w-5 h-5" />
             </Link>
           </div>
        </section>
        
        <section className="py-24 bg-white text-slate-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Aarotech in {cityName}?</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">We understand the local market dynamics in {cityName} and build custom strategies that deliver real ROI.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-3 text-slate-900">Local SEO Dominance</h3>
                <p className="text-slate-600">We optimize your Google Business Profile to ensure you rank #1 when customers in {cityName} search for your exact services.</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-3 text-slate-900">Targeted Ad Campaigns</h3>
                <p className="text-slate-600">Run highly targeted Google and Meta ads to capture high-intent leads specifically within {cityName} and neighboring districts.</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-3 text-slate-900">High-Converting Websites</h3>
                <p className="text-slate-600">Build a lightning-fast, mobile-optimized website that turns your local {cityName} traffic into paying, loyal customers.</p>
              </div>
            </div>
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
    </>
  );
}
