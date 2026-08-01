"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { createWebhookAction } from "@/modules/automations/actions";
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
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Webhook } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Must be a valid URL"),
  events: z.array(z.string()).min(1, "Select at least one event"),
});

const EVENT_OPTIONS = [
  { id: "deal.won", label: "Deal Won" },
  { id: "deal.lost", label: "Deal Lost" },
  { id: "lead.created", label: "Lead Created" },
  { id: "invoice.paid", label: "Invoice Paid" },
  { id: "project.completed", label: "Project Completed" },
];

export function ManageWebhooksModal() {
  const [open, setOpen] = useState(false);
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      url: "",
      events: [],
    },
  });

  const { execute, isExecuting } = useAction(createWebhookAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Webhook created successfully.");
        setOpen(false);
        form.reset();
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to create webhook.");
    }
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    execute(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full mt-4" size="sm">
          <Webhook className="w-4 h-4 mr-2" /> Manage Webhooks
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Webhooks</DialogTitle>
          <DialogDescription>
            Register a new webhook endpoint to listen to system events.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Zapier Integration" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payload URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.example.com/webhook" type="url" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="events"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Events to send</FormLabel>
                    <FormDescription>
                      Select which events should trigger this webhook.
                    </FormDescription>
                  </div>
                  <div className="space-y-2">
                    {EVENT_OPTIONS.map((option) => (
                      <FormField
                        key={option.id}
                        control={form.control}
                        name="events"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, option.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== option.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={isExecuting}>
                {isExecuting ? "Creating..." : "Add Webhook"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
