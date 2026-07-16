"use client";

import { useState } from "react";
import { promoteLeadToDeal } from "@/app/actions/leads";

export default function PromoteLeadButton({ leadId }: { leadId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePromote = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await promoteLeadToDeal(leadId);
      if (!result.success) {
        setError(result.error || "Failed to promote");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 items-end">
      <button
        onClick={handlePromote}
        disabled={isLoading}
        className="px-3 py-1.5 text-xs font-medium rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
      >
        {isLoading ? "Promoting..." : "Promote to Deal"}
      </button>
      {error && <span className="text-[10px] text-red-500">{error}</span>}
    </div>
  );
}
