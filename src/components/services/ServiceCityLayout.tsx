import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Contact } from "@/components/sections/Contact";
import { ContactPopup } from "@/components/shared/ContactPopup";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { FAQSection } from "@/components/shared/FAQSection";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import { generateLocalBusinessSchema, generateFAQSchema } from "@/lib/seo";
import { ServiceLocation } from "@/data/service-locations";

interface ServiceCityLayoutProps {
  data: ServiceLocation;
  cityName: string;
  serviceName: string;
}

export function ServiceCityLayout({ data, cityName, serviceName }: ServiceCityLayoutProps) {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden pt-16 bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateLocalBusinessSchema(cityName, data.metaDescription))
          }}
        />
        {data.faqs && data.faqs.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(data.faqs)) }}
          />
        )}

        {/* Hero Section */}
        <section className="bg-slate-950 py-20 lg:py-32 border-b border-slate-800 relative overflow-hidden text-white">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
            <div className="mb-8 flex justify-center">
              <Breadcrumbs 
                theme="dark"
                items={[
                  { name: "Services", item: "/#services" }, 
                  { name: serviceName, item: `/services/${data.serviceSlug}` },
                  { name: cityName, item: `/${data.flatSlug}` }
                ]} 
              />
            </div>
            <div className="inline-flex items-center rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold text-white/80 mb-6 bg-white/10 backdrop-blur-md">
              <MapPin className="w-4 h-4 mr-2" />
              Serving {cityName}, Tamil Nadu
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
              {data.heroSubtitle}
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              {data.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ContactPopup>
                <button className={buttonVariants({ size: "lg", className: "bg-primary hover:bg-primary/90 text-white h-14 px-8 text-lg font-bold shadow-lg" })}>
                  Get Your {cityName} Growth Plan
                </button>
              </ContactPopup>
            </div>
          </div>
        </section>

        {/* Intro & Landscape */}
        <section className="py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Local Dominance in {cityName}</h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  {data.intro}
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                  {data.businessLandscape}
                </p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Why You Need Our Expertise</h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  {data.whyNeedUs}
                </p>
                <Link href={`/locations/${data.citySlug}`} className="inline-flex items-center font-bold text-primary hover:underline">
                  View full {cityName} agency details <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Process Highlight */}
        <section className="py-24 bg-slate-50 border-y border-slate-100">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900">Our {cityName} Approach</h2>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">We don't use generic templates. Every strategy is tailored specifically for the {cityName} market dynamics.</p>
            
            <div className="grid md:grid-cols-3 gap-8 text-left">
               <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                 <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 font-bold text-xl">1</div>
                 <h3 className="text-xl font-bold mb-3">Local Audit</h3>
                 <p className="text-slate-600">Deep dive into your top competitors located specifically in and around {cityName}.</p>
               </div>
               <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                 <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 font-bold text-xl">2</div>
                 <h3 className="text-xl font-bold mb-3">Custom Strategy</h3>
                 <p className="text-slate-600">Building a multi-channel plan designed to capture local market share rapidly.</p>
               </div>
               <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                 <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 font-bold text-xl">3</div>
                 <h3 className="text-xl font-bold mb-3">Execution & ROI</h3>
                 <p className="text-slate-600">Deploying the strategy with ruthless efficiency and tracking every lead generated.</p>
               </div>
            </div>
          </div>
        </section>

        {/* FAQs & Related Content */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            {data.faqs && data.faqs.length > 0 && (
              <div className="mb-24">
                <FAQSection faqs={data.faqs} title={`Frequently Asked Questions: ${cityName}`} />
              </div>
            )}
            
            <RelatedLinks 
              relatedBlogSlugs={data.relatedBlogs}
              relatedServiceSlugs={data.relatedServices}
              title="Explore More Resources"
            />
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
    </>
  );
}
