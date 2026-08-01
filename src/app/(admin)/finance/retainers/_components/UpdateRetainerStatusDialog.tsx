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
import { updateRetainerStatusAction } from "@/modules/finance/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UpdateRetainerStatusDialogProps {
  children: React.ReactNode;
  retainerId: string;
  status: "active" | "paused" | "cancelled";
  title: string;
  description: string;
  actionText: string;
  variant?: "default" | "destructive" | "outline";
}

export function UpdateRetainerStatusDialog({ 
  children, retainerId, status, title, description, actionText, variant = "default" 
}: UpdateRetainerStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await updateRetainerStatusAction({ retainerId, status });
      if (result?.data) {
        toast.success(`Retainer ${status} successfully`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result?.serverError || `Failed to mark retainer as ${status}`);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant={variant} type="button" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
