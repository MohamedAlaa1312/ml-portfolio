import React, { forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-[#080B11] shadow-md shadow-amber-500/20 border border-amber-400/30',
  secondary:
    'bg-[#1A2234] hover:bg-[#232D45] active:bg-[#131926] text-slate-100 border border-white/10 hover:border-white/20',
  ghost:
    'bg-transparent hover:bg-white/5 active:bg-white/10 text-slate-300 hover:text-slate-100 border border-transparent',
  outline:
    'bg-transparent hover:bg-amber-500/10 active:bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:border-amber-500/60',
  destructive:
    'bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white shadow-md shadow-red-500/20 border border-red-500/30',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-2 min-h-[36px] gap-1.5 rounded-lg',
  md: 'text-sm px-5 py-2.5 min-h-[44px] gap-2 rounded-xl',
  lg: 'text-base px-6 py-3.5 min-h-[50px] gap-2.5 rounded-xl font-semibold',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium transition-all duration-200 focus-ring cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
