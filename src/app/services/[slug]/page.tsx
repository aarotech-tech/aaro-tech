import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { services } from "@/data/content";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ContactPopup } from "@/components/shared/ContactPopup";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const service = services.find(s => s.id === resolvedParams.slug);

  if (!service) return {};

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aarotech.in";
  const title = service.h1 ? service.h1 + " | Aarotech" : `${service.title} | Aarotech Digital Marketing`;
  const description = service.intro ? service.intro : service.description;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/services/${service.id}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/services/${service.id}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const service = services.find(s => s.id === resolvedParams.slug);

  if (!service) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-24 pb-16 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="bg-white rounded-3xl p-8 md:p-12 lg:p-16 border shadow-sm mb-12">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary mb-6">
              Our Services
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {service.h1 || service.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mb-10">
              {service.intro || service.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <ContactPopup>
                <button className={buttonVariants({ size: "lg", className: "h-12 px-8 text-base" })}>
                  {service.cta || "Get My Free Growth Plan"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </ContactPopup>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why partner with us?</h2>
              <ul className="space-y-4">
                {(service.benefits || [
                  "Data-driven strategies tailored to your specific goals.",
                  "Transparent reporting on ROI and key metrics.",
                  "No generic templates, everything is custom-built.",
                  "Founder-led execution to ensure the highest quality."
                ]).map((point, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 shrink-0" />
                    <span className="text-lg text-slate-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 rounded-2xl p-8 md:p-12 w-full border border-slate-200 shadow-sm relative group overflow-hidden flex flex-col items-center justify-center text-center min-h-[350px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_100%)] opacity-5 transition-opacity duration-500 group-hover:opacity-10"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-500">
                  <service.icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
                <p className="text-slate-600 text-lg leading-relaxed max-w-sm mx-auto">
                  {service.description}
                </p>
              </div>
            </div>
          </div>

          {service.faqs && service.faqs.length > 0 && (
            <div className="bg-white rounded-3xl p-8 md:p-12 lg:p-16 border shadow-sm mb-24">
              <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {service.faqs.map((faq, index) => (
                  <div key={index} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{faq.question}</h3>
                    <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
