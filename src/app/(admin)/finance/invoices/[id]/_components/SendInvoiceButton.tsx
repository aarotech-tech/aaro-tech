"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send } from "lucide-react";
// In a real app this would call an action
// import { sendInvoiceAction } from "@/modules/finance/actions";

export function SendInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async () => {
    setIsSubmitting(true);
    try {
      // Mocked action
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success("Invoice sent to client successfully.");
    } catch (err) {
      toast.error("Failed to send invoice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleSend} disabled={isSubmitting}>
      <Send className="w-4 h-4 mr-2" />
      {isSubmitting ? "Sending..." : "Send to Client"}
    </Button>
  );
}
