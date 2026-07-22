"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";


export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string; status?: number };
  reset: () => void;
}) {
  useEffect(() => {
    // Determine if it's an expected or unexpected error
    const isExpected = error.name === "UnauthorizedError" || error.name === "ForbiddenError" || error.status === 404;
    
    if (!isExpected) {
      // Log unexpected errors internally without exposing stack traces to users
      console.error("Unexpected Global Error:", { message: error.message, name: error.name });
      Sentry.captureException(error);
    }
  }, [error]);

  const isForbidden = error.name === "ForbiddenError" || error.message.includes("Forbidden");
  const isUnauthorized = error.name === "UnauthorizedError" || error.message.includes("Unauthorized");

  let title = "Something went wrong";
  let message = "We encountered an unexpected error. Our team has been notified.";

  if (isForbidden) {
    title = "Access Denied";
    message = "You do not have permission to view this resource.";
  } else if (isUnauthorized) {
    title = "Authentication Required";
    message = "Please log in to continue.";
  }

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="text-lg text-gray-600 mb-8">{message}</p>
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
