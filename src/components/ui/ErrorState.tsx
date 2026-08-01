"use client";

import { motion } from "framer-motion";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We encountered an unexpected error while processing your request.",
  onRetry,
  className
}: ErrorStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-xl",
        "bg-red-50/30 border border-red-100 shadow-sm relative overflow-hidden",
        className
      )}
    >
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-red-400 via-red-500 to-rose-400" />
      
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-6 shadow-inner ring-1 ring-red-200">
        <AlertCircle className="h-7 w-7" aria-hidden="true" />
      </div>
      
      <h3 className="text-base font-semibold text-gray-900 tracking-tight">
        {title}
      </h3>
      
      <p className="mt-2 text-sm text-gray-600 max-w-sm">
        {description}
      </p>
      
      {onRetry && (
        <div className="mt-6">
          <Button 
            variant="outline" 
            onClick={onRetry} 
            className="text-red-700 hover:text-red-800 hover:bg-red-50 border-red-200"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}
    </motion.div>
  );
}
