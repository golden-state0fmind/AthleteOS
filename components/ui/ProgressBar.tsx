import React from 'react';

export interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  showValues?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  showPercentage = false,
  showValues = false,
  variant = 'default',
  size = 'md',
}) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isOverTarget = value > max;

  const sizeStyles = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  // Electric accent colors (Requirement 26.2)
  const variantStyles = {
    default: 'bg-accent',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  // Auto-adjust color based on percentage if default variant
  const getBarColor = () => {
    if (variant !== 'default') return variantStyles[variant];
    if (isOverTarget) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-accent';
  };

  return (
    <div className="w-full">
      {/* Label and values */}
      {(label || showPercentage || showValues) && (
        <div className="flex items-center justify-between mb-2 text-sm">
          {label && <span className="text-white/80">{label}</span>}
          <div className="flex items-center gap-2">
            {showValues && (
              <span className={`text-white/60 ${isOverTarget ? 'text-red-500' : ''}`}>
                {value.toFixed(0)} / {max.toFixed(0)}
              </span>
            )}
            {showPercentage && (
              <span className={`font-medium ${isOverTarget ? 'text-red-500' : 'text-white'}`}>
                {percentage.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* Progress bar - Dark theme (Requirements 26.1, 26.2) */}
      <div className={`w-full ${sizeStyles[size]} bg-white/10 rounded-full overflow-hidden`}>
        <div
          className={`${sizeStyles[size]} ${getBarColor()} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
    </div>
  );
};
