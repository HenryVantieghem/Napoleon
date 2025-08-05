interface ErrorStateProps {
  message: string;
  onRefresh: () => void;
  onReconnect: () => void;
}

export function ErrorState({ message, onRefresh, onReconnect }: ErrorStateProps) {
  const isAuthError = message.includes('expired') || message.includes('permissions') || message.includes('access');

  return (
    <div 
      className="flex items-center justify-center min-h-[60vh]"
      data-testid="error-state"
    >
      <div className="text-center max-w-md mx-auto px-6">
        {/* Error icon */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-500/10 rounded-full">
            <svg 
              className="w-8 h-8 text-red-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>

        {/* Error messaging */}
        <div className="space-y-4">
          <h3 className="text-xl font-serif text-warm-ivory">
            Unable to load your emails
          </h3>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 text-sm">{message}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 space-y-3">
          {isAuthError ? (
            <button
              onClick={onReconnect}
              className="w-full px-6 py-3 bg-accent-gold text-primary-background rounded-full font-semibold hover:bg-accent-gold/90 transition-colors"
            >
              Reconnect Gmail Account
            </button>
          ) : (
            <button
              onClick={onRefresh}
              className="w-full px-6 py-3 bg-accent-gold text-primary-background rounded-full font-semibold hover:bg-accent-gold/90 transition-colors"
            >
              Try Again
            </button>
          )}
          
          <button
            onClick={onRefresh}
            className="w-full px-6 py-2 text-neutral-silver border border-white/20 rounded-full hover:bg-white/5 transition-colors"
          >
            Refresh Page
          </button>
        </div>

        {/* Help text */}
        <div className="mt-6">
          <p className="text-xs text-neutral-silver">
            If the problem persists, please check your internet connection or contact support.
          </p>
        </div>
      </div>
    </div>
  );
}