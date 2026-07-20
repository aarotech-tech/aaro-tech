"use client";

import { useState } from "react";
import { markInvoicePaidManuallyAction } from "@/app/actions/billing";
import { CheckCircleIcon, Loader2Icon } from "lucide-react";

export default function MarkPaidButton({ invoiceId }: { invoiceId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMarkPaid = async () => {
    setIsSubmitting(true);
    await markInvoicePaidManuallyAction(invoiceId);
    setIsSubmitting(false);
  };

  return (
    <button
      onClick={handleMarkPaid}
      disabled={isSubmitting}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center transition-colors disabled:opacity-50"
    >
      {isSubmitting ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircleIcon className="w-4 h-4 mr-2" />}
      Mark as Paid Manually
    </button>
  );
}
