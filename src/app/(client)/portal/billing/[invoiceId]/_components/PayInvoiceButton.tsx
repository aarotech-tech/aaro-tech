"use client";

import { useState } from "react";
import { submitManualPaymentDetailsAction } from "@/app/actions/billing";
import { CheckCircleIcon, Loader2Icon, UploadIcon } from "lucide-react";

export default function PayInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [utr, setUtr] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr.trim()) return;
    
    setIsSubmitting(true);
    try {
      await submitManualPaymentDetailsAction(invoiceId, utr);
      setSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg font-medium shadow-sm flex items-center justify-center w-full sm:w-auto">
        <CheckCircleIcon className="w-5 h-5 mr-2" />
        Payment Processing
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg flex items-center justify-center transition-colors w-full sm:w-auto"
      >
        <UploadIcon className="w-5 h-5 mr-2" />
        I Have Sent Payment
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-2">Submit Payment Details</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Please provide the UTR (Transaction ID) from your bank transfer so we can verify your payment.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">UTR / Transaction ID *</label>
                <input 
                  type="text"
                  required
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="e.g. SBIN000000000"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !utr.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Submit Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
