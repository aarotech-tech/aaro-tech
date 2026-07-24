"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { approveProposalAction } from "../actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const schema = z.object({
  proposalId: z.string().uuid(),
  sig: z.string().min(1, "Signature token is required"),
  expires: z.string().min(1, "Expiry is required"),
  signature: z.string().min(1, "Signature is required"),
});

export function ApproveProposalForm({ proposalId, sig, expires }: { proposalId: string, sig: string, expires: string }) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      proposalId,
      sig: sig || "",
      expires: expires || "",
      signature: "",
    },
  });

  const { execute, isExecuting } = useAction(approveProposalAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Proposal approved successfully");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to approve proposal");
    }
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    execute(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md">
        <FormField
          control={form.control}
          name="signature"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel className="block text-sm font-medium text-gray-700">Type your full name to sign</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Jane Doe" className="text-gray-900" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={isExecuting}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 rounded-lg text-lg flex items-center justify-center"
        >
          {isExecuting && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
          Approve Proposal
        </Button>
        <p className="text-xs text-gray-500 text-center mt-4">
          IP address and timestamp will be recorded for security.
        </p>
      </form>
    </Form>
  );
}
