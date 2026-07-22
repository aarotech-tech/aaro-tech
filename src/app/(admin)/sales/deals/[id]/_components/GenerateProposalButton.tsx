"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { createDraftProposalAction } from "@/modules/sales/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function GenerateProposalButton({ dealId }: { dealId: string }) {
  const router = useRouter();
  
  const { execute, isExecuting } = useAction(createDraftProposalAction, {
    onSuccess: (result) => {
      toast.success("Draft proposal created!");
      // Navigate to the proposal editor
      if (result.data?.id) {
        router.push(`/sales/deals/${dealId}/proposals/${result.data.id}`);
      }
    },
    onError: () => {
      toast.error("Failed to create proposal");
    }
  });

  return (
    <Button 
      className="bg-primary text-white hover:bg-primary/90" 
      onClick={() => execute({ dealId })}
      disabled={isExecuting}
    >
      <FileText className="w-4 h-4 mr-2" /> 
      {isExecuting ? "Creating..." : "Generate Proposal"}
    </Button>
  );
}
