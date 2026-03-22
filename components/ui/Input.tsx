import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = React.useId();
  const finalId = id || inputId;

  // Dark theme with accent color (Requirements 26.1, 26.2)
  const baseStyles = 'w-full min-h-[44px] px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 transition-colors duration-200';
  const normalStyles = 'border-white/10 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';
  const errorStyles = 'border-red-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20';

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={finalId} className="block text-sm font-medium text-white/80 mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={finalId}
        className={`${baseStyles} ${error ? errorStyles : normalStyles} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-white/60">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
