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
import { archiveContactAction } from "@/modules/directory/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

interface ArchiveContactDialogProps {
  children: React.ReactNode;
  contactId: string;
  contactName: string;
}

export function ArchiveContactDialog({ children, contactId, contactName }: ArchiveContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const onSubmit = async () => {
    setIsSubmitting(true);

    try {
      const result = await archiveContactAction({ contactId });
      
      if (result?.data) {
        toast.success("Contact archived successfully");
        setOpen(false);
        router.refresh();
      } else if (result?.serverError) {
        toast.error(result.serverError);
      } else {
        toast.error("Failed to archive contact");
      }
    } catch (error) {
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
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Archive Contact</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to archive <strong>{contactName}</strong>? They will no longer appear in active lists.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Archiving..." : "Archive Contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
