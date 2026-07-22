import { Skeleton } from "@/components/ui/skeleton";

export default function ClientLoading() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-900 border-gray-800 rounded-xl p-6 space-y-4 border">
            <Skeleton className="h-4 w-32 bg-gray-800" />
            <Skeleton className="h-8 w-24 bg-gray-800" />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-900 border-gray-800 rounded-xl p-6 space-y-6 border">
          <Skeleton className="h-6 w-48 bg-gray-800" />
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-gray-950 rounded-lg p-4 border border-gray-800 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-40 bg-gray-800" />
                  <Skeleton className="h-5 w-20 bg-gray-800" />
                </div>
                <Skeleton className="h-2 w-full bg-gray-800 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-900 border-gray-800 rounded-xl p-6 space-y-6 border">
          <Skeleton className="h-6 w-48 bg-gray-800" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4 py-2">
                <Skeleton className="h-10 w-10 bg-gray-800 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-40 bg-gray-800" />
                  <Skeleton className="h-3 w-24 bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
