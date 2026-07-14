import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Contact } from "@/components/sections/Contact";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";

const validCities = [
  "chennai", "coimbatore", "madurai", "trichy"
];

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const city = resolvedParams.city.toLowerCase();
  if (!validCities.includes(city)) return {};

  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  return {
    title: `Digital Marketing Agency in ${cityName} | Aarotech`,
    description: `Aarotech is the premier digital marketing agency in ${cityName}. We help local businesses generate more leads and grow revenue with SEO, Ads, and Web Development.`,
    keywords: [`${cityName} digital marketing`, `SEO agency ${cityName}`, `web design ${cityName}`, `business growth ${cityName}`],
    openGraph: {
      title: `Digital Marketing Agency in ${cityName} | Aarotech`,
      description: `Aarotech is the premier digital marketing agency in ${cityName}. We help local businesses generate more leads and grow revenue with SEO, Ads, and Web Development.`,
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

  const cityName = city.charAt(0).toUpperCase() + city.slice(1);

  const faqs = [
    {
      question: `Why do I need a local digital marketing agency in ${cityName}?`,
      answer: `Working with a local agency ensures they understand the cultural nuances and specific market dynamics of ${cityName}. We know how your local customers search, what they value, and who your competitors are.`
    },
    {
      question: `How long does it take to see SEO results in ${cityName}?`,
      answer: `While some improvements can be seen in the first few months, meaningful SEO results typically take 3-6 months depending on the competitiveness of your industry in ${cityName}.`
    },
    {
      question: `Do you only work with businesses in ${cityName}?`,
      answer: `While we have dedicated strategies for ${cityName}, we serve clients across Tamil Nadu and globally. However, our local expertise gives a significant advantage to businesses operating in the area.`
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden pt-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        
        {/* Hero Section */}
        <section className="py-20 lg:py-32 bg-slate-950 text-white relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent opacity-30"></div>
           <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
             <div className="inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-sm text-white/80 mb-6 bg-white/10 backdrop-blur-sm">
               Serving {cityName}, Tamil Nadu
             </div>
             <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
                Grow Your Business in <br/><span className="text-primary">{cityName}</span>
             </h1>
             <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
               Aarotech provides data-driven digital marketing, SEO, and web development services tailored specifically for the {cityName} market.
             </p>
             <Link href="/#contact" className={buttonVariants({ size: "lg", className: "bg-primary text-white hover:bg-primary/90 h-14 px-8 text-lg shadow-xl" })}>
               Get Your Free {cityName} Growth Plan
               <ArrowRight className="ml-2 w-5 h-5" />
             </Link>
           </div>
        </section>
        
        {/* Why Choose Us */}
        <section className="py-24 bg-white text-slate-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose Aarotech in {cityName}?</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">We understand the local market dynamics in {cityName} and build custom strategies that deliver real, measurable ROI.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Local SEO Dominance</h3>
                <p className="text-slate-600 leading-relaxed">We optimize your Google Business Profile and local citations to ensure you rank #1 when customers in {cityName} search for your exact services.</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Targeted Ad Campaigns</h3>
                <p className="text-slate-600 leading-relaxed">Stop wasting ad spend. We run highly targeted Google and Meta ads to capture high-intent leads specifically within {cityName} and neighboring districts.</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">High-Converting Websites</h3>
                <p className="text-slate-600 leading-relaxed">Your website is your best salesperson. We build lightning-fast, mobile-optimized websites that turn your local {cityName} traffic into paying customers.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Local Challenges & Solutions */}
        <section className="py-24 bg-slate-50 text-slate-900 border-y border-slate-200">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">Overcoming the Biggest Marketing Challenges in {cityName}</h2>
                <p className="text-lg text-slate-600 mb-8">
                  The business landscape in {cityName} is evolving rapidly. Traditional marketing is becoming less effective, and competition is fierce. We solve the core problems local businesses face.
                </p>
                <ul className="space-y-4">
                  {[
                    "Low online visibility compared to larger competitors.",
                    "Generating inconsistent, low-quality leads.",
                    "Wasting money on ineffective Facebook or Google Ads.",
                    "Having an outdated website that doesn't convert."
                  ].map((challenge, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="w-6 h-6 text-primary mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:w-1/2 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
                 <h3 className="text-2xl font-bold mb-6">Our {cityName} Growth Blueprint</h3>
                 <p className="text-slate-600 mb-8">We don't do guesswork. We apply a proven framework customized for your industry.</p>
                 <div className="space-y-6">
                   <div className="border-l-4 border-primary pl-4">
                     <h4 className="font-bold text-lg">1. Market Audit</h4>
                     <p className="text-slate-500 text-sm">We analyze your top competitors in {cityName}.</p>
                   </div>
                   <div className="border-l-4 border-primary pl-4">
                     <h4 className="font-bold text-lg">2. Strategy Development</h4>
                     <p className="text-slate-500 text-sm">We build a multi-channel plan to capture local market share.</p>
                   </div>
                   <div className="border-l-4 border-primary pl-4">
                     <h4 className="font-bold text-lg">3. Execution & Scaling</h4>
                     <p className="text-slate-500 text-sm">We launch campaigns, optimize for conversions, and scale your revenue.</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-white text-slate-900">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-slate-600">Common questions about working with Aarotech in {cityName}.</p>
            </div>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h3 className="text-xl font-bold mb-3 text-slate-900">{faq.question}</h3>
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
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
