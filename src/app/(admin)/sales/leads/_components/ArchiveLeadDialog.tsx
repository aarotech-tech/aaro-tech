"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateLeadStatusAction } from "@/modules/sales/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";

interface ArchiveLeadDialogProps {
  children?: React.ReactNode;
  leadId: string;
  leadName: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ArchiveLeadDialog({ children, leadId, leadName, open: externalOpen, onOpenChange: setExternalOpen }: ArchiveLeadDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled ? setExternalOpen! : setInternalOpen;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const onSubmit = async () => {
    setIsSubmitting(true);

    try {
      const result = await updateLeadStatusAction({ leadId, status: "archived" });
      
      if (result?.data) {
        toast.success("Lead archived successfully", {
          action: result.data.actionLogId ? {
            label: "Undo",
            onClick: async () => {
              const { revertAction } = await import("@/modules/core/undo");
              const undoRes = await revertAction(result.data.actionLogId!);
              if (undoRes.data?.success) {
                toast.success("Lead unarchived");
                router.refresh();
              } else {
                toast.error(undoRes.serverError || "Failed to undo");
              }
            }
          } : undefined
        });
        setOpen(false);
        router.refresh();
      } else if (result?.serverError) {
        toast.error(result.serverError);
      } else {
        toast.error("Failed to archive lead");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-gray-500" />
            <DialogTitle>Archive Lead</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to archive the lead <strong>{leadName}</strong>? They will be removed from your active leads list.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Archiving..." : "Archive Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
