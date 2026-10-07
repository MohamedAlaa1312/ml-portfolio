import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      id,
      className = '',
      required,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1"
          >
            <span>{label}</span>
            {required && <span className="text-amber-500">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          disabled={disabled}
          className={`w-full bg-[#131926] border text-slate-100 text-sm rounded-xl px-4 py-3 placeholder:text-slate-500 transition-all duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed resize-y ${
            error
              ? 'border-red-500/50 focus:border-red-500'
              : 'border-white/10 hover:border-white/20 focus:border-amber-500/50'
          } ${className}`}
          {...props}
        />

        {error && <p className="text-xs text-red-400 font-mono mt-0.5">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-slate-500 font-mono mt-0.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
