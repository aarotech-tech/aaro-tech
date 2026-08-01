"use client";

import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  secondaryActionOnClick?: () => void;
  children?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
  secondaryActionLabel,
  secondaryActionHref,
  secondaryActionOnClick,
  children,
  className
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-xl",
        "bg-gradient-to-b from-white to-gray-50/80 border border-gray-200/60 shadow-sm",
        "backdrop-blur-sm relative overflow-hidden",
        className
      )}
    >
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, type: "spring", bounce: 0.4 }}
        className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary mb-6 ring-1 ring-primary/20 shadow-inner"
      >
        <Icon className="h-8 w-8 stroke-[1.5]" aria-hidden="true" />
      </motion.div>
      
      <motion.h3 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-gray-900 tracking-tight"
      >
        {title}
      </motion.h3>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-2 text-sm text-gray-500 max-w-sm leading-relaxed"
      >
        {description}
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex items-center justify-center gap-3 flex-wrap relative z-10"
      >
        {actionLabel && actionHref && (
          <Button render={<Link href={actionHref} />} className="shadow-md shadow-primary/10">
            {actionLabel}
          </Button>
        )}

        {actionLabel && actionOnClick && !actionHref && (
          <Button onClick={actionOnClick} className="shadow-md shadow-primary/10">
            {actionLabel}
          </Button>
        )}

        {secondaryActionLabel && secondaryActionHref && (
          <Button variant="outline" render={<Link href={secondaryActionHref} />} className="bg-white/50 backdrop-blur-sm hover:bg-gray-50">
            {secondaryActionLabel}
          </Button>
        )}

        {secondaryActionLabel && secondaryActionOnClick && !secondaryActionHref && (
          <Button variant="outline" onClick={secondaryActionOnClick} className="bg-white/50 backdrop-blur-sm hover:bg-gray-50">
            {secondaryActionLabel}
          </Button>
        )}
      </motion.div>

      {children && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 relative z-10 w-full"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
