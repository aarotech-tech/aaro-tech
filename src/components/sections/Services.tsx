import { services } from "@/data/content";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { TextReveal } from "@/components/ui/text-reveal";
import { Tilt } from "@/components/ui/tilt";

export function Services() {
  return (
    <section id="services" className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <AnimateOnScroll delay="0s">
            <TextReveal text="How We Help Businesses Grow" className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-6 justify-center text-center" />
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
      </div>
    </section>
  );
}
