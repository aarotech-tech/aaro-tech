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
import { archiveOrganizationAction } from "@/modules/directory/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

interface ArchiveOrganizationDialogProps {
  children: React.ReactNode;
  organizationId: string;
  organizationName: string;
}

export function ArchiveOrganizationDialog({ children, organizationId, organizationName }: ArchiveOrganizationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const onSubmit = async () => {
    setIsSubmitting(true);

    try {
      const result = await archiveOrganizationAction({ organizationId });
      
      if (result?.data) {
        toast.success("Organization archived successfully");
        setOpen(false);
        router.push("/directory/organizations");
      } else if (result?.serverError) {
        toast.error(result.serverError);
      } else {
        toast.error("Failed to archive organization");
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
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <DialogTitle>Archive Organization</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to archive <strong>{organizationName}</strong>? This will hide the organization from active views, but its historical data will be preserved.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Archiving..." : "Archive Organization"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
