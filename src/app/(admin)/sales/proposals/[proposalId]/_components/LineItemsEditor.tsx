"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { addDealLineItemAction, removeDealLineItem } from "../actions";
import { addDealLineItemSchema } from "@/lib/validations/proposal";
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
  const form = useForm<z.infer<typeof addDealLineItemSchema>>({
    resolver: zodResolver(addDealLineItemSchema),
    defaultValues: {
      proposalId,
      dealId,
      serviceId: "",
      title: "",
      description: "",
      unitPrice: 0,
      quantity: 1,
      isRecurring: false,
    },
  });

  const { execute, isExecuting } = useAction(addDealLineItemAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Line item added successfully");
        setOpen(false);
        form.reset();
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to add line item");
    }
  });

  const handleServiceChange = (value: string | null) => {
    form.setValue("serviceId", value || "");
    if (value) {
      const s = services.find(srv => srv.id === value);
      if (s) {
        form.setValue("title", s.name);
        form.setValue("unitPrice", s.basePrice);
      }
    } else {
      form.setValue("title", "");
      form.setValue("unitPrice", 0);
    }
  };

  const onSubmit = (values: z.infer<typeof addDealLineItemSchema>) => {
    execute(values);
  };

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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select from Catalog (Optional)</FormLabel>
                      <Select onValueChange={handleServiceChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="-- Custom Item --" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">-- Custom Item --</SelectItem>
                          {services.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name} (${s.basePrice})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Custom Web App" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="unitPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" placeholder="1000" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                      <FormControl>
                        <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5" checked={field.value} onChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">
                          Recurring Service (e.g. Monthly Retainer)
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="button" variant="ghost" className="mr-2" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isExecuting} className="bg-blue-600 text-white hover:bg-blue-700">
                    {isExecuting ? "Adding..." : "Add to Deal"}
                  </Button>
                </div>
              </form>
            </Form>
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
