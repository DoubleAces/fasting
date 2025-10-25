/**
 * Entry Details Loading State
 * 
 * Skeleton UI displayed while entry details are being fetched.
 */

export default function EntryDetailsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button skeleton */}
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6" />

        {/* Main content skeleton */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 space-y-6">
          {/* Header skeleton */}
          <div className="border-b pb-4 space-y-3">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Timeline skeleton */}
          <div className="space-y-3">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-64 w-64 mx-auto bg-gray-200 rounded-full animate-pulse" />
          </div>

          {/* Meal times skeleton */}
          <div className="space-y-3">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Health metrics skeleton */}
          <div className="space-y-3">
            <div className="h-6 w-36 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-4 space-y-2">
                  <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Mood skeleton */}
          <div className="space-y-3">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-4 space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Food notes skeleton */}
          <div className="space-y-3">
            <div className="h-6 w-28 bg-gray-200 rounded animate-pulse" />
            <div className="bg-gray-100 rounded-lg p-4 space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Metadata skeleton */}
          <div className="border-t pt-4 space-y-2">
            <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
