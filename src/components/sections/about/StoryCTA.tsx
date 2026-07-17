import { ContactPopup } from "@/components/shared/ContactPopup";
import { buttonVariants } from "@/components/ui/button";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export function StoryCTA() {
  return (
    <section className="py-24 md:py-32 bg-slate-950 text-white relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl aspect-square bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <AnimateOnScroll delay="0s">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
              We&apos;re building Aarotech. <br />
              <span className="text-slate-400">Your business is building something too.</span>
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay="0.1s">
            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
              Maybe we can help.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay="0.2s">
            <ContactPopup>
              <button className={buttonVariants({ size: "lg", className: "text-lg font-semibold px-8 h-14" })}>
                Start a conversation
              </button>
            </ContactPopup>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
