'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function Select({
  label,
  options,
  value,
  onChange,
  placeholder = '— tanlang —',
  disabled = false,
  className = '',
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={['flex flex-col gap-1', className].join(' ')} ref={ref}>
      {label && (
        <label className="text-xs font-medium text-[hsl(210_15%_45%)]">{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(o => !o)}
          className={[
            'w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm text-left transition-all outline-none',
            'bg-white border-[hsl(210_20%_88%)]',
            open ? 'border-[hsl(205_45%_25%)] ring-1 ring-[hsl(205_45%_25%/0.15)]' : 'hover:border-[hsl(210_20%_75%)]',
            disabled ? 'bg-[hsl(210_15%_94%)] cursor-not-allowed opacity-60' : 'cursor-pointer',
          ].join(' ')}
        >
          <span className={selected ? 'text-[hsl(210_50%_10%)]' : 'text-[hsl(210_15%_65%)]'}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={15}
            className={['text-[hsl(210_15%_55%)] transition-transform duration-200', open ? 'rotate-180' : ''].join(' ')}
          />
        </button>

        {open && (
          <ul
            className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg overflow-hidden"
            style={{ borderColor: 'hsl(210 20% 88%)', boxShadow: '0 4px 16px 0 rgb(0 0 0 / 0.10)' }}
          >
            {options.map(opt => (
              <li
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={[
                  'flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer transition-colors',
                  opt.value === value
                    ? 'bg-[hsl(205_45%_25%)] text-white'
                    : 'text-[hsl(210_50%_10%)] hover:bg-[hsl(210_15%_94%)]',
                ].join(' ')}
              >
                {opt.label}
                {opt.value === value && <Check size={14} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
