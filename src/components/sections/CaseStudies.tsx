import { caseStudies } from "@/data/content";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, LayoutTemplate } from "lucide-react";
import { FallbackImage as Image } from "@/components/ui/fallback-image";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { ContactPopup } from "@/components/shared/ContactPopup";
import { TextReveal } from "@/components/ui/text-reveal";

export function CaseStudies() {
  return (
    <section id="work" className="py-24 bg-slate-50 text-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-20 gap-6">
          <div className="max-w-2xl">
            <AnimateOnScroll delay="0s">
              <TextReveal text="Results We've Helped Create" className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 justify-center text-center" />
            </AnimateOnScroll>
            <AnimateOnScroll delay="0.1s">
              <p className="text-lg md:text-xl text-slate-500 leading-relaxed">
                We do not just talk about growth; we deliver it. Here is how we have helped businesses achieve their goals.
              </p>
            </AnimateOnScroll>
          </div>
          <AnimateOnScroll delay="0.2s">
            <ContactPopup>
              <button className="inline-flex items-center font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer">
                Start Your Success Story <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </ContactPopup>
          </AnimateOnScroll>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <AnimateOnScroll key={study.id} delay={`${index * 0.1 + 0.3}s`} className="h-full">
              <Card className="bg-white border-slate-200 shadow-sm text-slate-900 flex flex-col overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-300 rounded-2xl h-full">
                <div className="w-full h-56 md:h-64 bg-slate-100 border-b border-slate-200 relative overflow-hidden group">
                  {study.image ? (
                    <Image 
                      src={study.image} 
                      alt={`${study.clientIndustry} case study`} 
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
                </div>
                <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
                  <div className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700 mb-6 w-fit">
                    {study.clientIndustry}
                  </div>
                  <div className="space-y-6 flex-1">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">The Challenge</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{study.challenge}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Our Solution</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{study.solution}</p>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">The Outcome</h4>
                    <p className="text-lg font-bold leading-snug">{study.outcome}</p>
                  </div>
                </CardContent>
              </Card>
            </AnimateOnScroll>
          ))}
        </div>
        <AnimateOnScroll delay="0.6s">
          <div className="mt-16 text-center max-w-2xl mx-auto border-t border-slate-200 pt-8">
            <p className="text-sm text-slate-500 mb-6 italic">
              Detailed case studies and campaign data available during consultation.
            </p>
            <ContactPopup>
              <button className="inline-flex items-center text-sm font-bold text-slate-700 hover:text-primary transition-colors border border-slate-200 hover:border-primary rounded-full px-6 py-2.5 bg-white shadow-sm cursor-pointer">
                Request Full Case Study <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </ContactPopup>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
