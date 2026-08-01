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
import { qualifyLeadAction } from "@/modules/sales/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Sparkles, AlertCircle } from "lucide-react";

interface QualifyLeadDialogProps {
  children?: React.ReactNode;
  leadId: string;
  leadName: string;
  businessName: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function QualifyLeadDialog({ children, leadId, leadName, businessName, open: externalOpen, onOpenChange: setExternalOpen }: QualifyLeadDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled ? setExternalOpen! : setInternalOpen;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async () => {
    setIsSubmitting(true);
    setDuplicateWarning(null);

    try {
      const result = await qualifyLeadAction({ leadId });
      
      if (result?.data) {
        toast.success("Lead qualified and organization created!");
        setOpen(false);
        router.push("/sales/pipeline");
      } else if (result?.serverError) {
        if (result.serverError.includes("similar details already exists")) {
          setDuplicateWarning(result.serverError);
        } else {
          toast.error(result.serverError);
        }
      } else {
        toast.error("Failed to qualify lead");
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
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <DialogTitle>Qualify Lead</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to qualify <strong>{businessName || leadName}</strong>? This will create a new Prospect Organization and initial Discovery Deal in your pipeline.
          </DialogDescription>
        </DialogHeader>
        
        {duplicateWarning && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-sm flex items-start mt-2">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{duplicateWarning}</span>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isSubmitting || !!duplicateWarning}>
            {isSubmitting ? "Qualifying..." : "Qualify Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
