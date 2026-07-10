"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in the future
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-white text-center">
      <div className="max-w-md space-y-6">
        <h2 className="text-3xl font-bold">Something went wrong!</h2>
        <p className="text-slate-400">
          We apologize for the inconvenience. Our team has been notified of this issue.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => reset()} className="bg-primary text-white hover:bg-primary/90">
            Try again
          </Button>
          <Button asChild variant="outline" className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
