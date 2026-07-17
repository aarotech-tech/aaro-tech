import { industries } from "@/data/industries";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { TextReveal } from "@/components/ui/text-reveal";

export function Industries() {
  return (
    <section id="industries" className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <AnimateOnScroll delay="0s">
            <TextReveal text="Who We Partner With" className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 justify-center text-center" />
          </AnimateOnScroll>
          <AnimateOnScroll delay="0.1s">
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed">
              We understand the exact bottlenecks holding your industry back and we know how to fix them.
            </p>
          </AnimateOnScroll>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {industries.map((industry, index) => (
            <AnimateOnScroll key={industry.slug} delay={`${index * 0.1 + 0.2}s`} className="h-full">
              <Link href={`/industries/${industry.slug}`} className="block group focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-2xl h-full">
                <Card className="h-full border border-slate-200 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 rounded-2xl bg-white">
                  <CardContent className="p-6 sm:p-8 flex flex-col h-full">
                    <h3 className="text-2xl font-bold mb-8 text-slate-900 group-hover:text-primary transition-colors">{industry.name}</h3>
                    <div className="space-y-6 flex-1">
                      <div className="flex items-start bg-destructive/5 p-4 rounded-xl border border-destructive/10">
                        <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5 mr-3" />
                        <div>
                          <span className="block text-sm font-bold text-slate-900 mb-1.5 uppercase tracking-wide">The Bottleneck</span>
                          <p className="text-sm text-slate-500 leading-relaxed">{industry.problem}</p>
                        </div>
                      </div>
                      <div className="flex items-start bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5 mr-3" />
                        <div>
                          <span className="block text-sm font-bold text-slate-900 mb-1.5 uppercase tracking-wide">Our Fix</span>
                          <p className="text-sm text-slate-500 leading-relaxed">{industry.solution}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center text-primary font-bold">
                      View Strategy
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
        
        <AnimateOnScroll delay="0.5s">
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-4">
              <div className="h-px w-12 sm:w-24 bg-slate-200"></div>
              <p className="text-lg md:text-xl font-bold text-slate-400 italic tracking-wide">
                ...and Many More
              </p>
              <div className="h-px w-12 sm:w-24 bg-slate-200"></div>
            </div>
            <p className="text-sm text-slate-500 mt-4 max-w-xl mx-auto">
              Don&apos;t see your industry? We build custom growth strategies for all types of businesses. Reach out to see how we can help.
            </p>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
