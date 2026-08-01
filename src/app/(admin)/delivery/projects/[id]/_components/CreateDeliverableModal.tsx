"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// We don't have createDeliverableAction yet, we will create it
import { createDeliverableAction } from "@/modules/delivery/actions";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

const schema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
});

export function CreateDeliverableModal({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectId,
      name: "",
    },
  });

  const { execute, isExecuting } = useAction(createDeliverableAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success("Deliverable created successfully");
        setOpen(false);
        form.reset();
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to create deliverable");
    }
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    execute(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" /> New Deliverable
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Deliverable</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Design Mockups" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4 gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isExecuting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isExecuting}>
                {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
