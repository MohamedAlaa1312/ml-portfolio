import React from 'react';
import Link from 'next/link';

export interface TextLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  isExternal?: boolean;
  variant?: 'amber' | 'subtle' | 'muted';
}

export const TextLink: React.FC<TextLinkProps> = ({
  href,
  children,
  isExternal = false,
  variant = 'amber',
  className = '',
  ...props
}) => {
  const variantStyles = {
    amber: 'text-amber-400 hover:text-amber-300 underline-offset-4 hover:underline',
    subtle: 'text-slate-200 hover:text-amber-400 underline-offset-4 hover:underline',
    muted: 'text-slate-400 hover:text-slate-200 underline-offset-4 hover:underline',
  };

  const content = (
    <>
      <span>{children}</span>
      {isExternal && (
        <span className="inline-block ml-1 text-xs opacity-70">↗</span>
      )}
    </>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center transition-colors focus-ring rounded ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={`inline-flex items-center transition-colors focus-ring rounded ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {content}
    </Link>
  );
};
