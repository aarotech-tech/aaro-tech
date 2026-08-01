"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { createAutomationAction } from "@/modules/automations/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  triggerEvent: z.string().min(1, "Trigger is required"),
  actionType: z.string().min(1, "Action is required"),
});

export function NewAutomationModal() {
  const [open, setOpen] = useState(false);
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      triggerEvent: "",
      actionType: "",
    },
  });

  const { execute, isExecuting } = useAction(createAutomationAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Automation created successfully.");
        setOpen(false);
        form.reset();
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to create automation.");
    }
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    execute(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Zap className="w-4 h-4 mr-2" /> New Automation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Automation</DialogTitle>
          <DialogDescription>
            Create a new workflow by selecting a trigger event and an action.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Automation Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Notify sales on won deal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="triggerEvent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trigger Event</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a trigger" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deal.won">Deal Won</SelectItem>
                        <SelectItem value="lead.created">Lead Created</SelectItem>
                        <SelectItem value="invoice.paid">Invoice Paid</SelectItem>
                        <SelectItem value="invoice.overdue">Invoice Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="actionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slack.message">Send Slack Message</SelectItem>
                        <SelectItem value="email.send">Send Email</SelectItem>
                        <SelectItem value="task.assign">Assign Task</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={isExecuting}>
                {isExecuting ? "Creating..." : "Create Automation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
