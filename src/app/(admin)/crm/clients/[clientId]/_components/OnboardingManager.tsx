"use client";

import { useState } from "react";
import { CheckCircleIcon, CircleIcon } from "lucide-react";
import { toggleOnboardingStep } from "../actions";
import { Button } from "@/components/ui/button";

type Step = {
  id: string;
  title: string;
  status: string | null;
};

export default function OnboardingManager({ clientId, steps }: { clientId: string, steps: Step[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggle(stepId: string, currentStatus: string | null) {
    setLoadingId(stepId);
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    await toggleOnboardingStep(clientId, stepId, newStatus);
    setLoadingId(null);
  }

  const completedCount = steps.filter(s => s.status === "completed").length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Onboarding Checklist</h3>
        <span className="text-sm font-medium text-gray-500">{completedCount} of {steps.length} completed</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className={`h-2 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'} transition-all duration-500`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="space-y-3">
        {steps.map(step => {
          const isCompleted = step.status === "completed";
          const isLoading = loadingId === step.id;
          return (
            <div key={step.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-center">
                <button 
                  onClick={() => handleToggle(step.id, step.status)}
                  disabled={isLoading}
                  className="mr-3 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
                >
                  {isCompleted ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  ) : (
                    <CircleIcon className="w-6 h-6" />
                  )}
                </button>
                <span className={`text-sm font-medium ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {step.title}
                </span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {isCompleted ? "Completed" : "Pending"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
