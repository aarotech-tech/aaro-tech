import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/data/work";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FallbackImage as Image } from "@/components/ui/fallback-image";
import { ArrowRight, CheckCircle2, LayoutTemplate, LineChart, Smartphone, Palette, PenTool, Image as ImageIcon, Rocket } from "lucide-react";
import { Contact } from "@/components/sections/Contact";
import { ServiceCategory } from "@/data/work";
import { RelatedLinks } from "@/components/shared/RelatedLinks";

const CategoryIcon = ({ category, className }: { category: ServiceCategory, className?: string }) => {
  switch (category) {
    case "Website Development": return <LayoutTemplate className={className} />;
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
    return { title: "Case Study Not Found" };
  }

  return {
    title: `${study.title} | Aarotech Case Study`,
    description: `Read how Aarotech helped ${study.isNDA ? 'a client in the ' + study.industry + ' industry' : study.client} achieve measurable growth through our ${study.serviceCategory} services.`,
    openGraph: {
      title: study.title,
      description: `Read how Aarotech helped ${study.isNDA ? 'a client' : study.client} achieve measurable growth.`,
      images: [{ url: study.heroImage }],
    }
  };
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const study = projects.find((s) => s.slug === slug);

  if (!study) {
    notFound();
  }

  // JSON-LD schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": study.title,
    "image": [study.heroImage, ...study.gallery],
    "author": {
      "@type": "Organization",
      "name": "Aarotech"
    }
  };

  return (
    <>
      <Header />
      {/* 1. Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-slate-950 relative overflow-hidden text-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-10">
              {study.title}
            </h1>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 md:p-8 max-w-3xl mx-auto text-left relative overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Industry</div>
                  <div className="text-sm font-bold text-white">{study.industry}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Service</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <CategoryIcon category={study.serviceCategory} className="w-4 h-4 text-primary" />
                    {study.serviceCategory}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Duration</div>
                  <div className="text-sm font-bold text-white">{study.duration}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Client</div>
                  {study.isNDA ? (
                    <div className="text-sm font-bold text-slate-300">
                      🔒 Name withheld (NDA)
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-white">{study.client}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full h-[400px] md:h-[600px] bg-slate-800 rounded-3xl overflow-hidden relative shadow-2xl mb-16">
            {study.heroImage && (
              <Image
                src={study.heroImage}
                alt={study.title}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
        </div>
      </section>

      {/* 2. Client Overview & Challenge */}
      <section className="py-24 bg-white text-slate-900 border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
               <h2 className="text-3xl font-bold mb-6">Client Overview</h2>
               <p className="text-lg text-slate-600 leading-relaxed">{study.clientOverview}</p>
            </div>
            <div className="bg-rose-50 rounded-3xl p-10 border border-rose-100">
               <h3 className="text-2xl font-bold mb-6 text-rose-900">The Business Challenge</h3>
               <ul className="space-y-4">
                 {study.businessChallenge.map((chal, idx) => (
                   <li key={idx} className="flex items-start">
                     <div className="flex-shrink-0 mt-1"><CheckCircle2 className="w-5 h-5 text-rose-500" /></div>
                     <p className="ml-3 text-rose-800 font-medium">{chal}</p>
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Research & Strategy */}
      <section className="py-24 bg-slate-50 text-slate-900 border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center">Research & Strategy</h2>
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8">
              <h4 className="font-bold text-lg mb-4 text-primary uppercase tracking-wider">Research Phase</h4>
              <ul className="list-disc pl-5 space-y-3 text-slate-600">
                {study.research.map((res, i) => <li key={i}>{res}</li>)}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h4 className="font-bold text-lg mb-4 text-primary uppercase tracking-wider">Strategic Approach</h4>
              <ul className="list-disc pl-5 space-y-3 text-slate-600">
                {study.strategy.map((strat, i) => <li key={i}>{strat}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Execution & Deliverables */}
      <section className="py-24 bg-white text-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
               <h2 className="text-3xl font-bold mb-6">Execution</h2>
               <div className="space-y-6">
                 {study.execution.map((exe, idx) => (
                   <div key={idx} className="flex">
                     <span className="text-primary font-bold text-xl mr-4">{idx + 1}.</span>
                     <p className="text-lg text-slate-600 leading-relaxed">{exe}</p>
                   </div>
                 ))}
               </div>
            </div>
            <div>
               <h3 className="text-2xl font-bold mb-6">Final Deliverables</h3>
               <div className="flex flex-wrap gap-3">
                 {study.deliverables.map((del, idx) => (
                   <span key={idx} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium border border-slate-200">
                     {del}
                   </span>
                 ))}
               </div>
               
               <h3 className="text-2xl font-bold mb-6 mt-12">Technologies Used</h3>
               <div className="flex flex-wrap gap-3">
                 {study.technologiesUsed.map((tech, idx) => (
                   <span key={idx} className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold">
                     {tech}
                   </span>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Outcome & Impact */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-16">Business Outcome & Impact</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {study.outcome.map((stat, idx) => (
              <div key={idx} className="bg-white/10 p-8 rounded-3xl border border-white/20 backdrop-blur-sm">
                <div className="text-4xl md:text-5xl font-extrabold mb-2">{stat.value}</div>
                {stat.label && <div className="text-lg text-primary-100 font-medium">{stat.label}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Lessons Learned & Links */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 p-10 rounded-3xl border border-slate-200 mb-16">
            <h2 className="text-2xl font-bold mb-6">Lessons Learned</h2>
            <ul className="list-disc pl-5 space-y-4 text-slate-700 text-lg">
              {study.lessonsLearned.map((lesson, idx) => (
                <li key={idx}>{lesson}</li>
              ))}
            </ul>
          </div>
          
          <RelatedLinks relatedServiceSlugs={study.relatedServices} title="Related Services Used in This Project" />
        </div>
      </section>

      <Contact />
    </>
  );
}
