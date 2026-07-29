import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm font-medium">Loading proposal details...</p>
      </div>
    </div>
  );
}
