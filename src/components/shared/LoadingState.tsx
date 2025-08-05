export function LoadingState() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center animate-fadeIn"
      data-testid="loading-state"
    >
      <div className="text-center max-w-md mx-auto px-6">
        {/* Napoleon AI Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-background font-bold text-2xl">N</span>
          </div>
          <h2 className="text-xl font-serif text-accent-gold">Napoleon AI</h2>
        </div>

        {/* Luxury Spinner */}
        <div className="relative mb-8">
          <div 
            className="w-12 h-12 border-2 border-white/20 border-t-accent-gold rounded-full animate-spin mx-auto"
            data-testid="loading-spinner"
          ></div>
          
          {/* Pulsing dots */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-accent-gold rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-accent-gold rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-accent-gold rounded-full animate-pulse delay-150"></div>
          </div>
        </div>

        {/* Executive messaging */}
        <div className="space-y-3">
          <h3 className="text-lg font-serif text-warm-ivory">
            Loading your executive inbox
          </h3>
          <p className="text-neutral-silver text-sm leading-relaxed">
            Organizing your priorities and connecting to Gmail
          </p>
        </div>

        {/* Subtle animation effect */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-gold/5 rounded-full animate-pulse blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-gold/3 rounded-full animate-pulse delay-1000 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}