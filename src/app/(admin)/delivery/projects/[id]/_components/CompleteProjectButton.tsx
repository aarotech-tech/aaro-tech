"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import { completeProjectAction } from "@/modules/delivery/actions";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CompleteProjectButton({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const [open, setOpen] = useState(false);

  const { execute, isExecuting } = useAction(completeProjectAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success("Project marked as completed successfully.");
        setOpen(false);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to complete project. Please ensure all tasks are completed.");
      setOpen(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <CheckCircle className="w-4 h-4 mr-2" /> Complete Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Project</DialogTitle>
          <div className="text-sm text-gray-500 mt-2">
            Are you sure you want to mark this project as completed? This action requires all tasks to be finished.
          </div>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isExecuting}>Cancel</Button>
          <Button 
            variant="default" 
            onClick={() => execute({ projectId, organizationId })} 
            disabled={isExecuting}
          >
            {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Completion
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
