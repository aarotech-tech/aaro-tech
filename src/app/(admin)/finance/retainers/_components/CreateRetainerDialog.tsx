"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAction } from "next-safe-action/hooks";
import { createRetainerAction } from "@/modules/finance/actions";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const formSchema = z.object({
  organizationId: z.string().uuid({ message: "Please select a client." }),
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  billingDay: z.coerce.number().min(1).max(28, "Billing day must be between 1 and 28"),
  startDate: z.string().min(1, "Start date is required"),
});

export function CreateRetainerDialog({ children, organizations }: { children: React.ReactNode, organizations: { id: string, name: string }[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationId: "",
      name: "",
      amount: 0,
      billingDay: 1,
      startDate: new Date().toISOString().split('T')[0],
    }
  });

  const { execute, status } = useAction(createRetainerAction, {
    onSuccess: (res) => {
      if (res.data?.success) {
        toast.success("Retainer created successfully!");
        setOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error("Failed to create retainer");
      }
    },
    onError: (err) => {
      toast.error(err.error?.serverError || "An error occurred");
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    execute(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Retainer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Organization</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizations.map(org => (
                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retainer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Monthly SEO Services" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MRR Amount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="billingDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Day (1-28)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="28" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={status === "executing"}>
                {status === "executing" ? "Creating..." : "Create Retainer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
