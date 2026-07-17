import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { TextReveal } from "@/components/ui/text-reveal";

export function TheHonestTruth() {
  return (
    <section className="py-20 md:py-32 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll delay="0s">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-8 leading-tight">
              We are building our business while helping you build yours.
            </h2>
          </AnimateOnScroll>
          
          <div className="space-y-6 text-lg md:text-xl text-slate-600 leading-relaxed">
            <AnimateOnScroll delay="0.1s">
              <p>
                We are still building Aarotech. But we have already started.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll delay="0.2s">
              <p>
                We&apos;ve worked with a few small businesses, created content, helped run campaigns, and learned what it means to make ideas work outside of a presentation. Every project teaches us something. Every client relationship matters.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll delay="0.3s">
              <p>
                We don&apos;t have the luxury of coasting on past reputation. We have to prove ourselves every single day. We are still early. But we are no longer just talking about building something. We are doing it.
              </p>
            </AnimateOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
