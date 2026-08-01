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
import { removeProjectMemberAction } from "@/modules/delivery/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

export function RemoveMemberDialog({ children, projectId, userId, userName }: { children: React.ReactNode, projectId: string, userId: string, userName: string }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await removeProjectMemberAction({ projectId, userId });
      if (result?.data) {
        toast.success("Team member removed");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result?.serverError || "Failed to remove member");
      }
    } catch {
      toast.error("Error removing member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Remove Team Member</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to remove <strong>{userName}</strong> from this project? They will lose access to the project board.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button variant="destructive" type="button" onClick={onSubmit} disabled={isSubmitting}>Remove</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
