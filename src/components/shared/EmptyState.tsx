export function EmptyState() {
  return (
    <div 
      className="flex items-center justify-center min-h-[60vh]"
      data-testid="empty-state"
    >
      <div className="text-center max-w-md mx-auto px-6">
        {/* Executive crown icon */}
        <div className="mb-8">
          <div 
            className="w-20 h-20 mx-auto mb-6 flex items-center justify-center"
            data-testid="empty-state-icon"
          >
            <svg 
              className="w-16 h-16 text-accent-gold" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
              <path d="M8 21L9 14L2 14L9 14L8 21Z" />
              <path d="M16 21L15 14L22 14L15 14L16 21Z" />
            </svg>
          </div>
          <h2 className="text-xl font-serif text-accent-gold mb-2">Napoleon AI</h2>
          <p className="text-xs text-neutral-silver">Executive Intelligence</p>
        </div>

        {/* Empty state messaging */}
        <div className="space-y-4">
          <h3 className="text-2xl font-serif text-warm-ivory">
            Your inbox is clear
          </h3>
          <p className="text-neutral-silver leading-relaxed">
            All communications have been processed. Your executive attention can be focused elsewhere.
          </p>
        </div>

        {/* Action suggestion */}
        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-sm text-neutral-silver">
            New emails will appear here automatically as they arrive in your Gmail inbox.
          </p>
        </div>

        {/* Elegant decoration */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            <div className="w-1 h-1 bg-accent-gold rounded-full opacity-60"></div>
            <div className="w-1 h-1 bg-accent-gold rounded-full opacity-40"></div>
            <div className="w-1 h-1 bg-accent-gold rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}