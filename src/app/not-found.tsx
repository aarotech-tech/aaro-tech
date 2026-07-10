import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-white text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-8xl font-extrabold text-slate-800">404</h1>
        <h2 className="text-3xl font-bold">Page Not Found</h2>
        <p className="text-slate-400">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="pt-4">
          <Link href="/" className={buttonVariants({ size: "lg", className: "bg-primary text-white hover:bg-primary/90" })}>Return to Homepage</Link>
        </div>
      </div>
    </div>
  );
}
