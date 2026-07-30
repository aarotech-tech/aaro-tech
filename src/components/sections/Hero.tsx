"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { TextReveal } from "@/components/ui/text-reveal";
import { ContactPopup } from "@/components/shared/ContactPopup";

export function Hero() {

  return (
    <section className="relative overflow-hidden bg-[#6891b3] pt-24 pb-16">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-y-0 left-0 w-full lg:w-[50%] bg-gradient-to-r from-[#0f172a]/60 to-transparent pointer-events-none z-0"></div>
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-center min-h-[70vh]">
          <div className="w-full lg:w-[55%] flex flex-col items-start text-left text-white relative z-10 lg:pr-8 animate-slide-up-fade" style={{ animationDelay: "0s" }}>
            <div className="inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-sm text-white/80 mb-4 bg-white/10 backdrop-blur-sm animate-slide-up-fade" style={{ animationDelay: "0.1s" }}>
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Accepting new clients
            </div>

            <TextReveal 
              text="Grow Your Business with Trichy's Most Trusted Digital Marketing Agency" 
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.1] max-w-3xl mb-4 [text-shadow:_0_4px_16px_rgb(0_0_0_/_30%)]" 
              delay={2}
            />
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-6 leading-relaxed animate-slide-up-fade" style={{ animationDelay: "0.3s" }}>
              We are a leading SEO and web development company helping local businesses generate more leads, improve online visibility, and grow revenue through expert digital marketing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-2 animate-slide-up-fade" style={{ animationDelay: "0.4s" }}>
              <ContactPopup>
                <button className={`${buttonVariants({ size: "lg", className: "h-14 px-8 w-full sm:w-auto text-base shadow-xl hover:-translate-y-1 transition-all" })} bg-primary text-white hover:bg-primary/90`}>
                  Get Your Free Growth Plan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </ContactPopup>
              {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
                <Link href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Aarotech, I would like to chat about my business.")}`} className={`${buttonVariants({ size: "lg", variant: "outline", className: "h-14 px-8 w-full sm:w-auto text-base bg-transparent border-white/20 text-white hover:bg-white/10" })}`}>
                  Chat With a Founder
                </Link>
              )}
            </div>
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-6 animate-slide-up-fade" style={{ animationDelay: "0.5s" }}>
              Proudly partnering with businesses in Trichy, Chennai, Coimbatore, Madurai, & across TN.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-white/90 font-medium animate-slide-up-fade" style={{ animationDelay: "0.6s" }}>
              <div className="flex items-center gap-3 px-3 py-2.5 border border-white/10 rounded-xl bg-[#0f172a]/40 backdrop-blur-sm shadow-sm transition-all hover:bg-[#0f172a]/60 hover:border-white/20">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,0,0,0.8)] shrink-0" />
                Founder-Led Agency
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 border border-white/10 rounded-xl bg-[#0f172a]/40 backdrop-blur-sm shadow-sm transition-all hover:bg-[#0f172a]/60 hover:border-white/20">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,0,0,0.8)] shrink-0" />
                Results Driven
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 border border-white/10 rounded-xl bg-[#0f172a]/40 backdrop-blur-sm shadow-sm transition-all hover:bg-[#0f172a]/60 hover:border-white/20">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,0,0,0.8)] shrink-0" />
                Direct Communication
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 border border-white/10 rounded-xl bg-[#0f172a]/40 backdrop-blur-sm shadow-sm transition-all hover:bg-[#0f172a]/60 hover:border-white/20">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,0,0,0.8)] shrink-0" />
                Custom Growth Strategies
              </div>
            </div>
          </div>

          <div 
            className="absolute inset-0 lg:static lg:w-[45%] flex justify-center items-center z-0 opacity-40 lg:opacity-100 pointer-events-none lg:pointer-events-auto overflow-hidden lg:overflow-visible"
          >
            <video
              src="/animations/Red%20Floating%20Cube.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full lg:h-[550px] object-cover pointer-events-none lg:scale-[1.25] mix-blend-screen lg:mix-blend-normal [mask-image:radial-gradient(circle_at_center,black_30%,transparent_80%)] [-webkit-mask-image:radial-gradient(circle_at_center,black_30%,transparent_80%)] lg:[mask-image:radial-gradient(circle_at_center,black_50%,transparent_80%)] lg:[-webkit-mask-image:radial-gradient(circle_at_center,black_50%,transparent_80%)] will-change-transform"
              disablePictureInPicture
              disableRemotePlayback
            />
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 w-full flex flex-col items-center relative z-10 pb-8 lg:pb-0">
          <p className="text-sm text-white/50 font-bold mb-6 uppercase tracking-wider text-center">Specialized digital strategies for:</p>
          <div className="flex flex-wrap justify-center gap-4">
            {["Healthcare", "Education", "Local Businesses"].map((industry) => (
              <span key={industry} className="px-5 py-2.5 rounded-full border border-white/10 bg-[#0f172a]/40 backdrop-blur-md text-sm font-semibold text-white/90 shadow-sm transition-colors hover:bg-[#0f172a]/60 hover:border-white/20 cursor-default">
                {industry}
              </span>
            ))}
            <span className="px-5 py-2.5 rounded-full border border-transparent bg-transparent text-sm font-medium text-white/50 flex items-center italic">
              + Many More
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
