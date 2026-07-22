"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import { submitContactForm } from "@/actions/contact";
import { contactFormSchema } from "@/lib/validations/contact";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

export interface ContactFormProps {
  onSuccess?: () => void;
  ctaText?: string;
  successTitle?: string;
  successMessage?: string;
  challengeLabel?: string;
  challengeOptions?: string[];
}

export function ContactForm({
  onSuccess,
  ctaText = "Get My Free Growth Plan",
  successTitle = "Message Sent!",
  successMessage = "Thank you for reaching out. We will get back to you with your free growth plan shortly.",
  challengeLabel = "What is your biggest challenge right now?",
  challengeOptions = [
    "We need more qualified leads",
    "We are wasting money on ads",
    "Our website is outdated",
    "We have low website traffic (SEO)",
    "Other",
  ],
}: ContactFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      businessName: "",
      email: "",
      phone: "",
      websiteUrl: "",
      challenge: "",
      otherChallenge: "",
    },
  });

  const { execute, isExecuting, result } = useAction(submitContactForm, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        setIsSuccess(true);
        form.reset();
        sendGAEvent("event", "generate_lead", { value: 1, currency: "INR" });
        if (onSuccess) onSuccess();
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Oops! There was a problem submitting your form. Please try again.");
    }
  });

  const selectedChallenge = form.watch("challenge");

  const onSubmit = (values: z.infer<typeof contactFormSchema>) => {
    execute(values);
  };

  if (isSuccess) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center py-12">
        <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold mb-4 text-white">{successTitle}</h3>
        <p className="text-slate-300 mb-8">
          {successMessage}
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="rounded-xl border border-slate-600 hover:border-slate-500 bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Business Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Corp" className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@company.com" className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Website URL (Optional)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://yourwebsite.com" className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+91 98765 43210" className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="challenge"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">{challengeLabel}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-white">
                    <SelectValue placeholder="Select an option..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-slate-900 border-slate-800 text-white shadow-xl">
                  {challengeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedChallenge === "Other" && (
          <FormField
            control={form.control}
            name="otherChallenge"
            render={({ field }) => (
              <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                <FormLabel className="text-white">Please specify your challenge</FormLabel>
                <FormControl>
                  <Input placeholder="Tell us more about your challenge..." className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" size="lg" className="w-full text-base bg-primary text-white hover:bg-primary/90" disabled={isExecuting}>
          {isExecuting ? "Sending..." : ctaText}
        </Button>
      </form>
    </Form>
  );
}
