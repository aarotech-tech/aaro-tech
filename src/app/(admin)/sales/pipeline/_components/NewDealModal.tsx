"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDealAction } from "@/modules/sales/actions";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";

interface Organization {
  id: string;
  name: string;
}

interface NewDealModalProps {
  organizations: Organization[];
}

export function NewDealModal({ organizations }: NewDealModalProps) {
  const [open, setOpen] = useState(false);
  const { execute, isExecuting } = useAction(createDealAction, {
    onSuccess: () => {
      toast.success("Deal created successfully!");
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create deal");
      console.error(error);
    }
  });

  const [orgId, setOrgId] = useState<string>("");
  const selectedOrg = organizations.find((o) => o.id === orgId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const valueStr = formData.get("value") as string;
    
    execute({
      organizationId: orgId,
      name: formData.get("name") as string,
      value: valueStr ? parseInt(valueStr, 10) * 100 : 0, // Convert to cents
      expectedCloseDate: (formData.get("expectedCloseDate") as string) || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-primary text-white hover:bg-primary/90 transition-colors" />}>
        + New Deal
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="organizationId">Organization (Client/Lead)</Label>
            <Select 
              name="organizationId" 
              required 
              value={orgId} 
              onValueChange={(val) => setOrgId(val || "")}
            >
              <SelectTrigger>
                {selectedOrg ? selectedOrg.name : <span className="text-muted-foreground">Select organization</span>}
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Deal Name</Label>
            <Input id="name" name="name" placeholder="e.g. Q3 SEO Retainer" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="value">Estimated Value (₹)</Label>
            <Input id="value" name="value" type="number" min="0" step="any" placeholder="e.g. 50000" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
            <Input id="expectedCloseDate" name="expectedCloseDate" type="date" />
          </div>
          
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isExecuting}>
              {isExecuting ? "Creating..." : "Create Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
