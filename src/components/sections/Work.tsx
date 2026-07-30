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

export function Work() {
  const topProjects = projects.slice(0, 3);

  return (
    <section id="work" className="py-24 bg-slate-50 text-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-20 gap-6">
          <div className="max-w-2xl">
            <AnimateOnScroll delay="0s">
              <TextReveal text="Results We've Helped Create" className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-tight mb-6 justify-center md:justify-start" />
            </AnimateOnScroll>
            <AnimateOnScroll delay="0.1s">
              <p className="text-lg md:text-xl text-slate-500 leading-relaxed">
                We do not just talk about growth; we deliver it. Explore how we solve complex business challenges through strategic design, marketing, and engineering.
              </p>
            </AnimateOnScroll>
          </div>
          <AnimateOnScroll delay="0.2s">
            <Link href="/work" className="inline-flex items-center font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer text-lg">
              View All Work <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </AnimateOnScroll>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {topProjects.map((study, index) => (
            <AnimateOnScroll key={study.id} delay={`${index * 0.1 + 0.3}s`} className="h-full">
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
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Key Outcomes</h4>
                        
                        {study.outcome.filter(o => o.isQuantitative).slice(0, 1).map((out, idx) => (
                          <div key={`quant-${idx}`} className="mb-4 bg-green-50/50 border border-green-500/20 rounded-xl p-4 flex flex-col gap-1">
                            {out.label && (
                              <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">
                                {out.label}
                              </span>
                            )}
                            <span className="text-sm font-bold text-green-800 leading-snug flex items-start">
                              <span className="text-green-500 mr-2 shrink-0">✓</span>
                              {out.value}
                            </span>
                          </div>
                        ))}

                        <ul className="space-y-1.5">
                          {study.outcome.filter(o => !o.isQuantitative || study.outcome.filter(qo => qo.isQuantitative).indexOf(o) > 0).map((out, idx) => (
                            <li key={idx} className="text-sm font-medium text-slate-700 flex items-start">
                              <span className="text-primary mr-2 shrink-0 mt-0.5">✓</span>
                              <span className="line-clamp-2 leading-snug">{out.value}</span>
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
        <AnimateOnScroll delay="0.6s">
          <div className="mt-16 text-center max-w-2xl mx-auto pt-4">
            <Link href="/work" className="group relative inline-flex items-center justify-center rounded-full p-[2px] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden">
              {/* Default static border */}
              <div className="absolute inset-0 bg-primary/20 rounded-full transition-opacity duration-300 group-hover:opacity-0"></div>
              
              {/* Rotating gradient border */}
              <div className="absolute left-1/2 top-1/2 aspect-square w-[300%] -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="h-full w-full animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,#FA0201_0%,#0f172a_50%,#FA0201_100%)]"></div>
              </div>

              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-bold text-primary transition-all">
                View All Work
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
