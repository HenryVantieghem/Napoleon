import type { PriorityTier } from '@/lib/types';

interface PriorityBadgeProps {
  tier: PriorityTier;
  score: number;
  className?: string;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PriorityBadge({ 
  tier, 
  score, 
  className = '', 
  showScore = false,
  size = 'md' 
}: PriorityBadgeProps) {
  const getTierConfig = (tier: PriorityTier) => {
    switch (tier) {
      case 'gold':
        return {
          bgColor: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
          textColor: 'text-yellow-900',
          borderColor: 'border-yellow-500',
          glowColor: 'shadow-yellow-500/20',
          name: 'Gold',
          icon: '👑',
          description: 'Requires immediate executive attention'
        };
      case 'silver':
        return {
          bgColor: 'bg-gradient-to-r from-gray-300 to-gray-500',
          textColor: 'text-gray-900',
          borderColor: 'border-gray-400',
          glowColor: 'shadow-gray-500/20',
          name: 'Silver',
          icon: '⭐',
          description: 'Important business matter'
        };
      case 'bronze':
        return {
          bgColor: 'bg-gradient-to-r from-orange-400 to-orange-600',
          textColor: 'text-orange-900',
          borderColor: 'border-orange-500',
          glowColor: 'shadow-orange-500/20',
          name: 'Bronze',
          icon: '📋',
          description: 'Routine business communication'
        };
      case 'standard':
        return {
          bgColor: 'bg-gradient-to-r from-gray-500 to-gray-600',
          textColor: 'text-gray-100',
          borderColor: 'border-gray-500',
          glowColor: 'shadow-gray-500/10',
          name: 'Standard',
          icon: '📄',
          description: 'Informational content'
        };
    }
  };

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'text-xs',
          score: 'text-xs ml-1'
        };
      case 'md':
        return {
          container: 'px-3 py-1.5 text-sm',
          icon: 'text-sm',
          score: 'text-sm ml-1.5'
        };
      case 'lg':
        return {
          container: 'px-4 py-2 text-base',
          icon: 'text-base',
          score: 'text-base ml-2'
        };
    }
  };

  const config = getTierConfig(tier);
  const sizeClasses = getSizeClasses(size);

  return (
    <div
      className={`
        inline-flex items-center rounded-full font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor} ${config.glowColor}
        border shadow-lg
        ${sizeClasses.container}
        ${className}
      `}
      title={`${config.name} Priority (${score}/10) - ${config.description}`}
    >
      <span className={sizeClasses.icon} role="img" aria-label={`${config.name} priority`}>
        {config.icon}
      </span>
      <span className="ml-1 font-semibold">
        {config.name}
      </span>
      {showScore && (
        <span className={`${sizeClasses.score} font-bold opacity-90`}>
          {score.toFixed(1)}
        </span>
      )}
    </div>
  );
}