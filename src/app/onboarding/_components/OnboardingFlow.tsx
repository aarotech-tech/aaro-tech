"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, UserCircle, Briefcase, FileText, ArrowRight } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { completeOnboardingAction } from "@/modules/portal/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function OnboardingFlow({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const { execute, isExecuting } = useAction(completeOnboardingAction, {
    onSuccess: () => {
      toast.success("Welcome to your Portal!");
      router.push("/portal/home");
    },
    onError: () => {
      toast.error("Failed to complete onboarding. Please try again.");
    }
  });

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      execute({});
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-3 text-gray-900">Welcome to your Client Portal</h1>
        <p className="text-gray-600">Let's take a quick tour before you get started.</p>
      </div>

      {/* Progress Bar */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= i ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'
              }`}>
                {step > i ? <CheckCircle2 className="w-6 h-6" /> : i}
              </div>
              {i < 3 && (
                <div className={`h-1 w-12 mx-2 rounded ${step > i ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card className="border-0 shadow-lg bg-white/50 backdrop-blur">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-blue-100 text-blue-600 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                <UserCircle className="w-8 h-8" />
              </div>
              <CardTitle className="text-xl">Manage Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-600">
              <p>Keep your contact details up to date in the Settings tab. A complete profile ensures you never miss important updates about your projects.</p>
            </CardContent>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-indigo-100 text-indigo-600 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                <Briefcase className="w-8 h-8" />
              </div>
              <CardTitle className="text-xl">Track Your Projects</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-600">
              <p>View real-time progress on your active projects. Check the task board, review milestones, and approve deliverables seamlessly.</p>
            </CardContent>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-green-100 text-green-600 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <CardTitle className="text-xl">Invoices & Documents</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-600">
              <p>Access all your proposals, invoices, and shared assets in one place. You can also securely receive payment instructions directly from the billing dashboard.</p>
            </CardContent>
          </div>
        )}

        <CardFooter className="flex justify-center pt-6 pb-8">
          <Button onClick={nextStep} className="w-full max-w-sm h-12 text-lg rounded-full" disabled={isExecuting}>
            {isExecuting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {step === 3 ? "Let's Go!" : "Next"}
            {step < 3 && <ArrowRight className="ml-2 w-5 h-5" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
