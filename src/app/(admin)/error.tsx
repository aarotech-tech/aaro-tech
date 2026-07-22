"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
      <div className="bg-red-100 p-4 rounded-full text-red-600 mb-2">
        <AlertCircle size={48} />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900">Something went wrong</h2>
      <p className="text-gray-500 max-w-md">
        An unexpected error occurred while loading this page. Our team has been notified.
      </p>
      <div className="pt-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
      </div>
    </div>
  );
}
