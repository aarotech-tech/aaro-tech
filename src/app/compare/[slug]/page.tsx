import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Contact } from "@/components/sections/Contact";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle2, XCircle, Scale } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { FAQSection } from "@/components/shared/FAQSection";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import { generateArticleSchema, generateFAQSchema } from "@/lib/seo";
import { comparisons } from "@/data/comparisons";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const comparison = comparisons.find((i) => i.slug === resolvedParams.slug);
  
  if (!comparison) return {};

  return {
    title: comparison.metaTitle,
    description: comparison.metaDescription,
    openGraph: {
      title: comparison.metaTitle,
      description: comparison.metaDescription,
      type: "article",
    }
  };
}

export async function generateStaticParams() {
  return comparisons.map((c) => ({
    slug: c.slug,
  }));
}

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const comparison = comparisons.find((i) => i.slug === resolvedParams.slug);

  if (!comparison) notFound();

  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden pt-16 bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateArticleSchema({
              title: comparison.title,
              headline: comparison.heroSubtitle,
              image: "/images/aarotech-icon.png",
              datePublished: "2026-07-15",
              dateModified: "2026-07-15",
              authorName: "Aarotech Strategy Team",
              urlPath: `/compare/${comparison.slug}`
            }))
          }}
        />
        {comparison.faqs && comparison.faqs.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(comparison.faqs)) }}
          />
        )}

        {/* Hero Section */}
        <section className="bg-slate-50 py-20 lg:py-32 border-b border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none"></div>
          <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
            <div className="mb-8 flex justify-center">
              <Breadcrumbs items={[{ name: "Compare", item: "#" }, { name: comparison.title, item: `/compare/${comparison.slug}` }]} />
            </div>
            <div className="inline-flex items-center rounded-full border border-primary/20 px-4 py-1.5 text-sm font-semibold text-primary mb-6 bg-primary/5">
              <Scale className="w-4 h-4 mr-2" />
              {comparison.heroSubtitle}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
              {comparison.title}
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              {comparison.heroDescription}
            </p>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
             <div className="prose prose-lg max-w-none text-slate-600">
               <p className="text-xl leading-relaxed">{comparison.intro}</p>
             </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-24 bg-slate-50 border-y border-slate-100">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">Side-by-Side Analysis</h2>
            <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-slate-200">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="p-6 text-slate-500 font-bold uppercase tracking-wider text-sm w-1/3">Feature</th>
                    <th className="p-6 text-slate-900 font-bold text-xl w-1/3 border-l border-slate-200">Option A</th>
                    <th className="p-6 text-slate-900 font-bold text-xl w-1/3 border-l border-slate-200">Option B</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.tableData.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="p-6 font-semibold text-slate-700">{row.feature}</td>
                      <td className="p-6 text-slate-600 border-l border-slate-100">{row.optionA}</td>
                      <td className="p-6 text-slate-600 border-l border-slate-100">{row.optionB}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pros & Cons */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Option A */}
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h3 className="text-2xl font-bold mb-8 text-center border-b border-slate-200 pb-4">Pros & Cons: Option A</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-emerald-600 font-bold flex items-center gap-2 mb-3"><CheckCircle2 className="w-5 h-5"/> Advantages</h4>
                    <ul className="space-y-2">
                      {comparison.optionA_ProsCons.pros.map((p, i) => <li key={i} className="text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">{p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-rose-600 font-bold flex items-center gap-2 mb-3"><XCircle className="w-5 h-5"/> Disadvantages</h4>
                    <ul className="space-y-2">
                      {comparison.optionA_ProsCons.cons.map((p, i) => <li key={i} className="text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">{p}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-2">Best Use Case:</h4>
                  <p className="text-slate-600 text-sm">{comparison.bestUseCases.optionA}</p>
                </div>
              </div>

              {/* Option B */}
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h3 className="text-2xl font-bold mb-8 text-center border-b border-slate-200 pb-4">Pros & Cons: Option B</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-emerald-600 font-bold flex items-center gap-2 mb-3"><CheckCircle2 className="w-5 h-5"/> Advantages</h4>
                    <ul className="space-y-2">
                      {comparison.optionB_ProsCons.pros.map((p, i) => <li key={i} className="text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">{p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-rose-600 font-bold flex items-center gap-2 mb-3"><XCircle className="w-5 h-5"/> Disadvantages</h4>
                    <ul className="space-y-2">
                      {comparison.optionB_ProsCons.cons.map((p, i) => <li key={i} className="text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">{p}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-2">Best Use Case:</h4>
                  <p className="text-slate-600 text-sm">{comparison.bestUseCases.optionB}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Verdict */}
        <section className="py-24 bg-slate-950 text-white relative">
           <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
             <h2 className="text-3xl md:text-5xl font-bold mb-8 text-primary">The Final Verdict</h2>
             <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-medium">
               {comparison.recommendation}
             </p>
             <div className="mt-12">
               <Link href="/#contact" className={buttonVariants({ size: "lg", className: "h-14 px-8 text-lg font-bold shadow-lg" })}>
                 Discuss Your Strategy with Us
               </Link>
             </div>
           </div>
        </section>

        {/* FAQs & Related */}
        <section className="py-24 bg-slate-50 border-t border-slate-100">
          <div className="container mx-auto px-4 max-w-5xl">
            {comparison.faqs && comparison.faqs.length > 0 && (
              <div className="mb-24">
                <FAQSection faqs={comparison.faqs} title="Frequently Asked Questions" />
              </div>
            )}
            
            <RelatedLinks 
              relatedBlogSlugs={comparison.relatedBlogs}
              relatedServiceSlugs={comparison.relatedServices}
              title="Related Guides & Services"
            />
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
    </>
  );
}
