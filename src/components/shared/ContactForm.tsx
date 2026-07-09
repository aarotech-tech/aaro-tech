"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

export function ContactForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

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
      alert("Please select your biggest challenge.");
      return;
    }

    // Re-validate phone at submit time
    const phoneVal = (e.currentTarget.elements.namedItem("phone") as HTMLInputElement)?.value?.trim() || "";
    const digits = phoneVal.replace(/\D/g, "");
    if (!phoneVal || digits.length < 7 || digits.length > 15) {
      setPhoneError("Enter a valid phone number (7-15 digits).");
      return;
    }

    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/mzdqqdao", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setIsSuccess(true);
        form.reset();
        if (onSuccess) onSuccess();
      } else {
        alert("Oops! There was a problem submitting your form.");
      }
    } catch {
      alert("Oops! There was a problem submitting your form.");
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
        <h3 className="text-2xl font-bold mb-4 text-white">Message Sent!</h3>
        <p className="text-slate-300 mb-8">
          Thank you for reaching out. We will get back to you with your free growth plan shortly.
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
          <Label htmlFor="phone" className="text-white">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+91 98765 43210"
            required
            className={`bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 ${phoneError ? "border-red-500 focus:border-red-500" : ""}`}
            onBlur={(e) => {
              const val = e.target.value.trim();
              // Accepts: optional +, digits, spaces, dashes, dots - 7 to 15 digits total
              const digits = val.replace(/\D/g, "");
              if (!val) {
                setPhoneError("Phone number is required.");
              } else if (digits.length < 7 || digits.length > 15) {
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
          <Label htmlFor="challenge" className="text-white">What is your biggest challenge right now?</Label>
          <Select name="challenge" required onValueChange={(val) => setSelectedChallenge(val ? String(val) : "")}>
            <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-white">
              <SelectValue placeholder="Select your biggest challenge..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="We need more qualified leads">We need more qualified leads</SelectItem>
              <SelectItem value="We are wasting money on ads">We are wasting money on ads</SelectItem>
              <SelectItem value="Our website is outdated">Our website is outdated</SelectItem>
              <SelectItem value="We have low website traffic (SEO)">We have low website traffic (SEO)</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedChallenge === "Other" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label htmlFor="otherChallenge" className="text-white">Please specify your challenge</Label>
            <Input id="otherChallenge" name="otherChallenge" placeholder="Tell us more about your challenge..." required className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500" />
          </div>
        )}

        <Button type="submit" size="lg" className="w-full text-base bg-primary text-white hover:bg-primary/90" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Get My Free Growth Plan"}
        </Button>
      </form>
    </>
  );
}
