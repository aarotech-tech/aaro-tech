import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Contact } from "@/components/sections/Contact";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Areas & Locations | Aarotech Digital Marketing Trichy",
  description: "Aarotech provides expert digital marketing, SEO, and web development services to businesses across major cities in Tamil Nadu, including Chennai, Coimbatore, Madurai, and Trichy.",
  keywords: ["Tamil Nadu digital marketing", "SEO agency Chennai", "Coimbatore marketing", "Madurai web design", "Trichy SEO"],
  openGraph: {
    title: "Service Areas & Locations | Aarotech Digital Marketing Trichy",
    description: "Aarotech provides expert digital marketing, SEO, and web development services to businesses across major cities in Tamil Nadu.",
    type: "website",
  }
};

const locations = [
  {
    city: "Chennai",
    slug: "chennai",
    description: "Dominating local search and lead generation for businesses in the bustling capital.",
  },
  {
    city: "Coimbatore",
    slug: "coimbatore",
    description: "Empowering the Manchester of South India with cutting-edge digital growth strategies.",
  },
  {
    city: "Madurai",
    slug: "madurai",
    description: "Bringing modern web design and highly-targeted ads to the cultural capital.",
  },
  {
    city: "Trichy",
    slug: "trichy",
    description: "Driving organic traffic and brand visibility for emerging enterprises in Trichy.",
  }
];

export default function LocationsIndex() {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden pt-24 bg-slate-50">
        <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
          <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center">
            <div className="inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-sm text-white/80 mb-6 bg-white/10 backdrop-blur-sm">
              <MapPin className="w-4 h-4 mr-2" /> Serving Tamil Nadu
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Local Expertise. <span className="text-primary">Global Standards.</span>
            </h1>
            <p className="text-xl text-slate-300 mx-auto">
              We bring proven digital marketing frameworks to businesses across Tamil Nadu's major economic hubs. Choose your city below to see how we can accelerate your growth.
            </p>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {locations.map((location) => (
                <Link href={`/locations/${location.slug}`} key={location.slug} className="group relative bg-white rounded-3xl border border-slate-200 p-8 md:p-12 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <MapPin className="w-32 h-32 text-slate-900" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors">
                      {location.city}
                    </h2>
                    <p className="text-lg text-slate-600 mb-8">
                      {location.description}
                    </p>
                    <div className="mt-auto flex items-center text-primary font-bold">
                      Explore Services in {location.city} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
    </>
  );
}
