"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { recordManualPaymentAction } from "@/actions/finance";
import { recordManualPaymentSchema } from "@/lib/validations/finance";
import { CheckCircleIcon, Loader2Icon, UploadIcon } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function PayInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof recordManualPaymentSchema>>({
    resolver: zodResolver(recordManualPaymentSchema),
    defaultValues: {
      invoiceId: invoiceId,
      referenceNumber: "",
      amount: 0, // This is mock since amount is set in backend
      method: "bank_transfer",
      paidAt: new Date()
    },
  });

  const { execute, isExecuting } = useAction(recordManualPaymentAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        setSuccess(true);
        toast.success("Payment Details Submitted Successfully");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to submit payment details");
    }
  });

  const onSubmit = (values: z.infer<typeof recordManualPaymentSchema>) => {
    execute(values);
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
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="referenceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UTR / Transaction ID *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. SBIN000000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <Button type="submit" disabled={isExecuting} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2">
                    {isExecuting ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Submit Details
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </>
  );
}
