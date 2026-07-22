"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDealDetailsAction } from "@/modules/sales/actions";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { Edit2 } from "lucide-react";

interface EditDealModalProps {
  deal: {
    id: string;
    name: string;
    value: number;
    expectedCloseDate: Date | null;
  };
}

export function EditDealModal({ deal }: EditDealModalProps) {
  const [open, setOpen] = useState(false);
  
  const { execute, isExecuting } = useAction(updateDealDetailsAction, {
    onSuccess: () => {
      toast.success("Deal updated successfully!");
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to update deal");
      console.error(error);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const valueStr = formData.get("value") as string;
    
    execute({
      dealId: deal.id,
      name: formData.get("name") as string,
      value: valueStr ? parseInt(valueStr, 10) * 100 : 0, // Convert to cents
      expectedCloseDate: (formData.get("expectedCloseDate") as string) || null,
    });
  };

  const defaultDate = deal.expectedCloseDate 
    ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] 
    : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Edit2 className="w-4 h-4 mr-2" /> Edit Details
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Deal Name</Label>
            <Input id="name" name="name" defaultValue={deal.name} required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="value">Estimated Value (₹)</Label>
            <Input 
              id="value" 
              name="value" 
              type="number" 
              min="0" 
              step="any"
              defaultValue={deal.value ? deal.value / 100 : ""} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
            <Input 
              id="expectedCloseDate" 
              name="expectedCloseDate" 
              type="date" 
              defaultValue={defaultDate}
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isExecuting}>
              {isExecuting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
