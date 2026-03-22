import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Minimum 44x44px touch target (Requirement 25.3)
  const sizeStyles = {
    sm: 'min-h-[44px] min-w-[44px] px-4 py-2 text-sm',
    md: 'min-h-[44px] min-w-[44px] px-6 py-3 text-base',
    lg: 'min-h-[44px] min-w-[44px] px-8 py-4 text-lg',
  };

  // Dark theme with electric accent (Requirements 26.1, 26.2)
  const variantStyles = {
    primary: 'bg-accent text-white hover:bg-accent/90 active:bg-accent/80',
    secondary: 'bg-white/10 text-white hover:bg-white/20 active:bg-white/15',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
