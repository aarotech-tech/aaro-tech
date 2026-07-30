import { services } from "@/data/content";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { TextReveal } from "@/components/ui/text-reveal";
import { Tilt } from "@/components/ui/tilt";

interface ServicesProps {
  showViewAllButton?: boolean;
}

export function Services({ showViewAllButton = false }: ServicesProps) {
  return (
    <section id="services" className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <AnimateOnScroll delay="0s">
            <TextReveal text="How We Help Businesses Grow" className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-tight text-slate-900 mb-6 justify-center text-center" />
          </AnimateOnScroll>
          <AnimateOnScroll delay="0.1s">
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed">
              No fluff. Just proven strategies designed to drive traffic, capture leads, and directly increase your revenue.
            </p>
          </AnimateOnScroll>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <AnimateOnScroll key={service.id} delay={`${index * 0.1 + 0.2}s`} className="h-full">
              <Tilt className="h-full w-full">
                <Link href={`/services/${service.id}`} className="block h-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-xl">
                  <Card className="group h-full border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-xl hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                    <div className="transform-gpu transition-all duration-300 [transform:translateZ(0px)] group-hover:[transform:translateZ(40px)] h-full flex flex-col">
                      <CardHeader className="p-6 pb-4">
                        <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                          <service.icon className="w-7 h-7" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900">{service.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 pt-0 flex-1 flex flex-col">
                        <CardDescription className="text-base text-slate-500 mb-6 flex-1">
                          {service.description}
                        </CardDescription>
                        <span className="inline-flex items-center text-sm font-bold text-primary transition-colors rounded-sm px-1 -ml-1 w-max">
                          Learn more <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              </Tilt>
            </AnimateOnScroll>
          ))}
        </div>
        
        {showViewAllButton && (
          <div className="mt-16 text-center">
            <AnimateOnScroll delay="0.4s">
              <Link href="/services" className="group relative inline-flex h-14 items-center justify-center rounded-full p-[2px] shadow-sm hover:-translate-y-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden">
                {/* Default static border */}
                <div className="absolute inset-0 bg-primary/20 rounded-full transition-opacity duration-300 group-hover:opacity-0"></div>
                
                {/* Rotating gradient border */}
                <div className="absolute left-1/2 top-1/2 aspect-square w-[300%] -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="h-full w-full animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,#FA0201_0%,#0f172a_50%,#FA0201_100%)]"></div>
                </div>

                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white px-8 text-base font-bold text-primary transition-all">
                  View All Services
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </AnimateOnScroll>
          </div>
        )}
      </div>
    </section>
  );
}
