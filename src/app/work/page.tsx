import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Our Work & Portfolio | Aarotech Digital Marketing Trichy",
  description: "Explore our portfolio of strategic design, marketing, and engineering projects for businesses in Trichy and beyond.",
};

export default function WorkPage() {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden pt-24">
        <WorkListing />
      </main>
      <Footer />
    </>
  );
}

import Link from "next/link";
import { projects, ServiceCategory } from "@/data/work";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, LayoutTemplate, Globe, LineChart, Smartphone, Palette, PenTool, Image as ImageIcon, Rocket } from "lucide-react";
import { FallbackImage as Image } from "@/components/ui/fallback-image";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { TextReveal } from "@/components/ui/text-reveal";

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

function WorkListing() {
  return (
    <section className="py-24 bg-slate-50 text-slate-900 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 md:mb-20">
          <AnimateOnScroll delay="0s">
            <TextReveal text="Our Work" className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight mb-6" />
          </AnimateOnScroll>
          <AnimateOnScroll delay="0.1s">
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed">
              Dive into our extensive portfolio. We partner with ambitious brands to solve complex problems through strategic design, marketing, and engineering.
            </p>
          </AnimateOnScroll>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {projects.map((study, index) => (
            <AnimateOnScroll key={study.id} delay={`${index * 0.1}s`} className="h-full">
              <Link href={`/work/${study.slug}`} className="block h-full group">
                <Card className="bg-white border-slate-200 shadow-sm text-slate-900 flex flex-col overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-500 rounded-2xl h-full">
                  <div className="w-full h-64 bg-slate-100 border-b border-slate-200 relative overflow-hidden">
                    {study.heroImage ? (
                      <Image 
                        src={study.heroImage} 
                        alt={`${study.industry} project`} 
                        fill 
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0%,transparent_100%)]"></div>
                        <div className="flex items-center justify-center h-full">
                          <LayoutTemplate className="w-16 h-16 text-slate-300" strokeWidth={1} />
                        </div>
                      </>
                    )}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2 pr-4">
                      <div className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
                        {study.industry}
                      </div>
                      <div className="inline-flex items-center rounded-full bg-primary/90 backdrop-blur-sm border border-primary/20 px-3 py-1 text-xs font-bold text-white shadow-sm gap-1.5">
                        <CategoryIcon category={study.serviceCategory} className="w-3.5 h-3.5" />
                        {study.serviceCategory}
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {study.title}
                    </h3>
                    
                    <p className="text-slate-600 text-sm font-medium mb-6 line-clamp-2 leading-relaxed">
                      {study.clientOverview}
                    </p>
                    
                    <div className="space-y-4 flex-1">
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Key Outcomes</h4>
                        <ul className="space-y-1.5">
                          {study.outcome.map((out, idx) => (
                            <li key={idx} className="text-sm font-medium text-slate-700 flex items-center">
                              <span className="text-primary mr-2">✓</span> {out.value}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Deliverables</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          {study.deliverables.slice(0, 3).join(' • ')} {study.deliverables.length > 3 && `• +${study.deliverables.length - 3} more`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4">
                      <div className="flex items-center justify-between text-sm font-bold text-primary group-hover:translate-x-1 transition-transform duration-300">
                        View Project <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
