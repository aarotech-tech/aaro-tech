"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ClientError({
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
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-4">
      <div className="bg-orange-100 p-4 rounded-full text-orange-600 mb-2">
        <AlertTriangle size={48} />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900">Oops, something went wrong!</h2>
      <p className="text-gray-500 max-w-md">
        We ran into an unexpected error. Don't worry, our team has been alerted.
      </p>
      <div className="pt-4">
        <Button onClick={() => reset()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Try again
        </Button>
      </div>
    </div>
  );
}
