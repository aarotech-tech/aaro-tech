"use client";

import { ContactPopup } from "@/components/shared/ContactPopup";
import { buttonVariants } from "@/components/ui/button";
import { LampContainer } from "@/components/ui/lamp";
import { motion } from "framer-motion";

export function StoryCTA() {
  return (
    <section className="bg-slate-950">
      <LampContainer className="min-h-[80vh] md:min-h-screen w-full">
        <motion.div
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="max-w-3xl mx-auto text-center mt-12 md:mt-24"
        >
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
            We&apos;re building Aarotech. <br />
            <span className="text-slate-400">Your business is building something too.</span>
          </h2>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed">
            Maybe we can help.
          </p>
          <ContactPopup>
            <button className={buttonVariants({ size: "lg", className: "text-lg font-semibold px-8 h-14 shadow-[0_0_40px_rgba(250,2,1,0.4)] hover:shadow-[0_0_60px_rgba(250,2,1,0.6)] transition-shadow duration-500" })}>
              Start a conversation
            </button>
          </ContactPopup>
        </motion.div>
      </LampContainer>
    </section>
  );
}
