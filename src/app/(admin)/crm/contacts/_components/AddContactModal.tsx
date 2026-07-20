"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { createContact } from "../actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AddContactModal({ organizations }: { organizations: any[] }) {
  const [open, setOpen] = useState(false);

  async function handleAction(formData: FormData) {
    await createContact(formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700 text-white" />}>
        <span className="flex items-center"><PlusIcon className="w-4 h-4 mr-2" /> Add Contact</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>
        <form action={handleAction} className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input name="name" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input name="email" type="email" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
            <input name="phone" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
            <select name="organizationId" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
              <option value="">Select Organization...</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="button" variant="ghost" className="mr-2" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">Save Contact</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
