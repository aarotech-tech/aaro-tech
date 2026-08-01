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
import { createManualProjectAction } from "@/modules/delivery/actions";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const schema = z.object({
  organizationId: z.string().uuid("Please select a client"),
  name: z.string().min(1, "Project name is required"),
  value: z.number().nonnegative("Value must be non-negative").optional(),
});

interface CreateProjectModalProps {
  children: React.ReactNode;
  organizations: { id: string; name: string }[];
}

export function CreateProjectModal({ children, organizations }: CreateProjectModalProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      organizationId: "",
      name: "",
      value: 0,
    },
  });

  const { execute, isExecuting } = useAction(createManualProjectAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success("Project created successfully");
        setOpen(false);
        form.reset();
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to create project");
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
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
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
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Q3 Marketing Campaign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Value ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" min="0" placeholder="0" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
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
                Create Project
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
