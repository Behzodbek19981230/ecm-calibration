'use client';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function RadioGroup({ label, options, value, onChange, className = '' }: RadioGroupProps) {
  return (
    <div className={className}>
      {label && (
        <p className="text-xs font-medium mb-2 text-[hsl(210_15%_45%)]">{label}</p>
      )}
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => onChange(opt.value)}
          >
            <span
              className={[
                'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                value === opt.value
                  ? 'border-[hsl(205_45%_25%)]'
                  : 'border-[hsl(210_20%_75%)] group-hover:border-[hsl(205_45%_35%)]',
              ].join(' ')}
            >
              {value === opt.value && (
                <span className="w-2 h-2 rounded-full bg-[hsl(205_45%_25%)]" />
              )}
            </span>
            <span className="text-sm text-[hsl(210_50%_10%)]">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
