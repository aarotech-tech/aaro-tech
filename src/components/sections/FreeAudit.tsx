import { buttonVariants } from "@/components/ui/button";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { ContactPopup } from "@/components/shared/ContactPopup";
import { TextReveal } from "@/components/ui/text-reveal";

export function FreeAudit() {
  return (
    <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
      <video 
        src="/animations/Violet%20Soil.mp4" 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen pointer-events-none will-change-transform"
      />
      <div className="absolute inset-0 bg-slate-950/60 pointer-events-none"></div>
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl z-10">
        <AnimateOnScroll delay="0s">
          <TextReveal text="Stop Guessing. Start Growing." className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tighter leading-tight justify-center text-center" />
        </AnimateOnScroll>
        <div className="max-w-2xl mx-auto mb-8">
          <AnimateOnScroll delay="0.1s">
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8">
              Get a comprehensive review of your current digital presence. We will analyze your website, SEO, and social media to find hidden opportunities for growth. We&apos;ll review your current website and marketing strategy to find exactly where you are losing revenue. No strings attached, and we won&apos;t spam you.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay="0.2s">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 md:p-8 text-left border border-white/10 shadow-2xl mb-10">
              <h3 className="text-xl font-bold text-white mb-6">What You Get in Your Free Plan:</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="bg-primary/20 text-primary rounded-xl w-6 h-6 flex items-center justify-center shrink-0 mr-3 mt-0.5 text-sm font-bold">✓</span>
                  <span className="text-slate-300">Deep-dive technical audit of your website&apos;s performance and conversion rate.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/20 text-primary rounded-xl w-6 h-6 flex items-center justify-center shrink-0 mr-3 mt-0.5 text-sm font-bold">✓</span>
                  <span className="text-slate-300">Competitor analysis to see exactly what others in your local market are doing.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/20 text-primary rounded-xl w-6 h-6 flex items-center justify-center shrink-0 mr-3 mt-0.5 text-sm font-bold">✓</span>
                  <span className="text-slate-300">A step-by-step, actionable 90-day roadmap to increase leads and revenue.</span>
                </li>
              </ul>
            </div>
          </AnimateOnScroll>
        </div>
        <AnimateOnScroll delay="0.4s">
          <ContactPopup>
            <button className={buttonVariants({ variant: "default", size: "lg", className: "h-14 px-8 text-lg font-bold shadow-lg shadow-primary/20" })}>
              Get My Free Growth Plan
            </button>
          </ContactPopup>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
