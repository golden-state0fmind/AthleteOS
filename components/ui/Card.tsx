import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  hover = false,
  className = '',
  ...props
}) => {
  // Dark theme card (Requirements 26.1, 26.2)
  const baseStyles = 'bg-white/5 rounded-lg border border-white/10';
  
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  // Subtle animation under 300ms (Requirement 26.4)
  const hoverStyles = hover ? 'hover:bg-white/10 hover:border-accent/50 transition-all duration-200' : '';

  return (
    <div
      className={`${baseStyles} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
