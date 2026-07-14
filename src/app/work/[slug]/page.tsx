import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/data/work";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FallbackImage as Image } from "@/components/ui/fallback-image";
import { ArrowRight, Share2, Globe, CheckCircle2, LayoutTemplate, LineChart, Smartphone, Palette, PenTool, Image as ImageIcon, Rocket } from "lucide-react";
import Link from "next/link";
import { Timeline } from "@/components/work/Timeline";
import { Contact } from "@/components/sections/Contact";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceCategory } from "@/data/work";

const CategoryIcon = ({ category, className }: { category: ServiceCategory, className?: string }) => {
  switch (category) {
    case "Website Development": return <Globe className={className} />;
    case "SEO": return <LineChart className={className} />;
    case "Social Media Marketing": return <Smartphone className={className} />;
    case "Branding": return <Palette className={className} />;
    case "Content Creation": return <PenTool className={className} />;
    case "Graphic Design": return <ImageIcon className={className} />;
    case "Marketing Campaigns": return <Rocket className={className} />;
    default: return <LayoutTemplate className={className} />;
  }
};

type Props = {
  params: Promise<{ slug: string }>;
};

// Next.js generateStaticParams
export async function generateStaticParams() {
  return projects.map((study) => ({
    slug: study.slug,
  }));
}

