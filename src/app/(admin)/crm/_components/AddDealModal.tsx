"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDeal } from "../actions";

export default function AddDealModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await createDeal(formData);
    
    setLoading(false);
    if (result.success) {
      setOpen(false);
    } else {
      alert("Error: " + result.error);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
      >
        Add Deal
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Deal</DialogTitle>
          </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Deal Name
            </Label>
            <Input id="name" name="name" placeholder="e.g. Website Redesign" className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              Value ($)
            </Label>
            <Input id="value" name="value" type="number" placeholder="5000" className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="organizationName" className="text-right text-sm">
              Lead / Org Name
            </Label>
            <Input id="organizationName" name="organizationName" placeholder="e.g. Acme Corp" className="col-span-3" required />
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Save Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
