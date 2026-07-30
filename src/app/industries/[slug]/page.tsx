import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Contact } from "@/components/sections/Contact";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Factory } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { FAQSection } from "@/components/shared/FAQSection";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import { ContactPopup } from "@/components/shared/ContactPopup";
import { generateArticleSchema, generateFAQSchema } from "@/lib/seo";
import { industries } from "@/data/industries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const industry = industries.find((i) => i.slug === resolvedParams.slug);
  
  if (!industry) return {};

  return {
    title: industry.metaTitle,
    description: industry.metaDescription,
    openGraph: {
      title: industry.metaTitle,
      description: industry.metaDescription,
      type: "article",
    }
  };
}

export async function generateStaticParams() {
  return industries.map((industry) => ({
    slug: industry.slug,
  }));
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const industry = industries.find((i) => i.slug === resolvedParams.slug);

  if (!industry) notFound();

  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden pt-16 bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateArticleSchema({
              title: industry.name,
              headline: industry.heroSubtitle,
              image: "/images/aarotech-icon.png",
              datePublished: "2026-07-15",
              dateModified: "2026-07-15",
              authorName: "Aarotech Strategy Team",
              urlPath: `/industries/${industry.slug}`
            }))
          }}
        />
        {industry.faqs && industry.faqs.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(industry.faqs)) }}
          />
        )}

        {/* Hero Section */}
        <section className="bg-slate-50 py-20 lg:py-32 border-b border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="mb-8 flex justify-center">
              <Breadcrumbs items={[{ name: "Industries", item: "#" }, { name: industry.name, item: `/industries/${industry.slug}` }]} />
            </div>
            <div className="inline-flex items-center rounded-full border border-primary/20 px-4 py-1.5 text-sm font-semibold text-primary mb-6 bg-primary/5">
              <Factory className="w-4 h-4 mr-2" />
              {industry.heroSubtitle}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
              Digital Marketing for <span className="text-primary">{industry.name}</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              {industry.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <ContactPopup>
                <button className={buttonVariants({ size: "lg", className: "h-auto py-4 px-6 w-full sm:w-auto text-base md:text-lg font-bold shadow-lg whitespace-normal" })}>
                  <span>Get My Free Growth Plan</span>
                  <ArrowRight className="ml-2 h-5 w-5 shrink-0 inline-block" />
                </button>
              </ContactPopup>
            </div>
          </div>
        </section>

        {/* Overview & Challenges */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Navigating the Digital Landscape</h2>
                <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                  {industry.overview.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Core Industry Challenges</h3>
                <ul className="space-y-4">
                  {industry.challenges.map((challenge, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <CheckCircle2 className="w-5 h-5 text-rose-500" />
                      </div>
                      <p className="ml-3 text-slate-700 font-medium">{challenge}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions */}
        <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none"></div>
           <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
             <div className="text-center mb-16 max-w-3xl mx-auto">
               <h2 className="text-3xl md:text-5xl font-bold mb-6">How Aarotech Drives Growth</h2>
               <p className="text-xl text-slate-400">Our specialized approach designed exclusively for the {industry.name} sector.</p>
             </div>
             <div className="grid md:grid-cols-2 gap-8">
               {industry.howWeHelp.map((item, idx) => (
                 <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-colors">
                   <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-6 text-xl font-bold">
                     {idx + 1}
                   </div>
                   <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                   <p className="text-slate-400 leading-relaxed">{item.description}</p>
                 </div>
               ))}
             </div>
           </div>
        </section>

        {/* Process */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-16 text-slate-900">Our Proven Execution Process</h2>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {industry.process.map((step, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 text-slate-500 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 group-hover:bg-primary group-hover:text-white transition-colors">
                    {idx + 1}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-white border border-slate-100 shadow-sm group-hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-slate-900 text-lg">{step}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs & Related Content */}
        <section className="py-24 bg-slate-50 border-t border-slate-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {industry.faqs && industry.faqs.length > 0 && (
              <div className="mb-24">
                <FAQSection faqs={industry.faqs} title="Common Questions" />
              </div>
            )}
            
            <RelatedLinks 
              relatedBlogSlugs={industry.relatedBlogs}
              relatedCaseStudySlugs={industry.relatedCaseStudies}
              relatedServiceSlugs={industry.services}
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
