import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Contact } from "@/components/sections/Contact";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { FAQSection } from "@/components/shared/FAQSection";
import { generateLocalBusinessSchema, generateFAQSchema } from "@/lib/seo";
import { locationData } from "@/data/locations";
import { serviceLocations } from "@/data/service-locations";

const validCities = Object.keys(locationData);

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const city = resolvedParams.city.toLowerCase();
  if (!validCities.includes(city)) return {};

  const data = locationData[city];
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    keywords: [`${data.cityName} digital marketing`, `SEO agency ${data.cityName}`, `web design ${data.cityName}`, `business growth ${data.cityName}`],
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      type: "website",
    }
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

  const data = locationData[city];
  const { cityName } = data;

  const faqSchema = generateFAQSchema(data.faqs);
  const localBusinessSchema = generateLocalBusinessSchema(cityName, data.metaDescription);

  const getLocalServiceLink = (serviceSlug: string) => {
    const local = serviceLocations.find(s => s.serviceSlug === serviceSlug && s.citySlug === city);
    return local ? `/${local.flatSlug}` : `/services/${serviceSlug}`;
  };

  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden pt-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        
        {/* Hero Section */}
        <section className="py-20 lg:py-32 bg-slate-950 text-white relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent opacity-30"></div>
           <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
             <div className="mb-8 flex justify-center">
               <Breadcrumbs theme="dark" items={[{ name: "Locations", item: "/locations" }, { name: cityName, item: `/locations/${city}` }]} />
             </div>
             <div className="inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-sm text-white/80 mb-6 bg-white/10 backdrop-blur-sm">
               {data.heroSubtitle}
             </div>
             <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
                Grow Your Business in <br/><span className="text-primary">{cityName}</span>
             </h1>
             <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
               {data.heroDescription}
             </p>
             <Link href="/#contact" className={buttonVariants({ size: "lg", className: "bg-primary text-white hover:bg-primary/90 h-14 px-8 text-lg shadow-xl" })}>
               Get Your Free {cityName} Growth Plan
               <ArrowRight className="ml-2 w-5 h-5" />
             </Link>
           </div>
        </section>
        
        {/* Overview Section */}
        <section className="py-24 bg-white text-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-center">{data.overview.title}</h2>
            <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
              {data.overview.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Why Need Digital Marketing Section */}
        <section className="py-24 bg-slate-50 text-slate-900 border-y border-slate-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">{data.whyNeed.title}</h2>
            <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
              {data.whyNeed.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            
            <div className="mt-12 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-2xl font-bold mb-6">Our {cityName} Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href={getLocalServiceLink('seo')} className="flex items-center text-primary font-semibold hover:underline">
                  <CheckCircle2 className="w-5 h-5 mr-2" /> Local Search Engine Optimization (SEO)
                </Link>
                <Link href={getLocalServiceLink('digital-advertising')} className="flex items-center text-primary font-semibold hover:underline">
                  <CheckCircle2 className="w-5 h-5 mr-2" /> Google & Meta Ads Campaigns
                </Link>
                <Link href={getLocalServiceLink('social-media')} className="flex items-center text-primary font-semibold hover:underline">
                  <CheckCircle2 className="w-5 h-5 mr-2" /> Social Media Marketing
                </Link>
                <Link href={getLocalServiceLink('website-development')} className="flex items-center text-primary font-semibold hover:underline">
                  <CheckCircle2 className="w-5 h-5 mr-2" /> High-Converting Web Design
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Local SEO Advantages Section */}
        <section className="py-24 bg-white text-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-center">{data.localSeoAdvantages.title}</h2>
            <div className="space-y-6 text-lg text-slate-600 leading-relaxed mb-12">
              {data.localSeoAdvantages.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Google Business Profile</h3>
                <p className="text-slate-600 leading-relaxed">Complete optimization of your GBP to capture local "near me" searches.</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Local Citations</h3>
                <p className="text-slate-600 leading-relaxed">Building consistent NAP (Name, Address, Phone) across all regional directories.</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Hyperlocal Content</h3>
                <p className="text-slate-600 leading-relaxed">Crafting landing pages that target specific neighborhoods and buyer intents.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-24 bg-slate-950 text-white border-y border-slate-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-center">{data.whyChooseUs.title}</h2>
            <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
              {data.whyChooseUs.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <div className="bg-white border-y border-slate-200">
          <FAQSection faqs={data.faqs} description={`Common questions about working with Aarotech in ${cityName}.`} />
        </div>
        
        {/* Related Links & Nearby Cities */}
        <section className="py-16 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl font-bold mb-6">Also Serving Nearby Areas</h3>
            <div className="flex flex-wrap gap-3">
              {data.nearbyCities.map((city, idx) => (
                <span key={idx} className="bg-white border border-slate-200 px-4 py-2 rounded-full text-sm font-medium text-slate-700">
                  {city}
                </span>
              ))}
            </div>
            
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-6">Explore Related Resources</h3>
              <div className="flex gap-4">
                <Link href="/blog" className="text-primary font-medium hover:underline">Read our SEO Blog</Link>
                <Link href="/portfolio" className="text-primary font-medium hover:underline">View Case Studies</Link>
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
