"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export function Timeline({ steps }: { steps: string[] }) {
  return (
    <div className="relative border-l border-slate-200 ml-3 md:ml-0 md:border-l-0">
      <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-slate-200 -translate-y-1/2 z-0" />
      <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-4">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex md:flex-col items-center gap-4 md:gap-4 relative pl-8 md:pl-0"
          >
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-primary/20 -translate-y-1/2 -z-10 scale-x-0 origin-left" />
            <div className="absolute left-0 md:relative w-6 h-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center -translate-x-[29px] md:translate-x-0 shrink-0">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider hidden md:block">Step {index + 1}</div>
              <h4 className="text-sm md:text-base font-bold text-slate-900">{step}</h4>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
