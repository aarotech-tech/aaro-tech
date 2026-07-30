"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex min-h-[80vh] md:min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 w-full rounded-md z-0",
        className
      )}
    >
      <div className="relative w-full h-[18rem] sm:h-[24rem] pointer-events-none z-0 flex-shrink-0">
        
        {/* Left Cone */}
        <motion.div 
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 0.8, width: "30rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="absolute top-0 right-1/2 h-56"
          style={{ backgroundImage: 'conic-gradient(from 70deg at center top, rgba(250, 2, 1, 0.5) 0%, rgba(250, 2, 1, 0) 45%, rgba(250, 2, 1, 0) 100%)' }}
        >
          <div className="absolute w-full h-40 left-0 bottom-0 bg-slate-950" style={{ WebkitMaskImage: 'linear-gradient(to top, white, transparent)', maskImage: 'linear-gradient(to top, white, transparent)' }} />
          <div className="absolute w-40 h-full left-0 bottom-0 bg-slate-950" style={{ WebkitMaskImage: 'linear-gradient(to right, white, transparent)', maskImage: 'linear-gradient(to right, white, transparent)' }} />
        </motion.div>

        {/* Right Cone */}
        <motion.div 
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 0.8, width: "30rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="absolute top-0 left-1/2 h-56"
          style={{ backgroundImage: 'conic-gradient(from 290deg at center top, rgba(250, 2, 1, 0) 0%, rgba(250, 2, 1, 0) 55%, rgba(250, 2, 1, 0.5) 100%)' }}
        >
          <div className="absolute w-full h-40 right-0 bottom-0 bg-slate-950" style={{ WebkitMaskImage: 'linear-gradient(to top, white, transparent)', maskImage: 'linear-gradient(to top, white, transparent)' }} />
          <div className="absolute w-40 h-full right-0 bottom-0 bg-slate-950" style={{ WebkitMaskImage: 'linear-gradient(to left, white, transparent)', maskImage: 'linear-gradient(to left, white, transparent)' }} />
        </motion.div>

        {/* Central base shadow to ground the text */}
        <div className="absolute top-0 mt-32 h-48 w-full scale-x-150 bg-slate-950 blur-2xl z-10"></div>
        <div className="absolute top-0 mt-32 h-48 w-full bg-transparent opacity-10 backdrop-blur-md z-20"></div>
        
        {/* Deep ambient glow bleeding beautifully upwards */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-[30rem] rounded-full bg-primary/40 opacity-60 blur-3xl z-30"></div>
        
        {/* Intense center dot */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 flex justify-center items-center z-40">
          <motion.div
            initial={{ width: "8rem" }}
            whileInView={{ width: "16rem" }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
            className="h-36 rounded-full bg-primary blur-2xl"
          ></motion.div>
        </div>
        
        {/* Sharp horizontal laser line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex justify-center items-center z-50">
          <motion.div
            initial={{ width: "15rem" }}
            whileInView={{ width: "30rem" }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
            className="h-0.5 bg-primary"
          ></motion.div>
        </div>
      </div>

      {/* Children content area */}
      <div className="relative z-50 flex flex-col items-center px-5 -mt-[14rem] sm:-mt-[20rem] pb-16">
        {children}
      </div>
    </div>
  );
};
