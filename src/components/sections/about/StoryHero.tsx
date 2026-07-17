import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { TextReveal } from "@/components/ui/text-reveal";

export function StoryHero() {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <AnimateOnScroll delay="0s">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-tight">
              Still early. <br className="hidden md:block" />
              Already building. <br className="hidden md:block" />
              <span className="text-primary">Already serious about the work.</span>
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll delay="0.1s">
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              We are a young digital growth team based in Trichy. We are building something of our own—and combining strategy, creativity, and technology to help businesses across Tamil Nadu build what comes next.
            </p>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
