"use client";

import { useAction } from "next-safe-action/hooks";
import { deleteAutomationAction } from "@/modules/automations/actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteAutomationButton({ id }: { id: string }) {
  const { execute, isExecuting } = useAction(deleteAutomationAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Automation deleted.");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to delete automation.");
    }
  });

  return (
    <Button 
      variant="ghost" 
      size="icon-xs" 
      onClick={() => execute({ id })}
      disabled={isExecuting}
      className="text-red-500 hover:text-red-600 hover:bg-red-50"
    >
      <Trash2 className="w-3.5 h-3.5" />
      <span className="sr-only">Delete</span>
    </Button>
  );
}
