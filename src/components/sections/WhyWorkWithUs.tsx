import { CheckCircle, XCircle } from "lucide-react";
import { FallbackImage as Image } from "@/components/ui/fallback-image";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { TextReveal } from "@/components/ui/text-reveal";

export function WhyWorkWithUs() {
  const comparisons = [
    {
      typical: "Handed off to a junior account manager.",
      aarotech: "Direct access to the founders.",
    },
    {
      typical: "Reporting on vanity metrics like 'impressions' and 'likes'.",
      aarotech: "Reporting on pipeline, leads, and actual revenue.",
    },
    {
      typical: "Secretive process and confusing jargon.",
      aarotech: "100% transparency and plain-English communication.",
    },
    {
      typical: "Cookie-cutter templates used for every client.",
      aarotech: "Custom growth plans tailored to your local market.",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <AnimateOnScroll delay="0s">
            <TextReveal text="Why Choose Aarotech?" className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 justify-center text-center" />
          </AnimateOnScroll>
          <AnimateOnScroll delay="0.1s">
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed">
              We built this agency because we saw too many businesses getting burned by overpromising and underdelivering. We do things differently.
            </p>
          </AnimateOnScroll>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:items-center">
          <div>
            <div className="space-y-6">
              {comparisons.map((item, index) => (
                <AnimateOnScroll key={index} delay={`${index * 0.1 + 0.2}s`}>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-1 opacity-60">
                      <div className="flex items-start">
                        <XCircle className="w-5 h-5 text-destructive shrink-0 mr-3 mt-0.5" />
                        <div>
                          <span className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">Typical Agency</span>
                          <p className="text-sm text-slate-600 line-through decoration-slate-300">{item.typical}</p>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:block w-px bg-slate-200"></div>
                    <div className="flex-1">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mr-3 mt-0.5" />
                        <div>
                          <span className="block text-xs font-bold uppercase tracking-wider mb-1 text-primary">Aarotech</span>
                          <p className="text-sm font-bold text-slate-900">{item.aarotech}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>

          <AnimateOnScroll delay="0.6s" className="relative h-full flex flex-col justify-center order-first lg:order-last mb-8 lg:mb-0">
            <div className="relative">
              <div className="aspect-[4/2.8] bg-slate-100 rounded-3xl overflow-hidden relative border-8 border-white shadow-xl">
                <Image
                  src="/images/showcase/office.jpeg"
                  alt="Aarotech office and team working"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized={true}
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
