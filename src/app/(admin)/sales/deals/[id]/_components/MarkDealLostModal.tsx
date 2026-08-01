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
import { updateDealStageAction } from "@/modules/sales/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";

interface MarkDealLostModalProps {
  children: React.ReactNode;
  dealId: string;
  organizationId: string;
}

export function MarkDealLostModal({ children, dealId, organizationId }: MarkDealLostModalProps) {
  const [open, setOpen] = useState(false);
  const [lostReason, setLostReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const onSubmit = async () => {
    if (!lostReason.trim()) {
      toast.error("Please provide a reason for losing this deal.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateDealStageAction({ 
        dealId, 
        organizationId, 
        stage: "lost", 
        lostReason: lostReason.trim() 
      });
      
      if (result?.data) {
        toast.success("Deal marked as lost");
        setOpen(false);
        router.refresh();
      } else if (result?.serverError) {
        toast.error(result.serverError);
      } else {
        toast.error("Failed to update deal");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild nativeButton={true}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <DialogTitle>Mark Deal as Lost</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            This will move the deal to the "Closed Lost" stage. Please provide a reason to help with future sales analysis.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <label htmlFor="lost-reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for loss
          </label>
          <Textarea 
            id="lost-reason"
            placeholder="e.g. Went with competitor, price too high, project cancelled..."
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
            className="w-full"
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onSubmit} disabled={isSubmitting || !lostReason.trim()}>
            {isSubmitting ? "Updating..." : "Mark as Lost"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
