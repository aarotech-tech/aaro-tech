"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recordManualPaymentAction } from "@/modules/finance/actions";
import { toast } from "sonner";

export function RecordPaymentDialog({ 
  invoiceId, 
  projectId, 
  organizationId, 
  balanceAmount 
}: { 
  invoiceId: string; 
  projectId: string; 
  organizationId: string; 
  balanceAmount: number;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Convert cents to dollars/rupees for input
  const defaultAmount = (balanceAmount / 100).toFixed(2);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const amountStr = formData.get("amount") as string;
    const method = formData.get("method") as string;
    const referenceNumber = formData.get("referenceNumber") as string;
    const notes = formData.get("notes") as string;
    const paidAt = formData.get("paidAt") as string;
    
    // Convert back to cents
    const amountInCents = Math.round(parseFloat(amountStr) * 100);
    
    try {
      const res = await recordManualPaymentAction({
        invoiceId,
        amount: amountInCents,
        method,
        referenceNumber,
        notes,
        paidAt
      });
      
      if (res?.data) {
        toast.success("Payment recorded successfully");
        setOpen(false);
      } else {
        toast.error("Failed to record payment");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer">Record Payment</div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Manual Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input 
              id="amount" 
              name="amount" 
              type="number" 
              step="0.01" 
              max={defaultAmount} 
              defaultValue={defaultAmount} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select name="method" defaultValue="bank_transfer" required>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="referenceNumber">Reference Number (Optional)</Label>
            <Input id="referenceNumber" name="referenceNumber" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paidAt">Payment Date</Label>
            <Input 
              id="paidAt" 
              name="paidAt" 
              type="date" 
              defaultValue={new Date().toISOString().split('T')[0]} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input id="notes" name="notes" />
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button type="button" variant="outline" className="mr-2" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
