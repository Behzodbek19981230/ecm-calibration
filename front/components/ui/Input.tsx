'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-[hsl(210_15%_45%)]">{label}</label>
      )}
      <input
        ref={ref}
        className={[
          'w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all',
          error
            ? 'bg-red-50 border-red-400 text-[hsl(210_50%_10%)] focus:border-red-500 focus:ring-1 focus:ring-red-200'
            : 'bg-white border-[hsl(210_20%_88%)] text-[hsl(210_50%_10%)] focus:border-[hsl(205_45%_25%)] focus:ring-1 focus:ring-[hsl(205_45%_25%/0.15)]',
          'placeholder:text-[hsl(210_15%_65%)]',
          'disabled:bg-[hsl(210_15%_94%)] disabled:cursor-not-allowed',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
