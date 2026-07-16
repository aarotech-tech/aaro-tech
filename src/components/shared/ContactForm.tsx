"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import { submitContactForm } from "@/app/actions/contact";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Re-validate email at submit time
    const emailVal = (e.currentTarget.elements.namedItem("email") as HTMLInputElement)?.value?.trim() || "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailVal && !emailRegex.test(emailVal)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    // Validate challenge selection
    if (!selectedChallenge) {
      setSubmitError("Please select your biggest challenge.");
      return;
    }

    // Re-validate phone at submit time if provided
    const phoneVal = (e.currentTarget.elements.namedItem("phone") as HTMLInputElement)?.value?.trim() || "";
    if (phoneVal) {
      const digits = phoneVal.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        setPhoneError("Enter a valid phone number (7-15 digits).");
        return;
      }
    }

    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const result = await submitContactForm(formData);

      if (result.success) {
        setIsSuccess(true);
        form.reset();
        setSubmitError("");
        sendGAEvent("event", "generate_lead", { value: 1, currency: "USD" });
        if (onSuccess) onSuccess();
      } else {
        setSubmitError(result.error || "Oops! There was a problem submitting your form. Please try again.");
      }
    } catch {
      setSubmitError("Oops! There was a problem submitting your form. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
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
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Full Name</Label>
          <Input id="name" name="name" placeholder="John Doe" required className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-white">Business Name</Label>
          <Input id="businessName" name="businessName" placeholder="Acme Corp" required className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            className={`bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 ${emailError ? "border-red-500 focus:border-red-500" : ""}`}
            onBlur={(e) => {
              const val = e.target.value.trim();
              if (!val) { setEmailError(""); return; } // optional field
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(val)) {
                setEmailError("Enter a valid email address (e.g. you@company.com).");
              } else {
                setEmailError("");
              }
            }}
            onChange={() => emailError && setEmailError("")}
          />
          {emailError && (
            <p className="text-red-400 text-xs mt-1">{emailError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white">Phone Number (Optional)</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+91 98765 43210"
            className={`bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 ${phoneError ? "border-red-500 focus:border-red-500" : ""}`}
            onBlur={(e) => {
              const val = e.target.value.trim();
              if (!val) {
                setPhoneError("");
                return;
              }
              const digits = val.replace(/\D/g, "");
              if (digits.length < 7 || digits.length > 15) {
                setPhoneError("Enter a valid phone number (7-15 digits).");
              } else {
                setPhoneError("");
              }
            }}
            onChange={() => phoneError && setPhoneError("")}
          />
          {phoneError && (
            <p className="text-red-400 text-xs mt-1">{phoneError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="challenge" className="text-white">{challengeLabel}</Label>
          <Select name="challenge" required onValueChange={(val) => setSelectedChallenge(val ? String(val) : "")}>
            <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-white">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {challengeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedChallenge === "Other" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label htmlFor="otherChallenge" className="text-white">Please specify your challenge</Label>
            <Input id="otherChallenge" name="otherChallenge" placeholder="Tell us more about your challenge..." required className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500" />
          </div>
        )}

        {submitError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
            {submitError}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full text-base bg-primary text-white hover:bg-primary/90" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : ctaText}
        </Button>
      </form>
    </>
  );
}
