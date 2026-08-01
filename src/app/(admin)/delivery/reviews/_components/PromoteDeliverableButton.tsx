"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import { markDeliverableReadyForClientAction } from "@/modules/delivery/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function PromoteDeliverableButton({ deliverableId }: { deliverableId: string }) {
  const { execute, isExecuting } = useAction(markDeliverableReadyForClientAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success("Deliverable marked as ready for client.");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to promote deliverable.");
    }
  });

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => execute({ deliverableId })} 
      disabled={isExecuting}
    >
      {isExecuting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
      Mark Ready
    </Button>
  );
}