// Next.js dynamic metadata for SEO
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const study = projects.find((s) => s.slug === slug);

  if (!study) {
    return { title: "Work Not Found" };
  }

  return {
    title: `${study.title} | Aarotech Portfolio`,
    description: study.summary.impact,
    openGraph: {
      title: study.title,
      description: study.summary.impact,
      images: [{ url: study.heroImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: study.title,
      description: study.summary.impact,
      images: [study.heroImage],
    },
    alternates: {
      canonical: `https://aarotech.com/work/${study.slug}`,
    }
  };
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const study = projects.find((s) => s.slug === slug);

  if (!study) {
    notFound();
  }

  const related = projects.filter(s => study.relatedSlugs.includes(s.slug));

  // JSON-LD schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": study.title,
    "image": [study.heroImage, ...study.gallery],
    "author": {
      "@type": "Organization",
      "name": "Aarotech"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Aarotech",
      "logo": {
        "@type": "ImageObject",
        "url": "https://aarotech.com/logo.png"
      }
    },
    "description": study.summary.impact
  };

  return (
    <>
      <Header />
      {/* 1. Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-slate-50 relative overflow-hidden">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter leading-tight mb-10 text-slate-900">
              {study.title}
            </h1>
            
            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/60 p-6 md:p-8 max-w-3xl mx-auto shadow-sm text-left relative overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Industry</div>
                  <div className="text-sm font-bold text-slate-900">{study.industry}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Project Type</div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <CategoryIcon category={study.serviceCategory} className="w-4 h-4 text-primary" />
                    {study.serviceCategory}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Engagement</div>
                  <div className="text-sm font-bold text-slate-900">End-to-End {study.serviceCategory}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Timeline</div>
                  <div className="text-sm font-bold text-slate-900">{study.duration}</div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-200/60 relative z-10">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Client</div>
                {study.isNDA ? (
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-100/80 px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-slate-400">🔒</span> {study.client} <span className="font-medium text-slate-500 text-xs ml-1">(Name withheld under NDA)</span>
                  </div>
                ) : (
                  <div className="text-lg md:text-xl font-bold text-slate-900">{study.client}</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="w-full h-[400px] md:h-[600px] bg-slate-200 rounded-3xl overflow-hidden relative shadow-2xl mb-16 group">
            {study.heroImage ? (
              <Image 
                src={study.heroImage} 
                alt={study.title} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                priority
              />
            ) : (
               <div className="flex items-center justify-center h-full">
                 <LayoutTemplate className="w-24 h-24 text-slate-400" />
               </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 max-w-5xl mx-auto py-4">
            <div className="flex gap-4 ml-auto">
              {study.websiteUrl && (
                <a href={study.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-bold text-slate-700 hover:text-primary transition-colors bg-white border border-slate-200 rounded-full px-6 py-3 shadow-sm hover:border-primary">
                  <Globe className="w-4 h-4 mr-2" /> Visit Website
                </a>
              )}
              <button className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary transition-colors shadow-sm" aria-label="Share">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 overflow-x-hidden bg-white">
        
        {/* 2. Executive Summary */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center md:text-left">
              <h2 className="text-3xl font-bold mb-8">Executive Summary</h2>
              <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium">
                {study.summary.client} {study.summary.challenge} <span className="text-slate-900">{study.summary.delivery}</span> {study.summary.impact}
              </p>
            </div>
          </div>
        </section>

        {/* 3. The Challenge & 4. Our Approach */}
        <section className="py-24 bg-slate-50 border-y border-slate-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 lg:gap-24 max-w-6xl mx-auto">
              
              <div>
                <h2 className="text-3xl font-bold mb-8 flex items-center">
                  <span className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-4 text-xl">✕</span> 
                  The Challenge
                </h2>
                <div className="space-y-4">
                  {study.challenge.map((c, i) => (
                    <div key={i} className="flex p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-red-400 mt-2 mr-4 shrink-0" />
                      <p className="text-slate-600 font-medium leading-relaxed">{c}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-8 flex items-center">
                  <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4 text-xl">✓</span> 
                  Our Approach
                </h2>
                <div className="space-y-6">
                  {study.approach.map((a, i) => (
                    <div key={i} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-primary">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">{a.category}</h4>
                      <p className="text-slate-600 font-medium leading-relaxed">{a.description}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 5. Process Timeline */}
        {study.timeline && study.timeline.length > 0 && (
          <section className="py-24 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-16 text-center">Process Timeline</h2>
                <Timeline steps={study.timeline} />
              </div>
            </div>
          </section>
        )}

        {/* 6. What We Delivered */}
        {study.deliverables && study.deliverables.length > 0 && (
          <section className="py-24 bg-slate-900 text-white relative">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold mb-12 text-center">What We Delivered</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {study.deliverables.map((item, i) => (
                    <div key={i} className="flex items-center p-6 rounded-2xl bg-slate-800/50 border border-slate-700 shadow-sm hover:border-primary/50 transition-colors">
                      <CheckCircle2 className="w-6 h-6 text-primary mr-4 shrink-0" />
                      <span className="font-bold text-slate-200 text-lg">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 7. The Impact */}
        {study.impact && study.impact.length > 0 && (
          <section className="py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-12">The Impact</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {study.impact.map((res, i) => (
                    <div key={i} className="p-8 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col justify-center h-full min-h-[200px]">
                      {res.isQuantitative ? (
                        <>
                          <div className="text-5xl md:text-6xl font-bold text-primary mb-4">{res.value}</div>
                          {res.label && <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">{res.label}</div>}
                        </>
                      ) : (
                        <div className="text-xl md:text-2xl font-medium text-slate-800 leading-snug">
                          {res.value}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 8. Gallery (Masonry Layout) */}
        {study.gallery && study.gallery.length > 0 && (
          <section className="py-24 bg-slate-50 border-y border-slate-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-12 text-center">Gallery</h2>
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                  {study.gallery.map((img, i) => (
                    <div key={i} className="break-inside-avoid rounded-3xl overflow-hidden shadow-lg border border-slate-200 relative group">
                      <Image 
                        src={img} 
                        alt={`Gallery image ${i + 1}`} 
                        width={800}
                        height={600}
                        className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 9. Testimonial */}
        {study.testimonial && (
          <section className="py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <div className="text-5xl text-primary/20 font-serif mb-6">"</div>
                <p className="text-2xl md:text-3xl font-medium text-slate-900 leading-relaxed mb-10">
                  {study.testimonial.quote}
                </p>
                <div>
                  <div className="font-bold text-lg text-slate-900">{study.testimonial.author}</div>
                  <div className="text-slate-500 font-medium">{study.testimonial.role}</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 10. Lessons Learned */}
        {study.lessonsLearned && (
          <section className="py-24 bg-slate-900 text-white rounded-3xl max-w-6xl mx-auto mb-24 p-12 text-center shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-primary">Lessons Learned</h2>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
              {study.lessonsLearned}
            </p>
          </section>
        )}

        {/* 11. Related Projects */}
        {related.length > 0 && (
          <section className="py-24 bg-slate-50 border-t border-slate-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
              <h2 className="text-3xl font-bold mb-12">Related Work</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {related.map(rel => (
                  <Link key={rel.slug} href={`/work/${rel.slug}`} className="block group">
                    <Card className="bg-white border-slate-200 overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 rounded-2xl h-full flex flex-col">
                      <div className="w-full h-48 relative bg-slate-100 border-b border-slate-200">
                        <Image src={rel.heroImage} alt={rel.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <CardContent className="p-6">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{rel.industry}</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{rel.title}</h3>
                        <p className="text-sm text-slate-600 line-clamp-2">{rel.summary.impact}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 12. Final CTA */}
        <Contact />

      </main>
      <Footer />
    </>
  );
}
