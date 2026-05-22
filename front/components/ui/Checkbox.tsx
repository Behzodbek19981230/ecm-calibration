'use client';

import { Check } from 'lucide-react';
import { useId } from 'react';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export default function Checkbox({ label, checked, onChange, className = '' }: CheckboxProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={['flex items-start gap-2.5 cursor-pointer select-none group', className].join(' ')}
    >
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'mt-0.5 w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center transition-all',
          checked
            ? 'bg-[hsl(205_45%_25%)] border-[hsl(205_45%_25%)]'
            : 'bg-white border-[hsl(210_20%_75%)] group-hover:border-[hsl(205_45%_35%)]',
        ].join(' ')}
      >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </button>
      {label && (
        <span className="text-sm leading-snug text-[hsl(25_80%_50%)]">{label}</span>
      )}
    </label>
  );
}
