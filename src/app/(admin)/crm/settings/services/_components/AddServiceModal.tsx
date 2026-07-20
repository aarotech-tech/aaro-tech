"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { createService } from "../actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AddServiceModal() {
  const [open, setOpen] = useState(false);

  async function handleAction(formData: FormData) {
    await createService(formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700 text-white" />}>
        <span className="flex items-center"><PlusIcon className="w-4 h-4 mr-2" /> Add Service</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
        </DialogHeader>
        <form action={handleAction} className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
            <input name="name" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="e.g. SEO Audit" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Details about this service..."></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($)</label>
            <input name="basePrice" type="number" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="1500" />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="button" variant="ghost" className="mr-2" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">Save Service</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
