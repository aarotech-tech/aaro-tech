"use client";

import { useEffect } from "react";
import { sendGAEvent } from "@next/third-parties/google";

export function ClickTracker() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (!anchor || !anchor.href) return;
      
      const href = anchor.href;
      
      if (href.startsWith("tel:")) {
        sendGAEvent("event", "click_phone", { phone_number: href.replace("tel:", "") });
      } else if (href.startsWith("mailto:")) {
        sendGAEvent("event", "click_email", { email_address: href.replace("mailto:", "") });
      } else if (href.startsWith("http") && !href.includes(window.location.hostname)) {
        sendGAEvent("event", "click_outbound", { outbound_url: href });
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
