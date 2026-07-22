"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { verifyManualPaymentAction } from "@/modules/finance/actions";
import { Loader2 } from "lucide-react";

export function VerifyPaymentButton({ paymentId }: { paymentId: string }) {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!confirm("Are you sure you want to verify this manual payment? This will mark the invoice as paid and trigger delivery workflows.")) {
      return;
    }
    
    setIsVerifying(true);
    
    try {
      const result = await verifyManualPaymentAction({ paymentId });
      
      if (result?.data?.success) {
        toast.success("Payment verified successfully.");
      } else {
        toast.error(result?.serverError || "Failed to verify payment");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Button 
      variant="default" 
      size="sm"
      onClick={handleVerify}
      disabled={isVerifying}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Verify Payment
    </Button>
  );
}
