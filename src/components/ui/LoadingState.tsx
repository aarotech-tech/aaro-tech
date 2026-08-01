"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
  fullHeight?: boolean;
}

export function LoadingState({
  title = "Loading data...",
  description = "Please wait a moment while we fetch the latest information.",
  className,
  fullHeight = false
}: LoadingStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center",
        fullHeight ? "min-h-[400px] h-full" : "min-h-[250px]",
        className
      )}
    >
      <div className="relative">
        {/* Outer glowing ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 rounded-full border border-primary/20 border-t-primary/60 border-r-primary/10"
        />
        {/* Inner reverse rotating ring */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-2 rounded-full border border-primary/10 border-b-primary/40 border-l-primary/10"
        />
        
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-transparent shadow-inner">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      </div>
      
      <motion.h3 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 text-sm font-medium text-gray-900"
      >
        {title}
      </motion.h3>
      
      {description && (
        <motion.p 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-1.5 text-xs text-gray-500 max-w-[250px]"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
