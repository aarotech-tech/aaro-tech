"use client";

import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { ContactForm } from "@/components/shared/ContactForm";
import { TextReveal } from "@/components/ui/text-reveal";

export function Contact() {
  return (
    <section id="contact" className="py-24 bg-slate-950 text-white relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <AnimateOnScroll delay="0s">
              <TextReveal text="Ready to Grow?" className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-tight mb-4 text-white" />
            </AnimateOnScroll>
            <AnimateOnScroll delay="0.1s">
              <p className="text-lg text-slate-300 mb-10">
                Whether you need a free growth plan, a custom strategy, or just want to bounce some ideas around - Let&apos;s talk.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll delay="0.2s">
              <div className="space-y-8 mb-12">
                {/* Contact information hidden until real details are provided */}
                {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
                  <div className="bg-[#25D366]/10 p-6 rounded-2xl border border-[#25D366]/20">
                    <h3 className="font-bold text-white mb-2">Prefer WhatsApp?</h3>
                    <p className="text-sm text-slate-300 mb-4">Chat directly with a founder and get answers instantly.</p>
                    <a
                      href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Aarotech, I would like a free growth plan for my business.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-xl text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-[#25D366] text-white hover:bg-[#20bd5a]"
                    >
                      Chat on WhatsApp
                    </a>
                  </div>
                )}
              </div>
            </AnimateOnScroll>
          </div>

          <AnimateOnScroll delay="0.4s" className="h-full">
            <div className="bg-slate-900 p-8 md:p-10 rounded-2xl border border-slate-800 shadow-xl h-full flex flex-col">
              <ContactForm />
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
