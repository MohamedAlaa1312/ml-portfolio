import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      helperText,
      error,
      id,
      className = '',
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1"
          >
            <span>{label}</span>
            {required && <span className="text-amber-500">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            disabled={disabled}
            className={`w-full bg-[#131926] border text-slate-100 text-sm rounded-xl px-4 py-3 appearance-none transition-all duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
              error
                ? 'border-red-500/50 focus:border-red-500'
                : 'border-white/10 hover:border-white/20 focus:border-amber-500/50'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#0D111A] text-slate-100">
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
            ▼
          </div>
        </div>

        {error && <p className="text-xs text-red-400 font-mono mt-0.5">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-slate-500 font-mono mt-0.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
