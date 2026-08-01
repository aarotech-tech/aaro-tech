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
import { inviteClientAction } from "@/modules/directory/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const schema = z.object({
  organizationId: z.string().uuid(),
  email: z.string().email("Invalid email address"),
});

export function InviteClientDialog({ children, organizationId }: { children: React.ReactNode; organizationId: string }) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      organizationId,
      email: "",
    },
  });

  const { execute, isExecuting } = useAction(inviteClientAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success(`Invitation sent to ${data.emailAddress}`);
        setOpen(false);
        form.reset();
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to invite client.");
    }
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    execute(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Client</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="client@example.com" {...field} />
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
                Send Invitation
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
