"use client";

import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContactForm, ContactFormProps } from "@/components/shared/ContactForm";
import { cn } from "@/lib/utils";

export function ContactPopup({
  children,
  onOpenChange,
  popupTitle = "Request Your Free Growth Plan",
  ...formProps
}: {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  popupTitle?: string;
} & ContactFormProps) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    onOpenChange?.(val);
    if (val) {
      setFormKey((k) => k + 1);
    } else {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }
    }
  };

  // Scroll lock: lock the <html> element so the page can't scroll behind the modal.
  // Avoids the position:fixed trick which conflicts with scroll-smooth on <html>.
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const html = document.documentElement;

    // Lock scroll without moving the page
    html.style.overflow = "hidden";
    html.style.scrollBehavior = "auto"; // disable smooth scroll while locked

    return () => {
      // Kill smooth scroll temporarily so the restore is instant, not animated
      html.style.scrollBehavior = "auto";
      html.style.overflow = "";

      // Restore scroll position instantly
      window.scrollTo({ top: scrollY, behavior: "instant" as ScrollBehavior });

      // Re-enable smooth scroll after a tick
      requestAnimationFrame(() => {
        html.style.scrollBehavior = "";
      });
    };
  }, [open]);

  const handleSuccess = () => {
    // Deliberately not auto-closing so the user can read the success message.
    // They can manually close it via the X button or clicking outside.
  };

  return (
    <>
      {React.isValidElement(children) ? React.cloneElement(children as React.ReactElement<any>, {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          handleOpenChange(true);
          const childOnClick = (children as React.ReactElement<any>).props.onClick;
          if (childOnClick) {
            childOnClick(e);
          }
        },
        className: cn((children as React.ReactElement<any>).props.className, "cursor-pointer")
      }) : children}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="
            sm:max-w-[600px] bg-slate-900 border-slate-800 p-0 overflow-hidden shadow-2xl
            max-h-[90dvh] flex flex-col
            max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:translate-x-0 max-sm:translate-y-0
            max-sm:w-full max-sm:max-w-full max-sm:rounded-b-none max-sm:rounded-t-2xl
          "
          onClick={(e) => e.stopPropagation()}
        >
          <DialogTitle className="sr-only">{popupTitle}</DialogTitle>
          <div className="flex items-center justify-between px-5 sm:px-8 pt-6 pb-4 border-b border-slate-800 shrink-0">
            <h2 className="text-lg font-bold text-white">{popupTitle}</h2>
            <button
              onClick={() => handleOpenChange(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 ml-4"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 sm:p-8 overflow-y-auto flex-1 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <ContactForm key={formKey} onSuccess={handleSuccess} {...formProps} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
