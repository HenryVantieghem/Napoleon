'use client'

interface LoadingSkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 rounded"></div>
    </div>
  )
}

interface MessageLoadingSkeletonProps {
  count?: number
}

export function MessageLoadingSkeleton({ count = 3 }: MessageLoadingSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div 
          key={i}
          className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {/* Header skeleton */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              <div className="h-3 w-12 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Subject skeleton */}
          <div className="h-5 bg-gray-200 rounded w-5/6 mb-3"></div>

          {/* Content skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-4/5"></div>
            <div className="h-3 bg-gray-200 rounded w-3/5"></div>
          </div>

          {/* Footer skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              <div className="h-3 w-12 bg-gray-200 rounded"></div>
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface ConnectionLoadingSkeletonProps {
  count?: number
}

export function ConnectionLoadingSkeleton({ count = 2 }: ConnectionLoadingSkeletonProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {Array.from({ length: count }, (_, i) => (
        <div 
          key={i}
          className="bg-white rounded-xl border-2 border-gray-200 p-6 animate-pulse"
          style={{ animationDelay: `${i * 0.2}s` }}
        >
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-gray-200 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div className="h-3 bg-gray-200 rounded flex-1"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Button */}
          <div className="h-10 bg-gray-200 rounded"></div>
          
          {/* Footer */}
          <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto mt-3"></div>
        </div>
      ))}
    </div>
  )
}