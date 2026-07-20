"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon } from "lucide-react";
import { addDealLineItem, removeDealLineItem } from "../actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Service = { id: string; name: string; basePrice: number; description: string | null };
type LineItem = { id: string; title: string; unitPrice: number; total: number; quantity: number; isRecurring: boolean | null };

export default function LineItemsEditor({ 
  proposalId, 
  dealId, 
  services,
  currentLineItems
}: { 
  proposalId: string;
  dealId: string;
  services: Service[];
  currentLineItems: LineItem[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Local state for the selected service to auto-fill price
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    setSelectedServiceId(sId);
    if (sId) {
      const s = services.find(srv => srv.id === sId);
      if (s) {
        setCustomTitle(s.name);
        setCustomPrice(s.basePrice.toString());
      }
    } else {
      setCustomTitle("");
      setCustomPrice("");
    }
  };

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    await addDealLineItem(proposalId, dealId, {
      serviceId: selectedServiceId || undefined,
      title: formData.get("title") as string,
      unitPrice: parseInt(formData.get("price") as string) || 0,
      quantity: parseInt(formData.get("quantity") as string) || 1,
      isRecurring: formData.get("isRecurring") === "on",
    });
    
    setLoading(false);
    setOpen(false);
    // Reset form
    setSelectedServiceId("");
    setCustomTitle("");
    setCustomPrice("");
  }

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Quoted Line Items</h3>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="outline" size="sm" className="border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100" />}>
            <span className="flex items-center"><PlusIcon className="w-4 h-4 mr-2" /> Add Line Item</span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Deal Line Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select from Catalog (Optional)</label>
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                  value={selectedServiceId}
                  onChange={handleServiceChange}
                >
                  <option value="">-- Custom Item --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (${s.basePrice})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Title</label>
                <input name="title" required value={customTitle} onChange={e => setCustomTitle(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="e.g. Custom Web App" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ($)</label>
                  <input name="price" type="number" required value={customPrice} onChange={e => setCustomPrice(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="1000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input name="quantity" type="number" required defaultValue="1" min="1" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="isRecurring" name="isRecurring" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-900">
                  Recurring Service (e.g. Monthly Retainer)
                </label>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="button" variant="ghost" className="mr-2" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700">
                  {loading ? "Adding..." : "Add to Deal"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {currentLineItems.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded p-6 text-center text-gray-500 text-sm">
          No line items have been added to this deal yet. Add items to build the quote.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 font-medium">Item</th>
                <th className="px-4 py-2 font-medium text-right">Qty</th>
                <th className="px-4 py-2 font-medium text-right">Price</th>
                <th className="px-4 py-2 font-medium text-right">Total</th>
                <th className="px-4 py-2 font-medium text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentLineItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{item.title}</span>
                    {item.isRecurring && <span className="ml-2 text-[10px] uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Recurring</span>}
                  </td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">${item.unitPrice.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">${item.total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => removeDealLineItem(proposalId, dealId, item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove item"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
