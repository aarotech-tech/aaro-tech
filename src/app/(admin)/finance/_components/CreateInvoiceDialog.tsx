"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createInvoiceAction } from "@/modules/finance/actions";
import { toast } from "sonner";

export function CreateInvoiceDialog({ 
  children,
  organizations,
  projects
}: { 
  children: React.ReactNode;
  organizations: { id: string; name: string }[];
  projects: { id: string; name: string; organizationId: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  
  const filteredProjects = projects.filter(p => p.organizationId === selectedOrgId);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const orgId = formData.get("organizationId") as string;
    const projectId = formData.get("projectId") as string;
    const amountStr = formData.get("amount") as string;
    const dueDate = formData.get("dueDate") as string;
    const notes = formData.get("notes") as string;
    
    // Convert to cents
    const amountInCents = Math.round(parseFloat(amountStr) * 100);
    
    try {
      const res = await createInvoiceAction({
        organizationId: orgId,
        projectId: projectId || undefined,
        amount: amountInCents,
        dueDate: dueDate,
        notes: notes || undefined
      });
      
      if (res?.data) {
        toast.success("Invoice created successfully");
        setOpen(false);
      } else {
        toast.error("Failed to create invoice");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="organizationId">Client / Organization *</Label>
            <Select name="organizationId" required onValueChange={(val: string | null) => setSelectedOrgId(val || "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map(org => (
                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectId">Project (Optional)</Label>
            <Select name="projectId" disabled={!selectedOrgId || filteredProjects.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {filteredProjects.map(proj => (
                  <SelectItem key={proj.id} value={proj.id}>{proj.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input 
              id="amount" 
              name="amount" 
              type="number" 
              step="0.01" 
              placeholder="0.00"
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input 
              id="dueDate" 
              name="dueDate" 
              type="date" 
              defaultValue={new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]} 
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
              {loading ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
